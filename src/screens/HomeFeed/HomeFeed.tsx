import HomeFeedHeader from '@/components/molecules/feed/HomeFeedHeader/HomeFeedHeader';
import { HomeStackScreenProps } from '@/types/navigation';
import { Dimensions, Platform, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth/authStore';
import customColor from '@/util/constant/color';
import { useEffect, useState } from 'react';
import HomeChannelTab from '@/components/organisms/home/HomeChannelTab/HomeChannelTab';
import {
	MaterialTabBar,
	MaterialTabItem,
	Tabs,
} from 'react-native-collapsible-tab-view';
import { isTablet } from '@/util/helper/isTablet';
import { useTranslation } from 'react-i18next';
import { useCheckEmailNotiSetting } from '@/hooks/queries/feed.queries';
import { DEFAULT_INSTANCE } from '@/util/constant';
import HomeFollowingTab from '@/components/organisms/home/HomeFollowingTab/HomeFollowingTab';
import HomeDefaultTab from '@/components/organisms/home/HomeDefaultTab/HomeDefaultTab';
import HomeCommunityTab from '@/components/organisms/home/HomeCommunityTab/HomeCommunityTab';
import HomeForYouTab from '@/components/organisms/home/HomeForYouTab/HomeForYouTab';
import { timelineLabelMap } from '@/util/constant/timeline';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import { usePushNotiTokenMutation } from '@/hooks/mutations/pushNoti.mutation';
import { useColorScheme } from 'nativewind';
import { useTabBarTheme } from '@/hooks/custom/useTabBarTheme';

const { width: windowWidth } = Dimensions.get('window');

const HomeFeed = ({ navigation }: HomeStackScreenProps<'HomeFeed'>) => {
	const { t, i18n } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { userInfo, userOriginInstance, selectedTimeline } = useAuthStore();
	const { barColor, tabBarTextColor, indicatorColor } = useTabBarTheme({
		indicatorStyle: 'primary',
	});
	const timelineLabel = t(
		timelineLabelMap[selectedTimeline as keyof typeof timelineLabelMap],
	);
	const fcmToken = usePushNoticationStore(state => state.fcmToken);

	const { mutate } = usePushNotiTokenMutation({
		onSuccess: () => {
			console.log('Push Notification Token Generated & Saved into database.');
		},
	});

	useEffect(() => {
		if (fcmToken) {
			const notiPayload = {
				notification_token: fcmToken,
				platform_type: Platform.OS,
			};
			mutate(notiPayload);
		}
	}, [fcmToken]);

	useCheckEmailNotiSetting({
		options: {
			enabled: userOriginInstance == DEFAULT_INSTANCE,
			staleTime: Infinity,
			gcTime: Infinity,
		},
	});

	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: barColor,
				paddingLeft: insets.left,
				paddingRight: insets.right,
			}}
		>
			<StatusBar
				barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				translucent
				backgroundColor="transparent"
			/>
			<View style={{ flex: 1, width: '100%' }}>
				<Tabs.Container
					minHeaderHeight={insets.top}
					initialTabName="Home"
					renderHeader={() => (
						<View style={{ paddingTop: insets.top, backgroundColor: barColor }}>
							<HomeFeedHeader account={userInfo!} showUnderLine={false} />
						</View>
					)}
					headerContainerStyle={{
						elevation: 0,
						shadowOpacity: 0,
						shadowColor: 'transparent',
					}}
					lazy
					cancelLazyFadeIn={true}
					pagerProps={{
						scrollEnabled: true,
						overdrag: true,
					}}
					containerStyle={{
						flex: 1,
						elevation: 0,
						shadowOpacity: 0,
						shadowColor: 'transparent',
					}}
					renderTabBar={props => {
						return (
							<MaterialTabBar
								keepActiveTabCentered
								{...props}
								indicatorStyle={{
									backgroundColor: indicatorColor,
									height: 3,
									...(isTablet
										? {
												maxWidth: windowWidth * 0.21,
												marginLeft: windowWidth * 0.0625,
										  }
										: {
												maxWidth: 110,
												marginHorizontal: 12,
										  }),
								}}
								style={{
									backgroundColor: barColor,
								}}
								TabItemComponent={props => (
									<MaterialTabItem
										{...props}
										labelStyle={{
											...((props.labelStyle ?? {}) as object),
										}}
										pressColor="#fff0"
										label={props.label}
										android_ripple={{
											color: '#fff0',
										}}
									/>
								)}
								activeColor={tabBarTextColor}
								labelStyle={{
									fontFamily: 'NewsCycle-Bold',
									textTransform: 'capitalize',
									fontSize: 15,
								}}
								inactiveColor={customColor['patchwork-grey-400']}
							/>
						);
					}}
				>
					<Tabs.Tab name="Home" label={t('timeline.for_you')}>
						<HomeDefaultTab />
					</Tabs.Tab>
					<Tabs.Tab name="Following" label={timelineLabel}>
						{selectedTimeline === 1 ? (
							<HomeFollowingTab />
						) : selectedTimeline === 2 ? (
							<HomeForYouTab />
						) : (
							<HomeCommunityTab />
						)}
					</Tabs.Tab>
					<Tabs.Tab name="Channels" label={t('timeline.channels')}>
						<HomeChannelTab />
					</Tabs.Tab>
				</Tabs.Container>
			</View>
		</View>
	);
};

export default HomeFeed;
