import {
	usePushNoticationActions,
	usePushNoticationStore,
} from '@/store/pushNoti/pushNotiStore';
import {
	useGetGroupedNotification,
	useGetNotificationMarker,
} from '../queries/notifications.queries';
import { useEffect, useMemo } from 'react';
import { flattenPages } from '@/util/helper/timeline';
import { calculateUnread } from '@/util/helper/helper';

export const useNotificationBadgeSync = () => {
	const notiCount = usePushNoticationStore(state => state.notiCount);
	const { onSetNotifcationCount, onRemoveNotifcationCount } =
		usePushNoticationActions();

	const { data: notificationMaker } = useGetNotificationMarker();
	const { data: groupedNotification } = useGetGroupedNotification();

	const notificationList = useMemo(() => {
		const pages: Patchwork.GroupedNotificationResults[] =
			flattenPages(groupedNotification);
		return pages.flatMap(item => item.notification_groups);
	}, [groupedNotification]);

	const latestNotificationId = notificationList[0]?.most_recent_notification_id;
	const lastReadId = notificationMaker?.notifications?.last_read_id;

	useEffect(() => {
		if (!groupedNotification) return;

		const unreadCount = lastReadId
			? calculateUnread(notificationList, lastReadId)
			: notificationList.reduce(
					(total, group) => total + group.notifications_count,
					0,
			  );

		if (unreadCount > 0) {
			onSetNotifcationCount(unreadCount);
			return;
		}

		onRemoveNotifcationCount();
	}, [
		groupedNotification,
		lastReadId,
		notificationList,
		onRemoveNotifcationCount,
		onSetNotifcationCount,
	]);

	return {
		notiCount,
		latestNotificationId,
		lastReadId,
	};
};
