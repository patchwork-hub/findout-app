import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import StatusContent from '@/components/atoms/feed/StatusContent/StatusContent';
import StatusHeader from '@/components/atoms/feed/StatusHeader/StatusHeader';
import StatusActionBar from '@/components/molecules/feed/StatusActionBar/StatusActionBar';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveFeedAction } from '@/store/feed/activeFeed';
import { NotiStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { getQuoteInlineInfo } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { QuotePlaceholderIcon } from '@/util/svg/icon.status_actions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

interface NotificationStatusProps {
	status: Patchwork.Status;
}

const NotificationStatus: React.FC<NotificationStatusProps> = ({ status }) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<NotiStackParamList>>();
	const { setActiveFeed, setFeedDetailExtraPayload } = useActiveFeedAction();

	const { userInfo } = useAuthStore();

	const isAuthor = useMemo(() => {
		return userInfo?.id === status.quote?.quoted_status?.account?.id;
	}, [status, userInfo?.id]);

	const handleOnPress = (item: Patchwork.Status) => {
		setFeedDetailExtraPayload({
			comeFrom: 'noti',
		});
		setActiveFeed(item);
		navigation.navigate('FeedDetail', { id: item.id });
	};

	const content = status?.quote?.quoted_status?.content;
	const { acct, displayText } = useMemo(
		() => getQuoteInlineInfo(content ?? '', t),
		[content, t],
	);

	const directStyle =
		colorScheme === 'dark'
			? 'bg-patchwork-dark-100 bg-opacity-10 backdrop-blur-sm border border-patchwork-primary dark:border-patchwork-primary-dark shadow-md'
			: 'bg-white bg-opacity-30 backdrop-blur-sm border border-patchwork-primary dark:border-patchwork-primary-dark shadow-md';

	return (
		<Pressable
			className={cn([
				status.visibility === 'direct'
					? `${directStyle} px-1 my-1 rounded-lg`
					: '',
			])}
			onPress={() => handleOnPress(status)}
		>
			<View
				className={cn([
					'my-2 p-3 rounded-lg',
					status.visibility === 'direct'
						? 'border-transparent py-1'
						: 'border border-slate-200 dark:border-patchwork-grey-70',
				])}
			>
				<StatusHeader status={status} isFromNoti showAvatarIcon />
				<StatusContent status={status} isMainChannel isFromNotiStatusImage />

				{status.quote?.quoted_status && isAuthor && (
					<>
						<Pressable
							className="border w-full border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-xl"
							onPress={() => {
								const quotedStatus = status?.quote?.quoted_status;
								if (quotedStatus) {
									handleOnPress(quotedStatus);
								}
							}}
						>
							<StatusHeader
								status={status.quote.quoted_status}
								showAvatarIcon
								isQuoteView
							/>
							<StatusContent status={status.quote.quoted_status} isReposting />
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
						<StatusActionBar status={status} isFromNoti />
					</>
				)}
			</View>
		</Pressable>
	);
};

export default NotificationStatus;
