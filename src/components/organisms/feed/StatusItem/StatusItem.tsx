import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Underline from '@/components/atoms/common/Underline/Underline';
import StatusContent from '@/components/atoms/feed/StatusContent/StatusContent';
import StatusHeader from '@/components/atoms/feed/StatusHeader/StatusHeader';
import StatusActionBar from '@/components/molecules/feed/StatusActionBar/StatusActionBar';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveFeedAction } from '@/store/feed/activeFeed';
import { HomeStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { getQuoteInlineInfo } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { AppIcons } from '@/util/icons/icon.common';
import {
	QuotePlaceholderIcon,
	StatusRepostIcon,
} from '@/util/svg/icon.status_actions';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewProps, Pressable } from 'react-native';

type Props = {
	status: Patchwork.Status;
	isFromNoti?: boolean;
} & ViewProps;

const StatusItem = ({ status, isFromNoti, ...props }: Props) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { setActiveFeed } = useActiveFeedAction();
	const { setFeedDetailExtraPayload } = useActiveFeedAction();
	const { userInfo } = useAuthStore();

	const defaultAvatarBgColor =
		colorScheme === 'dark'
			? customColor['patchwork-primary-dark'].replace('#', '')
			: customColor['patchwork-primary'].replace('#', '');

	const isAuthor = useMemo(() => {
		return userInfo?.id === status.account.id;
	}, [status.account.id, userInfo?.id]);

	const handleOnPress = (item: Patchwork.Status) => {
		setActiveFeed(item);
		navigation.push('FeedDetail', { id: item.id });
	};

	const getImageUrl = () => {
		// if (status.account.avatar.includes('avatars/original/missing.png')) {
		// 	`https://ui-avatars.com/api/?name=${encodeURIComponent(
		// 		userInfo?.display_name || userInfo?.username || 'User',
		// 	)}&size=128&background=${defaultAvatarBgColor}&color=${
		// 		colorScheme === 'dark' ? '000000' : 'ffffff'
		// 	}`;
		// }

		return status.account.avatar;
	};

	const content = status?.quote?.quoted_status?.content;
	const { acct, displayText } = useMemo(
		() => getQuoteInlineInfo(content ?? '', t),
		[content, t],
	);

	return (
		<>
			<View
				className={cn(
					`m-4 rounded-md ${
						status.visibility === 'direct'
							? 'border-l-4 border-l-patchwork-primary dark:border-l-patchwork-primary-dark pl-2 ml-1 bg-patchwork-primary/10 dark:bg-patchwork-primary-dark/10 pt-3 pb-1 pr-2 mr-2'
							: ''
					}`,
				)}
				{...props}
			>
				{status.in_reply_to_id && (
					<Pressable
						onPress={() => handleOnPress(status)}
						className="flex-row items-center mb-3 bg-patchwork-primary/10 dark:bg-patchwork-dark-100 self-start px-3 py-1 rounded-full ml-9 active:opacity-75"
					>
						<FontAwesomeIcon
							icon={AppIcons.reply}
							size={18}
							color={customColor['patchwork-primary']}
						/>
						<ThemeText
							variant={'textGrey'}
							size={'fs_13'}
							className="font-NewsCycle_Bold ml-2"
						>
							{t('timeline.continued_thread')}
						</ThemeText>
					</Pressable>
				)}
				<View className="flex-row">
					<Pressable
						onPress={() => {
							isAuthor
								? navigation.navigate('Profile', { id: status.account.id })
								: navigation.navigate('ProfileOther', {
										id: status.account.id,
										isFromNoti: isFromNoti,
								  });
						}}
					>
						<Image
							source={{
								uri: getImageUrl(),
							}}
							className="w-[35] h-[35] mt-[1] rounded-full"
							iconSize={36}
						/>
					</Pressable>
					<Pressable
						className="ml-2 flex-1"
						{...props}
						onPress={() => handleOnPress(status)}
					>
						<StatusHeader status={status} isFromNoti={isFromNoti} />
						<StatusContent status={status} />
						{status?.quote?.quoted_status &&
							status.quote.quoted_status !== null && (
								<>
									<Pressable
										className="border flex-1 border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-xl"
										onPress={() => {
											if (status.quote && status.quote.quoted_status) {
												handleOnPress(status.quote.quoted_status);
											}
										}}
									>
										<StatusHeader
											status={status?.quote?.quoted_status}
											showAvatarIcon
											isQuoteView
										/>
										<StatusContent
											status={status?.quote?.quoted_status}
											isReposting
										/>

										{acct && (
											<Pressable
												onPress={() => {
													const quotedStatus = status?.quote?.quoted_status;
													if (quotedStatus) {
														handleOnPress(quotedStatus);
													}
												}}
											>
												<View className="flex-row items-center mb-2 p-3 bg-patchwork-primary/10 mt-2 rounded">
													<QuotePlaceholderIcon
														colorScheme={colorScheme}
														width={30}
														height={30}
														fill={customColor['patchwork-primary']}
													/>
													<ThemeText className="text-xs font-NewsCycle_Bold opacity-75 ml-2 flex-1">
														{displayText}
													</ThemeText>
												</View>
											</Pressable>
										)}
									</Pressable>
								</>
							)}
					</Pressable>
				</View>
				<View className="ml-12">
					<StatusActionBar status={status} isFromNoti={isFromNoti} />
				</View>
			</View>
			<View className="w-full h-[0.5px] bg-slate-200 dark:bg-patchwork-grey-100" />
		</>
	);
};

export default StatusItem;
