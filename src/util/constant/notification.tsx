import {
	NotificationSeveredRelationshipIcon,
	NotificationModerationWarningIcon,
	AdminNotificationIcon,
} from '@/util/svg/icon.notification';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '../icons/icon.common';
import customColor from './color';
import {
	QuotePlaceholderIcon,
	StatusRepostIcon,
} from '../svg/icon.status_actions';

export const notificationMessages: Record<Patchwork.NotificationTypes, string> =
	{
		follow: 'followed you.',
		favourite: 'favourited your post.',
		mention: 'mentioned you.',
		reblog: 'boosted your post.',
		poll: 'poll has ended.',
		status: 'posted.',
		update: 'updated their post.',
		'admin.report': 'reported a post.',
		'admin.sign_up': '',
		severed_relationships: '',
		moderation_warning: '',
		annual_report: '',
		quote: 'quoted your post.',
		quoted_update: 'quoted your updated post.',
	};

export const getNotificationIcons = (colorScheme: 'light' | 'dark') =>
	({
		follow: (
			<FontAwesomeIcon
				icon={AppIcons.follow}
				size={20}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		favourite: (
			<FontAwesomeIcon
				icon={AppIcons.heartSolid}
				size={20}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		mention: (
			<FontAwesomeIcon
				icon={AppIcons.mention}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		reblog: (
			<StatusRepostIcon
				fill={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		poll: (
			<FontAwesomeIcon
				icon={AppIcons.poll}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		status: (
			<FontAwesomeIcon
				icon={AppIcons.timeline}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		update: (
			<FontAwesomeIcon
				icon={AppIcons.edit}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		'admin.report': (
			<FontAwesomeIcon
				icon={AppIcons.flag}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		privateMention: (
			<FontAwesomeIcon
				icon={AppIcons.conversationSolid}
				size={18}
				color={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		),
		severed_relationships: (
			<NotificationSeveredRelationshipIcon colorScheme={colorScheme} />
		),
		moderation_warning: (
			<NotificationModerationWarningIcon colorScheme={colorScheme} />
		),
		annual_report: <AdminNotificationIcon colorScheme={colorScheme} />,
		'admin.sign_up': <AdminNotificationIcon colorScheme={colorScheme} />,
		quote: (
			<QuotePlaceholderIcon
				fill={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
				width={24}
				height={24}
			/>
		),
		quoted_update: (
			<QuotePlaceholderIcon
				fill={
					colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
				width={24}
				height={24}
			/>
		),
	} satisfies Record<
		Patchwork.NotificationTypes | 'privateMention',
		React.ReactNode
	>);
