import messaging, {
	FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { DeviceEventEmitter, PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import navigationRef from '../navigation/navigationRef';
import { CommonActions } from '@react-navigation/native';
import {
	checkIsConversationNoti,
	handleIncommingMessage,
} from './conversation';
import { queryClient } from '@/App';
import {
	FollowRequestQueryKey,
	GroupedNotificationsQueryKey,
	NormalNotificationQueryKey,
} from '@/services/notification.service';

/**
 * Function to request notification permissions for Android.
 **/
const requestAndroidPermission = async () => {
	if ((Platform.Version as number) >= 33) {
		// For Android 13 and above
		const granted = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
		);
		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
			return await getFirebaseMessagingToken();
		} else {
			const saveFcmToken =
				usePushNoticationStore.getState().actions.saveFcmToken;
			return saveFcmToken(null);
		}
	} else {
		// For Android versions below 13, no permission is needed
		return await getFirebaseMessagingToken();
	}
};

/**
 * Function to request notification permissions for IOS.
 **/
const requestIOSPermission = async () => {
	const authStatus = await messaging().requestPermission();
	const enabled =
		authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
		authStatus === messaging.AuthorizationStatus.PROVISIONAL;
	if (enabled) {
		return await getFirebaseMessagingToken();
	} else {
		const saveFcmToken = usePushNoticationStore.getState().actions.saveFcmToken;
		return saveFcmToken(null);
	}
};

/**
 * Function to request notification permissions for both iOS and Android.
 **/
const requestNotificationPermission = async () => {
	if (Platform.OS === 'ios') {
		await requestIOSPermission();
	} else if (Platform.OS === 'android') {
		await requestAndroidPermission();
	}
};

/**
 * Function to get the FCM token for devices.
 **/
const getFirebaseMessagingToken = async () => {
	try {
		const saveFcmToken = usePushNoticationStore.getState().actions.saveFcmToken;
		const delay = (ms: number | undefined) =>
			new Promise(res => setTimeout(res, ms));
		await delay(1000);

		return saveFcmToken(await messaging().getToken());
	} catch (error) {
		console.log('🚀 ~ getFirebaseMessagingToken ~ error:', error);
	}
};

export const AndroidMessageChannelId = 'Patchwork';

if (Platform.OS === 'android') {
	notifee.createChannel({
		id: AndroidMessageChannelId,
		name: 'Patchwork',
		sound: 'default',
		importance: AndroidImportance.HIGH,
	});
}

const listenMessage = () => {
	const normalNotiQueryKey: NormalNotificationQueryKey = [
		'get-normal-notification',
	];
	const groupedNotiQueryKey: GroupedNotificationsQueryKey = [
		'get-grouped-notification',
	];
	const followRequestNotQueryKey: FollowRequestQueryKey = [
		'follow-request-query-key',
	];

	const onSetNotifcationCount =
		usePushNoticationStore.getState().actions.onSetNotifcationCount;
	return messaging().onMessage(async remoteMessage => {
		const isChatNoti = checkIsConversationNoti(remoteMessage);
		DeviceEventEmitter.emit('patchwork.noti', remoteMessage);
		if (isChatNoti) handleIncommingMessage(remoteMessage);
		else {
			onSetNotifcationCount();
			if (remoteMessage?.data?.noti_type === 'follow_request') {
				queryClient.invalidateQueries({ queryKey: followRequestNotQueryKey });
			} else {
				queryClient.invalidateQueries({ queryKey: groupedNotiQueryKey });
				queryClient.invalidateQueries({ queryKey: normalNotiQueryKey });
			}
			await showNotification(remoteMessage);
		}
	});
};

const showNotification = async (
	remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
	await notifee.displayNotification({
		body: remoteMessage.notification?.body as string,
		title: remoteMessage.notification?.title as string,
		data: remoteMessage.data,
		android: {
			channelId: AndroidMessageChannelId,
		},
		ios: {
			sound: 'default',
		},
	});
};

const handleNotiDetailPress = async (
	notiResp: Patchwork.PushNotiResponse['data'],
) => {
	if (navigationRef.isReady()) {
		if (notiResp.noti_type == 'mention' && notiResp.visibility == 'direct') {
			return navigateToConversationDetail(notiResp);
		}
		return navigateToFeedDetail(notiResp);
	}
};

const navigateToConversationDetail = (
	notiResp: Patchwork.PushNotiResponse['data'],
) => {
	navigationRef.dispatch(
		CommonActions.navigate({
			name: 'Conversations',
			params: {
				screen: 'ConversationDetail',
				params: {
					id: notiResp.destination_id,
					isFromExternalNotiAlert: true,
				},
			},
		}),
	);
};

const navigateToFeedDetail = (notiResp: Patchwork.PushNotiResponse['data']) => {
	navigationRef.dispatch(
		CommonActions.reset({
			index: 1,
			routes: [
				{ name: 'Index' },
				{
					name: 'NotiStack',
					state: {
						routes: [
							{
								name: 'NotificationList',
								params: {
									tabIndex: 0,
								},
							},
							{
								name: 'FeedDetail',
								params: {
									id:
										notiResp.reblogged_id !== '0'
											? notiResp.reblogged_id
											: notiResp.destination_id,
									isMainChannel: true,
								},
							},
						],
					},
				},
			],
		}),
	);
};

const handleNotiProfileDetailPress = (destinationId: string) => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 1,
				routes: [
					{ name: 'Index' },
					{
						name: 'NotiStack',
						state: {
							routes: [
								{
									name: 'NotificationList',
									params: {
										tabIndex: 0,
									},
								},
								{
									name: 'ProfileOther',
									params: { id: destinationId, isFromNoti: true },
								},
							],
						},
					},
				],
			}),
		);
	}
};

const handleNotiFollowRequestPress = () => {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(
			CommonActions.reset({
				index: 1,
				routes: [
					{ name: 'Index' },
					{
						name: 'NotiStack',
						state: {
							routes: [
								{
									name: 'NotificationList',
									params: {
										tabIndex: 2,
									},
								},
							],
						},
					},
				],
			}),
		);
	}
};

export {
	requestNotificationPermission,
	listenMessage,
	handleNotiDetailPress,
	handleNotiProfileDetailPress,
	handleNotiFollowRequestPress,
	showNotification,
};
