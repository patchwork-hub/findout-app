import AccountAvatar from '@/components/molecules/feed/AccountAvatar/AccountAvatar';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Button } from '../../common/Button/Button';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import {
	useUserRelationshipMutation,
	useFollowRequestsMutation,
} from '@/hooks/mutations/profile.mutation';
import { CheckRelationshipQueryKey } from '@/types/queries/profile.type';
import { queryClient } from '@/App';
import Toast from 'react-native-toast-message';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import { useAuthStore } from '@/store/auth/authStore';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

interface SearchedUserSuggestionProps {
	item: Patchwork.Account;
	relationship: Patchwork.RelationShip | undefined;
	accountIds: string[];
}

const SearchedUserSuggestion = ({
	item,
	relationship,
	accountIds,
}: SearchedUserSuggestionProps) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const navigation = useNavigation();
	const { userInfo } = useAuthStore();

	const isAuthor = useMemo(() => {
		return userInfo?.id === item.id;
	}, [item, userInfo?.id]);

	const isCancelableRequest = useMemo(() => {
		return !!(item.locked && relationship?.requested);
	}, [item.locked, relationship?.requested]);

	const displayRelationshipText = useMemo(() => {
		if (relationship?.following) return t('timeline.unfollow');
		if (relationship?.requested && item.locked)
			return t('timeline.cancel_request');
		if (relationship?.requested) return t('timeline.requested');
		if (item.locked) return t('timeline.request_follow');
		return t('timeline.follow');
	}, [relationship?.following, relationship?.requested, item.locked, t]);

	const brandColor = useMemo(() => {
		if (isCancelableRequest) return customColor['patchwork-red-600'];
		return colorScheme === 'dark'
			? customColor['patchwork-light-900']
			: customColor['patchwork-dark-100'];
	}, [isCancelableRequest, colorScheme]);

	const { mutate, isPending } = useUserRelationshipMutation({
		onSuccess: (newRelationship, { accountId: acctId }) => {
			const relationshipQueryKey: CheckRelationshipQueryKey = [
				'check-relationship-to-other-accounts',
				{ accountIds },
			];

			queryClient.setQueryData<Patchwork.RelationShip[]>(
				relationshipQueryKey,
				old => {
					if (!old) return [newRelationship];
					return old.map(rel =>
						rel.id === acctId ? { ...rel, ...newRelationship } : rel,
					);
				},
			);
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { mutate: handleFollowRequest, isPending: isFollowRequestPending } =
		useFollowRequestsMutation({
			onSuccess: (newRelationship, { accountId: acctId }) => {
				const relationshipQueryKey: CheckRelationshipQueryKey = [
					'check-relationship-to-other-accounts',
					{ accountIds },
				];

				queryClient.setQueryData<Patchwork.RelationShip[]>(
					relationshipQueryKey,
					old => {
						if (!old) return [newRelationship];
						return old.map(rel =>
							rel.id === acctId ? { ...rel, ...newRelationship } : rel,
						);
					},
				);
			},
			onError: e => {
				Toast.show({
					type: 'errorToast',
					text1: e.message,
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
				});
			},
		});

	const onMakeRelationship = useCallback(() => {
		mutate({
			accountId: item.id,
			isFollowing: relationship?.following || relationship?.requested || false,
		});
	}, [mutate, item.id, relationship]);

	return (
		<View className="items-center mr-4 my-1">
			<AccountAvatar
				account={item}
				size={'md'}
				className="w-[110]"
				onPress={() => {
					if (isAuthor) {
						navigation.navigate('Profile', {
							id: item.id,
						});
					} else {
						navigation.navigate('ProfileOther', {
							id: item.id,
						});
					}
				}}
			/>
			{!isAuthor &&
				(relationship?.requested_by ? (
					<Button
						disabled={isFollowRequestPending}
						size="sm"
						variant={'default'}
						className="mt-2 rounded-3xl bg-green-600 dark:bg-green-600"
						onPress={() => {
							handleFollowRequest({
								accountId: item.id,
								requestType: 'authorize',
							});
						}}
					>
						{isFollowRequestPending ? (
							<Flow size={25} color="#ffffff" />
						) : (
							<ThemeText size={'fs_13'} className="text-white">
								{t('common.accept_request')}
							</ThemeText>
						)}
					</Button>
				) : (
					<Button
						disabled={isPending}
						size="sm"
						variant={'outline'}
						className={`mt-2 rounded-3xl ${
							isCancelableRequest
								? 'border-[0.5px] border-patchwork-red-600'
								: ''
						}`}
						onPress={onMakeRelationship}
					>
						{isPending ? (
							<Flow size={25} color={brandColor} />
						) : (
							<ThemeText size={'fs_13'} style={{ color: brandColor }}>
								{displayRelationshipText}
							</ThemeText>
						)}
					</Button>
				))}
		</View>
	);
};

export default SearchedUserSuggestion;
