import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import { INotificationResponse } from '@/services/notification.service';
import { timelineDateFormatter } from '@/util/helper/helper';
import { useNavigation } from '@react-navigation/native';
import { NotificationScreenNavigationProp } from '@/types/navigation';
import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import { useAuthStore } from '@/store/auth/authStore';
import {
	getNotificationIcons,
	notificationMessages,
} from '@/util/constant/notification';
import moment from 'moment';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

const NotificationTabItem = ({ item }: { item: INotificationResponse }) => {
	const { t } = useTranslation();
	const {
		account,
		report,
		status,
		type,
		created_at,
		moderation_warning,
		event,
	} = item;
	const { userInfo } = useAuthStore();
	const navigation = useNavigation<NotificationScreenNavigationProp>();
	const { colorScheme } = useColorScheme();
	const notificationIcons = getNotificationIcons(colorScheme);

	return (
		<View className="items-start gap-2 px-4 pt-3 pb-1 flex-row">
			<View className="w-9 h-9 items-center justify-center">
				{type === 'mention' && status?.visibility === 'direct'
					? notificationIcons['privateMention']
					: notificationIcons[type]}
			</View>
			<View className="flex-auto">
				<View>
					{type === 'poll' ? (
						<View className="flex-row items-center">
							{account?.acct === userInfo?.acct ? (
								<ThemeText size={'md_16'} className="opacity-80 my-1">
									{t('poll.poll_ended')}
								</ThemeText>
							) : (
								<ThemeText size={'md_16'} className="opacity-80 my-1">
									{t('poll.poll_vote_ended')}
								</ThemeText>
							)}
							<View className="flex-1 items-end">
								<ThemeText size={'fs_13'} variant={'textGrey'}>
									{timelineDateFormatter(moment(created_at), t)}
								</ThemeText>
							</View>
						</View>
					) : (
						<>
							<View className="flex-row items-center">
								<Pressable
									onPress={() => {
										if (account?.id) {
											navigation.navigate('ProfileOther', {
												id: account.id,
												isFromNoti: true,
											});
										}
									}}
								>
									<Image
										uri={account?.avatar}
										className="w-9 h-9 rounded-full mx-[2px]"
									/>
								</Pressable>
								<View className="flex-1 items-end">
									<ThemeText size={'fs_13'} variant={'textGrey'}>
										{timelineDateFormatter(moment(created_at), t)}
									</ThemeText>
								</View>
							</View>
							<View className="flex-row items-center justify-between">
								<View>
									<ThemeText
										emojis={account?.emojis}
										size={'md_16'}
										className="mt-2"
									>
										{[
											'annual_report',
											'moderation_warning',
											'severed_relationships',
										].includes(type) ? (
											<ThemeText variant={'textGrey'}>
												{type === 'annual_report'
													? t('notifications.messages.annual_report.message', {
															year: moment(created_at).isValid()
																? moment(created_at).year()
																: moment().year(),
													  })
													: type === 'severed_relationships' && event
													? t(
															'notifications.messages.severed_relationships.title',
															{
																name:
																	event?.target_name ||
																	account?.display_name ||
																	account?.username,
															},
													  )
													: t(`notifications.messages.${type}`)}
											</ThemeText>
										) : (
											<>
												{account?.display_name || account?.username}{' '}
												<ThemeText variant={'textGrey'}>
													{type === 'mention' && status?.visibility === 'direct'
														? t('notifications.messages.sent_message')
														: type === 'admin.report'
														? t('notifications.messages.admin.report', {
																target: `@${report?.target_account?.acct}`,
														  })
														: t(`notifications.messages.${type}`)}
												</ThemeText>
											</>
										)}
									</ThemeText>
									{type === 'follow' && (
										<ThemeText
											size={'sm_14'}
											variant={'textGrey'}
											className="opacity-80 mb-1"
										>
											{account?.followers_count}{' '}
											{t(
												`notifications.followerCount.${
													account?.followers_count === 1 ? 'one' : 'many'
												}`,
											)}
										</ThemeText>
									)}
									{type === 'annual_report' && (
										<ThemeText
											size={'sm_14'}
											className="text-patchwork-blue dark:text-patchwork-blue-light mt-1"
										>
											{t('notifications.messages.annual_report.view')}
										</ThemeText>
									)}
								</View>
							</View>
							{moderation_warning && (
								<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
									<ThemeText size={'sm_14'} className="opacity-80">
										{t(
											`notifications.messages.moderation_warning_details.action_${moderation_warning.action}`,
										)}
									</ThemeText>
									{moderation_warning.text && (
										<ThemeText
											size={'sm_14'}
											className="border-t border-slate-100 dark:border-patchwork-grey-80 pt-2"
										>
											{moderation_warning.text}
										</ThemeText>
									)}
								</View>
							)}
							{event && type === 'severed_relationships' && (
								<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
									<ThemeText size={'sm_14'} className="opacity-80">
										{t(
											`notifications.messages.severed_relationships.${event.type}`,
											{
												target: event.target_name,
												from: account?.display_name || account?.username,
												followersCount: event.followers_count,
												followingCount: event.following_count,
											},
										)}
									</ThemeText>
								</View>
							)}
							{report && (
								<View className="border border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-lg">
									<ThemeText size="sm_14" className="opacity-80">
										{report.category && (
											<ThemeText size="sm_14" className="capitalize">
												{report.category}
												{report.comment ? ': ' : ''}
											</ThemeText>
										)}
										{report.comment}
									</ThemeText>
								</View>
							)}
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

export default NotificationTabItem;
