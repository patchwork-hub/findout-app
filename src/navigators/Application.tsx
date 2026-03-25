import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
	Profile,
	ImageViewer,
	LocalImageViewer,
	SplashScreen,
	QuotePost,
	VideoPlayer,
	GifPlayer,
} from '@/screens';
import type { RootStackParamList } from '@/types/navigation';
import BottomTabs from './BottomTabStackNavigator';
import WebViewer from '@/screens/WebViewer/WebViewer';
import { useAuthStore } from '@/store/auth/authStore';
import Guest from './GuestStackNavigator';
import EditProfile from '@/screens/EditProfile/EditProfile';
import ProfileOther from '@/screens/ProfileOther/ProfileOther';
import { useEffect, useState } from 'react';
import {
	handleNotiDetailPress,
	handleNotiFollowRequestPress,
	handleNotiProfileDetailPress,
	listenMessage,
	requestNotificationPermission,
} from '@/util/helper/firebase';
import notifee, { EventType } from '@notifee/react-native';
import { usePushNoticationActions } from '@/store/pushNoti/pushNotiStore';
import navigationRef from '@/util/navigation/navigationRef';
import messaging from '@react-native-firebase/messaging';
import SettingStack from './SettingsStackNavigator';
import NotiStack from './NotiStackNavigator';
import { useTranslationLanguagesQueries } from '@/hooks/queries/feed.queries';
import { useTranslationLanguageStore } from '@/store/compose/translationLanguage/translationLanguage';
import ConversationsStack from './ConversationsStackNavigator';
import { useCheckIsCurrentChannelAppDepracated } from '@/hooks/mutations/auth.mutation';
import ReactNativeVersionInfo from 'react-native-version-info';
import { Platform } from 'react-native';
import ForceUpdateAlert from '@/components/molecules/account/ForceUpdateAlert/ForceUpdateAlert';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { removeHttps } from '@/util/helper/helper';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MyDarkTheme = {
	...DarkTheme,
	colors: {
		...DarkTheme.colors,
		background: customColor['patchwork-dark-100'],
	},
};

const MyLightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: customColor['patchwork-grey-50'],
	},
};

