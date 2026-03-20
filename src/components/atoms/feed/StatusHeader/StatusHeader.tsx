import { Pressable, View, ViewProps } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Button } from '@/components/atoms/common/Button/Button';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
	checkIsAccountVerified,
	timelineDateFormatter,
} from '@/util/helper/helper';
import { useUserRelationshipMutation } from '@/hooks/mutations/profile.mutation';
import { createRelationshipQueryKey } from '@/hooks/queries/profile.queries';
import { queryClient } from '@/App';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth/authStore';
import { ProfileNameRedMark } from '@/util/svg/icon.profile';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import Image from '../../common/Image/Image';
import { getVisibilityIcons } from '@/util/constant/visibilityIcons';
import moment from 'moment';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { cn } from '@/util/helper/twutil';
import UserRole from '../../profile/UserRole/UserRole';
import StatusMenu from '../StatusMenu/StatusMenu';

dayjs.extend(relativeTime);

type Props = {
	status: Patchwork.Status;
	showAvatarIcon?: boolean;
	showFollowIcon?: boolean;
	imageSize?: string;
	relationships?: Patchwork.RelationShip[];
	isFromNoti?: boolean;
	isFromQuoteCompose?: boolean;
	isQuoteView?: boolean;
} & ViewProps;

const StatusHeader = ({
	status,
	showAvatarIcon = false,
	showFollowIcon = false,
	imageSize = '',
	relationships,
	isFromNoti,
	isFromQuoteCompose = false,
	isQuoteView = false,
	...props
}: Props) => {
	const { t } = useTranslation();
	const navigation =
		useNavigation<StackNavigationProp<HomeStackParamList, 'ProfileOther'>>();
	const { userInfo } = useAuthStore();
	const { colorScheme } = useColorScheme();
	const visibilityIcons = getVisibilityIcons(colorScheme);
	const defaultAvatarBgColor =
		colorScheme === 'dark'
			? customColor['patchwork-primary-dark'].replace('#', '')
			: customColor['patchwork-primary'].replace('#', '');

	const isAuthor = useMemo(() => {
		return userInfo?.id === status?.account?.id;
	}, [status?.account?.id, userInfo?.id]);

	const isQuotedStatus = !!status.quote?.quoted_status;
	const isMyStatusQuoted = !!isAuthor && !!isQuotedStatus;

	const { mutate, isPending } = useUserRelationshipMutation({
		onSuccess: (newRelationship, { accountId }) => {
			const relationshipQueryKey = createRelationshipQueryKey([accountId]);

			queryClient.setQueryData<Patchwork.RelationShip[]>(
				relationshipQueryKey,
				old => {
					if (!old) return [newRelationship];
					return old.map(rel =>
						rel.id === accountId ? { ...rel, ...newRelationship } : rel,
					);
				},
			);
		},
	});

	const onMakeRelationship = () => {
		mutate({
			accountId: status.account.id,
			isFollowing: relationships ? relationships[0]?.following : false,
		});
	};

	const isAccVerified = useMemo(
		() => checkIsAccountVerified(status?.account?.fields || []),
		[status?.account?.fields],
	);

	const getImageUrl = () => {
		// if (status.account.avatar.includes('avatars/original/missing.png')) {
		// 	`https://ui-avatars.com/api/?name=${encodeURIComponent(
		// 		userInfo?.display_name || userInfo?.username || 'User',
		// 	)}&size=128&background=${defaultAvatarBgColor}&color=${
		// 		colorScheme === 'dark' ? '000000' : 'ffffff'
		// 	}`;
		// }

		return status?.account?.avatar;
	};

	if (!status?.account) {
		return null;
	}

	return (
		<View className="">
			<View className="flex flex-row items-center mb-1" {...props}>
				<Pressable
					disabled={isFromQuoteCompose}
					onPress={() => {
						isAuthor
							? navigation.navigate('Profile', { id: status.account.id })
							: navigation.push('ProfileOther', {
									id: status.account.id,
									isFromNoti: isFromNoti,
							  });
					}}
					className="flex-row items-center active:opacity-80 flex-shrink"
				>
					{showAvatarIcon === true && (
						<Image
							source={{
								uri: getImageUrl(),
							}}
							className={`w-5 h-5 rounded-full bg-slate-300 mr-2 ${imageSize}`}
							iconSize={28}
						/>
					)}
					<View className="flex-1">
						<View className="flex-row items-center flex-wrap">
							<ThemeText
								emojis={status.account.emojis}
								className="font-NewsCycle_Bold"
							>
								{status.account.display_name
									? status.account.display_name
									: status.account.username}
							</ThemeText>
							{isAccVerified && (
								<ProfileNameRedMark
									style={{ flexShrink: 0 }}
									className="ml-2 mb-[2]"
									colorScheme={colorScheme}
								/>
							)}
							<View className="ml-2 flex-row">
								<UserRole userRoles={status.account?.roles} />
							</View>
						</View>
						<View className="flex-row items-center">
							<ThemeText
								variant="textGrey"
								className="ml-0 mt-[2]"
								size="xs_12"
							>
								{timelineDateFormatter(moment(status.created_at), t)}
							</ThemeText>
							<ThemeText
								variant="textGrey"
								className="mr-2 ml-1 mt-[1] text-center"
								size="xs_12"
							>
								{'•'}
							</ThemeText>
							<View className="w-5 h-5 opacity-50">
								{
									visibilityIcons[
										status?.visibility as keyof typeof visibilityIcons
									]
								}
							</View>
							<ThemeText
								variant="textGrey"
								size="xs_12"
								className={cn(
									'-ml-1 mt-[1] truncate',
									isFromNoti ? 'max-w-[65%]' : 'max-w-[75%]',
								)}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{t(`timeline.visibility.${status.visibility}` as any)}
							</ThemeText>
						</View>
					</View>
				</Pressable>
				{!isFromQuoteCompose &&
					!isQuoteView &&
					(!isFromNoti || isMyStatusQuoted) && <StatusMenu status={status} />}
				<View className="flex-1" />
				{showFollowIcon && (
					<Button
						variant="outline"
						className="rounded-full h-8 py-0 px-4"
						onPress={onMakeRelationship}
						disabled
					>
						{isPending ? (
							<Flow
								size={25}
								color={
									colorScheme === 'dark'
										? '#fff'
										: customColor['patchwork-dark-100']
								}
							/>
						) : (
							<ThemeText size="fs_13">
								{relationships && relationships[0]?.following
									? t('timeline.following')
									: t('timeline.follow')}
							</ThemeText>
						)}
					</Button>
				)}
			</View>
		</View>
	);
};

export default StatusHeader;
