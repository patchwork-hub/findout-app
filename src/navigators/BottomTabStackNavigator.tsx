import { Compose } from '@/screens';
import { BottomStackParamList } from '@/types/navigation';
import {
	ComposeTabIcon,
	HomeFilledIcon,
	HomeIcon,
	SearchFilledIcon,
	SearchOutlineIcon,
} from '@/util/svg/icon.common';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import {
	Platform,
	Pressable,
	PressableProps,
	View,
	DeviceEventEmitter,
} from 'react-native';
import HomeStack from './HomeStackNavigator';
import SearchStack from './SearchStackNavigator';
import ConversationsStack from './ConversationsStackNavigator';
import NotiStack from './NotiStackNavigator';
import {
	usePushNoticationActions,
	usePushNoticationStore,
} from '@/store/pushNoti/pushNotiStore';
import NotiTabBarIcon from '@/components/atoms/notifications/NotiTabBarIcon/NotiTabBarIcon';
import ConversationsTabButton from '@/components/atoms/conversations/ConversationsTabButton/ConversationsTabButton';
import {
	useGetGroupedNotification,
	useGetNotificationMarker,
} from '@/hooks/queries/notifications.queries';
import { useEffect, useMemo, useState } from 'react';
import { flattenPages } from '@/util/helper/timeline';
import { calculateUnread } from '@/util/helper/helper';
import { useMarkLastReadNotification } from '@/hooks/mutations/pushNoti.mutation';
import customColor from '@/util/constant/color';
import { isTablet } from '@/util/helper/isTablet';
import { useWpSearchStore } from '@/store/feed/wpSearchStore';
import { useComposePrefillStore } from '@/store/ui/composePrefillStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	getFocusedRouteNameFromRoute,
	StackActions,
} from '@react-navigation/native';

const Tab = createBottomTabNavigator<BottomStackParamList>();

