import { queryClient } from '@/App';
import { useMarkLastReadNotification } from '@/hooks/mutations/pushNoti.mutation';
import { usePushNoticationActions } from '@/store/pushNoti/pushNotiStore';
import { RootStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

type UseNotificationsArgs = {
	notiCount: number;
	latestNotificationId?: string;
	lastReadId?: string;
};

export const useOpenNotifications = ({
	notiCount,
	latestNotificationId,
	lastReadId,
}: UseNotificationsArgs) => {
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const { onRemoveNotifcationCount } = usePushNoticationActions();

	const { mutate: markLastRead } = useMarkLastReadNotification({
		onSuccess: newMarker => {
			queryClient.setQueryData<Patchwork.NotificationMarker>(
				['notification-marker'],
				() => newMarker,
			);
		},
	});

	const handleOpenNotifications = useCallback(() => {
		if (notiCount > 0) {
			onRemoveNotifcationCount();
		}

		if (
			notiCount > 0 &&
			latestNotificationId &&
			(!lastReadId || latestNotificationId !== lastReadId)
		) {
			markLastRead({ id: latestNotificationId });
		}

		navigation.navigate('NotiStack', {
			screen: 'NotificationList',
			params: { tabIndex: 0 },
		});
	}, [
		lastReadId,
		latestNotificationId,
		markLastRead,
		navigation,
		notiCount,
		onRemoveNotifcationCount,
	]);

	return { handleOpenNotifications };
};
