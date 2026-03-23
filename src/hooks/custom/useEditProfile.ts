import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth/authStore';
import {
	useDeleteProfileMediaMutation,
	useProfileMutation,
} from '@/hooks/mutations/profile.mutation';
import { queryClient } from '@/App';
import {
	AccountInfoQueryKey,
	UpdateProfilePayload,
} from '@/types/queries/profile.type';
import { useProfileMediaStore } from '@/store/profile/useProfileMediaStore';
import { cleanText } from '@/util/helper/cleanText';
import { DEFAULT_INSTANCE } from '@/util/constant';
import Toast from 'react-native-toast-message';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { BottomBarHeight, useGradualAnimation } from './useGradualAnimation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedStyle } from 'react-native-reanimated';
import { Platform } from 'react-native';
import { DefaultBioTextForChannel } from '@/util/constant/socialMediaLinks';
import { useTranslation } from 'react-i18next';
import { extractPlainText } from '@/util/helper/helper';
import { screen } from '@testing-library/react-native';
import { InfiniteData } from '@tanstack/react-query';
import { PagedResponse } from '@/util/helper/timeline';
import { updateAccountInStatus } from '@/util/cache/profile/profileCache';

export type ProfileType = {
	display_name?: string;
	bio?: string;
	metadata: { name: string; value: string }[];
};

export const useEditProfile = (fromVerification?: boolean) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const {
		userInfo,
		actions: { setUserInfo },
	} = useAuthStore();
	const [profile, setProfile] = useState<ProfileType>();
	const { header, avatar, actions } = useProfileMediaStore();
	const { height } = useGradualAnimation();
	const { top } = useSafeAreaInsets();
	const [delConfAction, setDelConfAction] = useState<{
		visible: boolean;
		title?: 'header' | 'avatar';
	}>({ visible: false });

	useEffect(() => {
		if (userInfo) {
			const metadata = [];
			const fields = Array.isArray(userInfo.fields) ? userInfo.fields : [];
			for (let i = 0; i < 4; i++) {
				metadata.push({
					name: extractPlainText(fields[i]?.name ?? ''),
					value: extractPlainText(fields[i]?.value ?? ''),
				});
			}
			setProfile({
				display_name: userInfo.display_name,
				bio: cleanText(userInfo?.note) || '',
				metadata,
			});
			actions.onSelectMedia(
				'avatar',
				userInfo?.avatar || userInfo.avatar_static,
			);
			actions.onSelectMedia(
				'header',
				userInfo.header || userInfo.header_static,
			);
		}
	}, [userInfo]);

	const acctInfoQueryKey: AccountInfoQueryKey = [
		'get_account_info',
		{ id: userInfo?.id!, domain_name: process.env.API_URL ?? DEFAULT_INSTANCE },
	];

	const timelineQueryKeys = [
		[
			'channel-feed',
			{
				domain_name: DEFAULT_INSTANCE,
				only_media: false,
				remote: false,
				local: true,
			},
		],
		[
			'account-detail-feed',
			{
				domain_name: process.env.API_URL ?? DEFAULT_INSTANCE,
				account_id: userInfo?.id,
				exclude_replies: true,
				exclude_reblogs: true,
				exclude_original_statuses: false,
			},
		],
	];

	// mutations
	const { mutateAsync, isPending: isUpdatingProfile } = useProfileMutation({
		onSuccess: async response => {
			setUserInfo(response);
			await queryClient.invalidateQueries({ queryKey: acctInfoQueryKey });

			await Promise.all(
				timelineQueryKeys.map(key =>
					queryClient.invalidateQueries({ queryKey: key }),
				),
			);

			const updatedAccountData = {
				fields: response.fields,
				display_name: response.display_name,
				avatar: response.avatar,
				header: response.header,
			};

			queryClient.setQueriesData<
				InfiniteData<PagedResponse<Patchwork.Status[]>>
			>({ queryKey: ['account-detail-feed'] }, oldData => {
				if (!oldData) return oldData;

				return {
					...oldData,
					pages: oldData.pages.map(page => ({
						...page,
						data: page.data.map(status =>
							updateAccountInStatus(status, userInfo?.id!, updatedAccountData),
						),
					})),
				};
			});

			queryClient.setQueriesData<Patchwork.Status>(
				{ queryKey: ['status'] },
				oldData => {
					if (!oldData) return oldData;
					return updateAccountInStatus(
						oldData,
						userInfo?.id!,
						updatedAccountData,
					);
				},
			);

			navigation.goBack();

			Toast.show({
				type: 'successToast',
				text1: t('timeline.profile_update_success'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
		onError: error => {
			Toast.show({
				type: 'errorToast',
				text1: error?.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
				visibilityTime: 1000,
				onHide: () => {
					actions.onSelectMedia('header', []);
					actions.onSelectMedia('avatar', []);
					navigation.navigate('Index', {
						screen: 'Home',
						params: {
							screen: 'HomeFeed',
						},
					});
				},
			});
		},
	});
	const { mutate: deleteMedia, isPending: isDeletingMedia } =
		useDeleteProfileMediaMutation({
			onSuccess: (response, variables) => {
				actions.onSelectMedia(variables.mediaType, []);
				queryClient.invalidateQueries({ queryKey: acctInfoQueryKey });

				timelineQueryKeys.forEach(key => {
					queryClient.invalidateQueries({ queryKey: key });
				});

				setUserInfo(response);
				Toast.show({
					text1: t('toast.media_deleted', { media: variables.mediaType }),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
					visibilityTime: 1000,
				});
			},
			onError: error => {
				Toast.show({
					type: 'errorToast',
					text1: error?.message || t('common.error'),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
					visibilityTime: 1000,
				});
			},
		});

	const handleUpdateProfile = async () => {
		const displayName = profile?.display_name ?? '';
		const bio = profile?.bio ?? '';

		let payload: UpdateProfilePayload = {
			display_name: displayName,
			note: userInfo?.note?.includes(DefaultBioTextForChannel)
				? bio
					? bio + ' ' + DefaultBioTextForChannel
					: DefaultBioTextForChannel
				: bio,
		};

		payload.avatar =
			typeof avatar.selectedMedia === 'string'
				? avatar.selectedMedia
				: avatar.selectedMedia[0] || null;
		payload.header =
			typeof header.selectedMedia === 'string'
				? header.selectedMedia
				: header.selectedMedia[0] || null;

		const fields_attributes: { name: string; value: string }[] = [];
		profile?.metadata?.forEach(meta => {
			if (typeof meta.name === 'string' && typeof meta.value === 'string') {
				fields_attributes.push({ name: meta.name, value: meta.value });
			}
		});
		payload.fields_attributes = fields_attributes;
		mutateAsync(payload);
	};

	const handlePressDelConf = () => {
		if (delConfAction.title) {
			setDelConfAction({ visible: false });

			deleteMedia({ mediaType: delConfAction.title });
		}
	};

	const virtualKeyboardContainerStyle = useAnimatedStyle(() => {
		return {
			height:
				height.value > BottomBarHeight ? height.value - BottomBarHeight : 0,
		};
	});

	return {
		profile,
		setProfile,
		userInfo,
		header,
		avatar,
		actions,
		top,
		delConfAction,
		setDelConfAction,
		handleUpdateProfile,
		handlePressDelConf,
		isUpdatingProfile,
		isDeletingMedia,
		virtualKeyboardContainerStyle,
	};
};