export default function BottomTabs() {
	const { colorScheme } = useColorScheme();
	const notiCount = usePushNoticationStore(state => state.notiCount);
	const { onRemoveNotifcationCount, onSetNotifcationCount } =
		usePushNoticationActions();
	const { data: notificationMarker } = useGetNotificationMarker();
	const { data: groupNotification } = useGetGroupedNotification();
	const [isAppFirstMount, setIsAppFirstMount] = useState(true);
	const insets = useSafeAreaInsets();

	const notificationList = useMemo(() => {
		const notiList = flattenPages(groupNotification);
		return notiList.flatMap(item => item.notification_groups);
	}, [groupNotification]);

	const { mutate: markAsRead } = useMarkLastReadNotification({
		onSuccess: () => {},
	});

	useEffect(() => {
		if (
			notificationMarker &&
			notificationMarker?.notifications?.last_read_id &&
			groupNotification &&
			isAppFirstMount
		) {
			const notiCount = calculateUnread(
				notificationList,
				notificationMarker?.notifications?.last_read_id,
			);
			setIsAppFirstMount(false);
			if (notiCount > 0) {
				onSetNotifcationCount(notiCount);
			}
		}
	}, [notificationMarker, groupNotification]);

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === 'dark' ? customColor['patchwork-dark-100'] : '#fff',
					paddingTop: 10,
					height: (Platform.OS === 'ios' ? 60 : 75) + insets.bottom,
					paddingBottom: insets.bottom,
					width: '100%',
					paddingHorizontal: isTablet ? 200 : 0,
				},
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeStack}
				options={({ route }) => {
					const routeName = getFocusedRouteNameFromRoute(route) ?? '';
					const hideTabBar = routeName === 'QuotePost';
					return {
						...(hideTabBar && {
							tabBarStyle: { display: 'none' },
						}),
						tabBarIcon: ({ focused }) =>
							focused ? (
								<HomeFilledIcon colorScheme={colorScheme} />
							) : (
								<HomeIcon colorScheme={colorScheme} />
							),
					};
				}}
				listeners={({ navigation, route }) => ({
					tabPress: e => {
						const state = navigation.getState();

						const tabRoute = state.routes.find(r => r.key === route.key);

						if (navigation.isFocused()) {
							const childState = tabRoute?.state;
							if (childState && (childState?.index ?? 0) > 0) {
								e.preventDefault();
								navigation.dispatch({
									...StackActions.popToTop(),
									target: childState.key,
								});
							}
						}

						if (
							state.routes[state.index].name === 'Home' &&
							navigation.isFocused()
						) {
							e.preventDefault();
							DeviceEventEmitter.emit('scrollToTopHomeFeed');
							const { clearSearch, searchQuery } = useWpSearchStore.getState();
							if (searchQuery.length > 0) {
								clearSearch();
							}
						}
					},
				})}
			/>
			<Tab.Screen
				name="Search"
				component={SearchStack}
				options={({ route }) => {
					const routeName = getFocusedRouteNameFromRoute(route) ?? '';
					const hideTabBar = routeName === 'QuotePost';

					return {
						...(hideTabBar
							? {
									tabBarStyle: { display: 'none' },
							  }
							: {}),
						tabBarIcon: ({ focused }) =>
							focused ? (
								<SearchFilledIcon colorScheme={colorScheme} />
							) : (
								<SearchOutlineIcon colorScheme={colorScheme} />
							),
					};
				}}
			/>
			<Tab.Screen
				name="Compose"
				component={Compose}
				options={({ navigation }) => {
					const state = navigation.getState();
					const activeTab = state.routes[state.index]?.name;
					const isConversationTab = activeTab === 'Conversations';
					const shouldDisableCompose = isConversationTab;
					return {
						tabBarStyle: { display: 'none' },
						tabBarButton: props => (
							<Pressable
								{...(props as PressableProps)}
								disabled={shouldDisableCompose}
							/>
						),
						tabBarIcon: ({ focused }) => (
							<View
								style={{
									padding: 10,
									backgroundColor: shouldDisableCompose
										? colorScheme === 'dark'
											? '#333'
											: '#999'
										: customColor['patchwork-primary'],
									borderRadius: 10,
								}}
							>
								<ComposeTabIcon
									colorScheme={colorScheme}
									width={focused ? 20 : 17}
									height={focused ? 20 : 17}
									focused={focused}
								/>
							</View>
						),
					};
				}}
				listeners={({ navigation }) => ({
					tabPress: event => {
						event.preventDefault();
						const prefill = useComposePrefillStore.getState().channelPrefill;
						navigation.navigate('Compose', {
							type: 'create',
							...prefill,
						});
					},
				})}
			/>
			<Tab.Screen
				name="Notification"
				component={NotiStack}
				options={({ route }) => {
					const routeName = getFocusedRouteNameFromRoute(route) ?? '';
					const hideTabBar = routeName === 'QuotePost';

					return {
						...(hideTabBar
							? {
									tabBarStyle: { display: 'none' },
							  }
							: {}),
						tabBarIcon: ({ focused }) => (
							<NotiTabBarIcon {...{ colorScheme, focused, notiCount }} />
						),
					};
				}}
				listeners={({ navigation }) => ({
					tabPress: event => {
						event.preventDefault();
						notiCount !== 0 && onRemoveNotifcationCount();
						if (
							notiCount > 0 &&
							notificationMarker?.notifications &&
							notificationMarker?.notifications?.last_read_id !==
								notificationList[0]?.most_recent_notification_id
						) {
							markAsRead({
								id: notificationList[0]?.most_recent_notification_id,
							});
						}
						navigation.navigate('Notification', {
							screen: 'NotificationList',
							params: {
								tabIndex: 0,
							},
						});
					},
				})}
			/>
			<Tab.Screen
				name="Conversations"
				component={ConversationsStack}
				options={({ route }) => {
					const routeName = getFocusedRouteNameFromRoute(route) ?? '';
					const hideTabBar = routeName === 'QuotePost';

					return {
						...(hideTabBar
							? {
									tabBarStyle: { display: 'none' },
							  }
							: {}),
						tabBarIcon: ({ focused }) => (
							<ConversationsTabButton focused={focused} />
						),
					};
				}}
			/>
		</Tab.Navigator>
	);
}