function ApplicationNavigator() {
	const { mastodon, isHydrating, userInfo } = useAuthStore();
	const { setTranslationLanguageData } = useTranslationLanguageStore();
	const [showForceUpdateAlert, setShowForceUpdateAlert] = useState(false);
	const { colorScheme } = useColorScheme();

	const activeAccId = `${userInfo?.username}@${removeHttps(
		userInfo?.domain ?? '',
	)}`;

	const ENTRY_ROUTE = mastodon.token ? 'Index' : 'Guest';

	// ********** TranslationLanguages API ********** //
	const { data } = useTranslationLanguagesQueries();

	const { mutate: checkVersion } = useCheckIsCurrentChannelAppDepracated({
		onSuccess: resp => {
			if (resp?.deprecated) {
				setShowForceUpdateAlert(true);
			}
		},
	});

	useEffect(() => {
		if (data) {
			setTranslationLanguageData(data);
		}
	}, [data, setTranslationLanguageData]);
	// ********** TranslationLanguages API ********** //

	const { onRemoveNotifcationCount, onSetNotifcationCount } =
		usePushNoticationActions();

	// ***** Listening for foreground and background messages ***** //
	useEffect(() => {
		messaging().setBackgroundMessageHandler(async _ => {
			onSetNotifcationCount();
		});

		const unsubscribe = listenMessage();
		return unsubscribe;
	}, []);
	// ***** Listening for foreground and background messages ***** //

	// ***** This method will be triggered if the app is already opened. ( Start ) ***** //
	useEffect(() => {
		const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
			const { notification } = detail;
			switch (type) {
				case EventType.DISMISSED:
					onRemoveNotifcationCount();
					break;
				case EventType.PRESS:
					onRemoveNotifcationCount();
					if (notification?.data) {
						const notiResp =
							notification?.data as Patchwork.PushNotiResponse['data'];
						if (notification?.data?.noti_type === 'follow') {
							handleNotiProfileDetailPress(notiResp?.destination_id);
						} else if (notification?.data?.noti_type === 'follow_request') {
							handleNotiFollowRequestPress();
						} else {
							handleNotiDetailPress(notiResp);
						}
					}
					break;
			}
		});

		return unsubscribe;
	}, []);
	// ***** This method will be triggered if the app is already opened. ( End ) ***** //

	useEffect(() => {
		// ***** This method will be triggered if the app has opened from a background state. ***** //
		messaging().onNotificationOpenedApp(remoteMessage => {
			onRemoveNotifcationCount();
			if (remoteMessage?.data) {
				const notiResp =
					remoteMessage?.data as Patchwork.PushNotiResponse['data'];
				if (notiResp.noti_type === 'follow') {
					handleNotiProfileDetailPress(notiResp.destination_id as string);
				} else if (notiResp.noti_type === 'follow_request') {
					handleNotiFollowRequestPress();
				} else {
					handleNotiDetailPress(notiResp);
				}
			}
		});

		// ***** This method will be triggered the application to open from a quit state. ***** //
		messaging()
			.getInitialNotification()
			.then(remoteMessage => {
				onRemoveNotifcationCount();
				if (remoteMessage?.data) {
					const notiResp =
						remoteMessage.data as Patchwork.PushNotiResponse['data'];
					if (notiResp.noti_type === 'follow') {
						setTimeout(() => {
							handleNotiProfileDetailPress(notiResp.destination_id);
						}, 1000);
					} else if (notiResp.noti_type === 'follow_request') {
						setTimeout(() => {
							handleNotiFollowRequestPress();
						}, 1000);
					} else {
						setTimeout(() => {
							handleNotiDetailPress(notiResp);
						}, 1000);
					}
				}
			});
	}, []);

	// ***** Firebase Request Noti Permission ***** //
	useEffect(() => {
		(() => {
			setTimeout(async () => {
				mastodon.token && (await requestNotificationPermission());
			}, 1000);
		})();
	}, [mastodon.token, activeAccId]);

	useEffect(() => {
		const appVersion = ReactNativeVersionInfo.appVersion;
		checkVersion({ current_app_version: appVersion, os_type: Platform.OS });
	}, []);

	return (
		<SafeAreaProvider>
			<NavigationContainer
				theme={colorScheme === 'dark' ? MyDarkTheme : MyLightTheme}
				ref={navigationRef}
			>
				<Stack.Navigator
					screenOptions={{ headerShown: false }}
					initialRouteName={ENTRY_ROUTE}
				>
					{isHydrating ? (
						<Stack.Screen name="SplashScreen" component={SplashScreen} />
					) : !mastodon.token ? (
						<>
							<Stack.Screen name="Guest" component={Guest} />
						</>
					) : (
						<>
							<Stack.Screen name="Index" component={BottomTabs} />
							<Stack.Screen name="Profile" component={Profile} />
							<Stack.Screen name="ProfileOther" component={ProfileOther} />
							<Stack.Screen name="WebViewer" component={WebViewer} />
							<Stack.Screen name="ImageViewer" component={ImageViewer} />
							<Stack.Screen name="EditProfile" component={EditProfile} />
							<Stack.Screen
								name="LocalImageViewer"
								component={LocalImageViewer}
							/>
							<Stack.Screen name="SettingStack" component={SettingStack} />
							<Stack.Screen name="NotiStack" component={NotiStack} />
							<Stack.Screen
								name="ConversationsStack"
								component={ConversationsStack}
							/>
							<Stack.Screen
								name="QuotePost"
								component={QuotePost}
								options={{
									presentation: 'modal',
								}}
							/>
							<Stack.Screen name="VideoPlayer" component={VideoPlayer} />
							<Stack.Screen name="GifPlayer" component={GifPlayer} />
						</>
					)}
				</Stack.Navigator>
				{showForceUpdateAlert && <ForceUpdateAlert />}
			</NavigationContainer>
		</SafeAreaProvider>
	);
}

export default ApplicationNavigator;
