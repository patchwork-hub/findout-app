import { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { HomeStackScreenProps } from '@/types/navigation';
import ChannelProfileLoading from '@/components/atoms/loading/ChannelProfileLoading';
import {
	useGetChannelAbout,
	useGetNewsmastChannelDetail,
	useGetNewsmastCommunityDetailBio,
} from '@/hooks/queries/channel.queries';
import { ProfileBackIcon } from '@/util/svg/icon.profile';
import { useTabBarTheme } from '@/hooks/custom/useTabBarTheme';
import { Platform } from 'react-native';
import ChannelBannerLoading from '@/components/atoms/loading/ChannelBannerLoading';
import {
	MaterialTabBar,
	MaterialTabItem,
	Tabs,
} from 'react-native-collapsible-tab-view';
import CollapsibleFeedHeader from '@/components/atoms/feed/CollapsibleFeedHeader/CollapsibleFeedHeader';
import FeedTitleHeader from '@/components/atoms/feed/FeedTitleHeader/FeedTitleHeader';
import { ScrollProvider } from '@/context/sharedScrollContext/sharedScroll.context';
import customColor from '@/util/constant/color';
import {
	NEWSMAST_INSTANCE_V1,
	DEFAULT_FINDOUT_DASHBOARD_API_URL,
} from '@/util/constant';
import { isTablet } from '@/util/helper/isTablet';
import VerticalSwipeHelper from '@/components/atoms/feed/VerticalSwipeHelper/VerticalSwipeHelper';
import { useTranslation } from 'react-i18next';
import ChannelPostsTab from '@/components/molecules/channel/ChannelPostsTab/ChannelPostsTab';
import ChannelAboutTab from '@/components/molecules/channel/ChannelAboutTab/ChannelAboutTab';
import { FloatingAddButton } from '@/components/molecules/conversations/FloatingAddButton/FloatingAddButton';
import { AnimatedFabWrapper } from '@/components/molecules/feed/AnimatedFabWrapper/AnimatedFabWrapper';

const NewsmastChannelTimeline: React.FC<
	HomeStackScreenProps<'NewsmastChannelTimeline'>
> = ({ route, navigation }) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { top } = useSafeAreaInsets();
	const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
	const [isTimelineLoading, setIsTimelineLoading] = useState(true);
	const { barColor, tabBarTextColor } = useTabBarTheme();

	const {
		accountHandle,
		slug: originalSlug,
		avatar_image_url,
		banner_image_url,
		channel_name,
	} = route.params;
	const slug = useMemo(() => {
		return originalSlug.replace(/-/g, '_');
	}, [originalSlug]);

	const { data: newsmastChannelDetail } = useGetNewsmastChannelDetail({
		accountHandle,
	});

	const { data: channelAbout } = useGetChannelAbout(NEWSMAST_INSTANCE_V1);

	const { data: newsmastCommunityDetailBio } = useGetNewsmastCommunityDetailBio(
		{
			id: originalSlug,
			domain_name: accountHandle?.endsWith('findout.media')
				? DEFAULT_FINDOUT_DASHBOARD_API_URL
				: undefined,
			// options: { enabled: !!newsmastChannelDetail },
		},
	);

	const calculateHeaderHeightForIos = () => {
		if (windowHeight < 680) {
			return 80;
		}
		return windowWidth > 768 ? 80 : 100;
	};

	const isHeaderReady = newsmastChannelDetail && newsmastCommunityDetailBio;

	return (
		<ScrollProvider>
			<View className="flex-1 bg-patchwork-light-900 dark:bg-patchwork-dark-100">
				{isHeaderReady && (
					<>
						{!isTimelineLoading && (
							<FeedTitleHeader
								title={newsmastChannelDetail?.display_name || ''}
							/>
						)}
						<VerticalSwipeHelper />
						<Tabs.Container
							renderHeader={() => {
								return (
									<CollapsibleFeedHeader
										type="Channel"
										channel={{
											...channelAbout!,
											description:
												newsmastCommunityDetailBio?.attributes?.description ||
												'',
										}}
										channelInfo={{
											channel_name: channel_name,
											avatar_image_url,
											banner_image_url,
											channel_admin: newsmastChannelDetail?.acct,
											created_at: newsmastChannelDetail?.created_at,
										}}
										isFavouritedChannel={false}
										channelId={''}
										isOwnChannel={true}
									/>
								);
							}}
							minHeaderHeight={
								Platform.OS == 'ios' ? calculateHeaderHeightForIos() : 90
							}
							tabBarHeight={300}
							containerStyle={{ flex: 1 }}
							renderTabBar={props => {
								return (
									<MaterialTabBar
										keepActiveTabCentered
										{...props}
										indicatorStyle={{
											backgroundColor: tabBarTextColor,
											...(isTablet
												? {
														maxWidth: windowWidth * 0.375, //3/8
														marginLeft: windowWidth * 0.0625, // 1/16
												  }
												: { maxWidth: 180, marginHorizontal: 12 }),
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
							lazy
						>
							<Tabs.Tab label={t('common.posts')} name="Posts">
								<ChannelPostsTab
									accountId={newsmastChannelDetail?.id || ''}
									onLoadingChange={setIsTimelineLoading}
								/>
							</Tabs.Tab>
							<Tabs.Tab label={t('common.about')} name="About">
								{channelAbout && (
									<ChannelAboutTab
										note={newsmastChannelDetail?.note || ''}
										adminUsername={
											accountHandle.endsWith('findout.media')
												? accountHandle || ''
												: newsmastCommunityDetailBio?.attributes
														?.community_admin?.username || ''
										}
										rules={channelAbout?.rules}
										hashtags={
											newsmastCommunityDetailBio?.attributes
												?.patchwork_community_hashtags || []
										}
										channelId={newsmastCommunityDetailBio?.id || ''}
										channelSlug={slug}
									/>
								)}
							</Tabs.Tab>
						</Tabs.Container>
					</>
				)}

				{isTimelineLoading && (
					<View className="absolute w-full h-full bg-patchwork-light-900 dark:bg-patchwork-dark-100">
						<View style={{ flex: 1 }}>
							<ChannelBannerLoading />
						</View>
						<View style={{ position: 'absolute', top }}>
							<TouchableOpacity
								onPress={() => navigation.canGoBack() && navigation.goBack()}
								className="w-9 h-9 items-center justify-center rounded-full bg-patchwork-dark-50 ml-4 mb-3"
							>
								<ProfileBackIcon forceLight />
							</TouchableOpacity>
						</View>
						<View style={{ marginTop: 130 }}>
							<ChannelProfileLoading />
						</View>
					</View>
				)}

				<AnimatedFabWrapper isVisible={!isTimelineLoading}>
					<FloatingAddButton
						onPress={() => {
							navigation.navigate('Compose' as any, {
								type: 'create',
								prefilledHashtags:
									newsmastCommunityDetailBio?.attributes
										?.patchwork_community_hashtags,
								prefilledAudience: newsmastCommunityDetailBio?.attributes,
								channelType: accountHandle.endsWith('findout.media')
									? 'local'
									: 'public',
								channelId: newsmastChannelDetail?.id,
							});
						}}
					/>
				</AnimatedFabWrapper>
			</View>
		</ScrollProvider>
	);
};

export default NewsmastChannelTimeline;
