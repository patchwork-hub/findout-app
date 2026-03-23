import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import TabBar from '@/components/molecules/common/TabBar/TabBar';
import NotiAll from '@/components/organisms/notifications/NotiAll/NotiAll';
import NotiMentions from '@/components/organisms/notifications/NotiMentions/NotiMentions';
import NotiFollowRequest from '@/components/organisms/notifications/NotiFollowRequest/NotiFollowRequest';
import GroupedNotiAll from '@/components/organisms/notifications/GroupedNotiAll/GroupedNotiAll';
import { NotificationScreenRouteProp } from '@/types/navigation';
import { useAuthStore } from '@/store/auth/authStore';
import { useSearchServerInstance } from '@/hooks/queries/auth.queries';
import { checkSupportsNotiV2 } from '@/util/helper/instanceVersionUtils';
import { CHANNEL_INSTANCE } from '@/util/constant';
import NotiTabBarItemLabel from '@/components/atoms/notifications/NotiTabBarItemLabel/NotiTabBarItemLabel';

type TabViewRoute = {
	key: string;
	title: string;
};

const Notification = ({ route }: { route: NotificationScreenRouteProp }) => {
	const tabIndex = route.params.tabIndex;
	const layout = useWindowDimensions();
	const [index, setIndex] = useState(tabIndex);
	const { colorScheme } = useColorScheme();
	const { userOriginInstance, userInfo } = useAuthStore();
	const { t } = useTranslation();

	const { data: serverInfo } = useSearchServerInstance({
		domain: userOriginInstance.replace(/^https:\/\//, ''),
		enabled: userOriginInstance !== CHANNEL_INSTANCE,
	});

	const isSupportNotiV2 = checkSupportsNotiV2(serverInfo?.version || '');
	const isGroupedNoti =
		userOriginInstance === process.env.API_URL ? true : isSupportNotiV2;

	const routes = React.useMemo<TabViewRoute[]>(() => {
		const baseRoutes = [
			{ key: 'all', title: t('notifications.tabs.all') },
			{ key: 'mentions', title: t('notifications.tabs.mentions') },
		];

		if (userInfo?.locked) {
			baseRoutes.push({
				key: 'follow_request',
				title: t('notifications.tabs.follow_requests'),
			});
		}

		return baseRoutes;
	}, [t, userInfo?.locked]);

	const renderScene = ({ route }: { route: TabViewRoute }) => {
		switch (route.key) {
			case 'all':
				return isGroupedNoti ? <GroupedNotiAll /> : <NotiAll />;
			case 'mentions':
				return <NotiMentions />;
			case 'follow_request':
				return <NotiFollowRequest />;
			default:
				return null;
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('screen.notifications')}
				leftCustomComponent={<BackButton />}
			/>
			<TabView
				navigationState={{ index, routes }}
				renderScene={renderScene}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={props => (
					<TabBar
						{...props}
						style={{
							borderBottomWidth: 1,
							borderBottomColor: colorScheme === 'dark' ? '#434A4F' : '#E2E8F0',
						}}
						indicatorStyle={{
							height: 2,
						}}
						tabStyle={{
							width: (layout.width - 32) / routes.length,
							marginTop: -5,
						}}
						renderLabel={({ route, focused }) => (
							<NotiTabBarItemLabel {...{ route, focused }} />
						)}
					/>
				)}
			/>
		</SafeScreen>
	);
};

export default Notification;
