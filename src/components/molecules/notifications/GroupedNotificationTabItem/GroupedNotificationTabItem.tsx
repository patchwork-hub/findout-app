import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import { timelineDateFormatter } from '@/util/helper/helper';
import { useNavigation } from '@react-navigation/native';
import { NotificationScreenNavigationProp } from '@/types/navigation';
import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import { useAuthStore } from '@/store/auth/authStore';
import { getNotificationIcons } from '@/util/constant/notification';
import moment from 'moment';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

const GroupedNotificationItem = ({
	notification,
	status,
	accounts,
}: {
	notification: Patchwork.NotificationGroup;
	status: Patchwork.Status | null;
	accounts: Patchwork.Account[];
}) => {
	const navigation = useNavigation<NotificationScreenNavigationProp>();
	const { userInfo } = useAuthStore();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const notificationIcons = getNotificationIcons(colorScheme);

	return (
		<View className="w-full items-start gap-2 px-4 pt-3 pb-1 flex-row">
			<View className="w-9 h-9 items-center justify-center">
				{notification.type === 'mention' && status?.visibility === 'direct'
					? notificationIcons['privateMention']
					: notificationIcons[notification.type]}
			</View>
			<View className="flex-1">
				<View>
					{notification?.type === 'poll' ? (
						<View className="flex-row items-center justify-between">
							<ThemeText
								size={'md_16'}
								className="opacity-80 my-1 flex-shrink mr-3"
							>
								{accounts[0]?.acct === userInfo?.acct
									? t('poll.poll_ended')
									: t('poll.poll_vote_ended')}
							</ThemeText>
							<ThemeText size={'fs_13'} variant={'textGrey'}>
								{timelineDateFormatter(
									moment(notification?.latest_page_notification_at),
									t,
								)}
							</ThemeText>
						</View>
					) : notification?.notifications_count === 1 ? (
						<>
							<View className="flex-row items-center">
								<Pressable
									onPress={() => {
										if (accounts[0]?.id) {
											navigation.navigate('ProfileOther', {
												id: accounts[0].id,
												isFromNoti: true,
											});
										}
									}}
								>
									<Image
										uri={accounts[0]?.avatar}
										className="w-9 h-9 rounded-full mx-[2px]"
									/>
								</Pressable>
								<View className="flex-1 items-end">
									<ThemeText size={'fs_13'} variant={'textGrey'}>
										{timelineDateFormatter(
											moment(notification?.latest_page_notification_at),
											t,
										)}
									</ThemeText>
								</View>
							</View>
							<View className="flex-row items-center justify-between">
								<View>
									<ThemeText
										emojis={accounts[0]?.emojis}
										size={'md_16'}
										className="mt-2"
									>
										{[
											'annual_report',
											'moderation_warning',
											'severed_relationships',
										].includes(notification.type) ? (
											<ThemeText variant={'textGrey'}>
												{notification.type === 'annual_report'
													? t('notifications.messages.annual_report.message', {
															year: moment(
																notification?.latest_page_notification_at,
															).isValid()
																? moment(
																		notification?.latest_page_notification_at,
																  ).year()
																: moment().year(),
													  })
													: notification.type === 'severed_relationships'
													? t(
															'notifications.messages.severed_relationships.title',
															{
																name:
																	accounts[0]?.display_name ||
																	accounts[0]?.username,
															},
													  )
													: t(`notifications.messages.${notification.type}`)}
											</ThemeText>
										) : (
											<>
												{accounts[0]?.display_name || accounts[0]?.username}{' '}
												<ThemeText variant={'textGrey'}>
													{notification.type === 'mention' &&
													status?.visibility == 'direct'
														? t('notifications.messages.sent_message')
														: notification.type === 'admin.report'
														? t('notifications.messages.admin.report', {
																target: `@${notification.report?.target_account?.acct}`,
														  })
														: t(`notifications.messages.${notification.type}`)}
												</ThemeText>
											</>
										)}
									</ThemeText>
									{notification.type === 'follow' && (
										<ThemeText
											size={'sm_14'}
											variant={'textGrey'}
											className="opacity-80 mb-1"
										>
											{accounts[0]?.followers_count}{' '}
											{t(
												`notifications.followerCount.${
													accounts[0]?.followers_count === 1 ? 'one' : 'many'
												}`,
											)}
										</ThemeText>
									)}
									{notification.type === 'annual_report' && (
										<ThemeText
											size={'sm_14'}
											className="text-patchwork-blue dark:text-patchwork-blue-light mt-1"
										>
											{t('notifications.messages.annual_report.view')}
										</ThemeText>
									)}
								</View>
							</View>
							{notification.moderation_warning && (
								<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
									<ThemeText size={'sm_14'} className="opacity-80 mb-2">
										{t(
											`notifications.messages.moderation_warning_details.action_${notification.moderation_warning.action}`,
										)}
									</ThemeText>
									{notification.moderation_warning.text && (
										<ThemeText
											size={'sm_14'}
											className="border-t border-slate-100 dark:border-patchwork-grey-80 pt-2"
										>
											{notification.moderation_warning.text}
										</ThemeText>
									)}
								</View>
							)}
							{notification.type == 'severed_relationships' &&
								notification.event && (
									<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
										<ThemeText size={'sm_14'} className="opacity-80">
											{t(
												`notifications.messages.severed_relationships.${notification.event.type}`,
												{
													target: notification.event.target_name,
													from:
														accounts[0]?.display_name || accounts[0]?.username,
													followersCount: notification.event.followers_count,
													followingCount: notification.event.following_count,
												},
											)}
										</ThemeText>
									</View>
								)}
							{notification.report && (
								<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
									<ThemeText size="sm_14" className="opacity-80">
										{notification.report.category && (
											<ThemeText size="sm_14" className="capitalize">
												{notification.report.category}
												{notification.report.comment ? ': ' : ''}
											</ThemeText>
										)}
										{notification.report.comment}
									</ThemeText>
								</View>
							)}
						</>
					) : (
						<>
							<View className="flex-row items-center">
								{accounts.map(acc => (
									<Pressable
										key={acc?.id}
										className="mr-1"
										onPress={() => {
											if (acc?.id) {
												navigation.navigate('ProfileOther', {
													id: acc.id,
													isFromNoti: true,
												});
											}
										}}
									>
										<Image
											uri={acc?.avatar}
											className="w-9 h-9 rounded-full mx-[2px]"
										/>
									</Pressable>
								))}
							</View>
							<View className="flex-row items-center">
								{[
									'annual_report',
									'moderation_warning',
									'severed_relationships',
								].includes(notification.type) ? (
									<ThemeText size={'sm_14'} className="w-[80%] opacity-80 my-1">
										<ThemeText variant={'textGrey'}>
											{notification.type === 'annual_report'
												? t('notifications.messages.annual_report.message', {
														year: moment(
															notification?.latest_page_notification_at,
														).isValid()
															? moment(
																	notification?.latest_page_notification_at,
															  ).year()
															: moment().year(),
												  })
												: notification.type === 'severed_relationships'
												? t(
														'notifications.messages.severed_relationships.title',
														{
															name:
																accounts[0]?.display_name ||
																accounts[0]?.username,
														},
												  )
												: t(`notifications.messages.${notification?.type}`)}
										</ThemeText>
									</ThemeText>
								) : (
									<ThemeText size={'sm_14'} className="w-[80%] opacity-80 my-1">
										{accounts[0]?.acct === userInfo?.acct
											? t('notifications.your')
											: accounts[0]?.display_name || accounts[0]?.username}{' '}
										{notification?.notifications_count > 1 &&
											t('notifications.andOthers', {
												count: notification?.notifications_count - 1,
											})}{' '}
										<ThemeText variant={'textGrey'}>
											{notification.type === 'mention' &&
											status?.visibility === 'direct'
												? t('notifications.messages.sent_message')
												: notification.type === 'admin.report'
												? t('notifications.messages.admin.report', {
														target: `@${notification.report?.target_account?.acct}`,
												  })
												: t(`notifications.messages.${notification?.type}`)}
										</ThemeText>
									</ThemeText>
								)}
								<ThemeText
									className="w-[20%] text-right"
									size={'fs_13'}
									variant={'textGrey'}
								>
									{timelineDateFormatter(
										moment(notification?.latest_page_notification_at),
										t,
									)}
								</ThemeText>
							</View>
						</>
					)}
					{status && (
						<StatusWrapper
							status={status}
							comeFrom="noti"
							currentPage="Notification"
							statusType="notification"
						/>
					)}
				</View>
			</View>
		</View>
	);
};

export default GroupedNotificationItem;
