import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useAccountDetailFeed } from '@/hooks/queries/feed.queries';
import { HomeStackScreenProps } from '@/types/navigation';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { flattenPages } from '@/util/helper/timeline';
import { ProfileBackIcon } from '@/util/svg/icon.profile';
import ChannelProfileLoading from '@/components/atoms/loading/ChannelProfileLoading';
import { CircleFade } from 'react-native-animated-spinkit';
import ChannelBannerLoading from '@/components/atoms/loading/ChannelBannerLoading';
import { ScrollProvider } from '@/context/sharedScrollContext/sharedScroll.context';
import FeedTitleHeader from '@/components/atoms/feed/FeedTitleHeader/FeedTitleHeader';
import {
	MaterialTabBar,
	MaterialTabItem,
	Tabs,
} from 'react-native-collapsible-tab-view';
import CollapsibleFeedHeader from '@/components/atoms/feed/CollapsibleFeedHeader/CollapsibleFeedHeader';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import customColor from '@/util/constant/color';
import { RefreshControl } from 'react-native';
import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import {
	useAccountInfo,
	useCheckRelationships,
	useSpecificServerProfile,
} from '@/hooks/queries/profile.queries';
import { AccountInfoQueryKey } from '@/types/queries/profile.type';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import {
	CHANNEL_INSTANCE,
	DEFAULT_API_URL,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import LinkInfoForOtherInstanceUser from '@/components/organisms/profile/LinkInfoForOtherInstanceUser/LinkInfoForOtherInstanceUser';
import { findAccountId } from '@/util/helper/helper';
import { isTablet } from '@/util/helper/isTablet';
import { useAuthStore } from '@/store/auth/authStore';
import { delay } from 'lodash';
import VerticalSwipeHelper from '@/components/atoms/feed/VerticalSwipeHelper/VerticalSwipeHelper';
import { useTranslation } from 'react-i18next';
import { useTabBarTheme } from '@/hooks/custom/useTabBarTheme';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';

const ProfileOther: React.FC<HomeStackScreenProps<'ProfileOther'>> = ({
	route,
	navigation,
}) => {
	const { t, i18n } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { bottom, top } = useSafeAreaInsets();
	const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
	const { id, isFromNoti, isOwnChannelFeed } = route.params;
	const domain_name = useSelectedDomain();
	const { barColor, tabBarTextColor } = useTabBarTheme();
	const { userOriginInstance } = useAuthStore();
	const isDefaultUser = [
		DEFAULT_INSTANCE,
		MO_ME_INSTANCE,
		NEWSMAST_INSTANCE_V1,
		CHANNEL_INSTANCE,
	].includes(userOriginInstance);
	const isBurmese = i18n.language === 'my';

	const [linkInfoForOtherInstanceUser, setLinkInfoForOtherInstanceUser] =
		useState<{
			isVisible: boolean;
			linkInfo?: { label: string; content: string };
		}>({ isVisible: false, linkInfo: undefined });

	const acctInfoQueryKey: AccountInfoQueryKey = [
		'get_account_info',
		{
			id,
			domain_name: isFromNoti ? DEFAULT_API_URL : domain_name,
		},
	];

	const { data: accountInfoData, refetch: refetchAccountInfo } =
		useAccountInfo(acctInfoQueryKey);

	const { data: specificServerProfile } = useSpecificServerProfile({
		q: accountInfoData?.url as string,
		options: {
			enabled: !!accountInfoData?.url,
		},
	});

	const accountId = findAccountId(specificServerProfile, accountInfoData);

	const commonFeedParams = {
		domain_name: isFromNoti ? DEFAULT_API_URL : domain_name,
		account_id: id,
	};

	const { data: relationships, refetch: refetchRelationships } =
		useCheckRelationships({
			accountIds: [accountId || ''],
			options: {
				enabled: !!accountId,
			},
		});

	const {
		data: timeline,
		hasNextPage,
		fetchNextPage,
		refetch: refreshProfileTimeline,
		isFetching,
	} = useAccountDetailFeed({
		...commonFeedParams,
		exclude_reblogs: !!isDefaultUser,
		exclude_replies: true,
		exclude_original_statuses: false,
	});

	const {
		data: replies,
		hasNextPage: hasNextReplies,
		fetchNextPage: fetchReplies,
		isFetching: isFetchingReplies,
		refetch: refetchReplies,
	} = useAccountDetailFeed({
		...commonFeedParams,
		exclude_replies: false,
		exclude_reblogs: true,
		exclude_original_statuses: true,
	});

	const {
		data: reposts,
		hasNextPage: hasNextReposts,
		fetchNextPage: fetchReposts,
		isFetching: isFetchingReposts,
		refetch: refetchReposts,
	} = useAccountDetailFeed({
		...commonFeedParams,
		exclude_replies: true,
		exclude_reblogs: false,
		only_reblogs: true,
		options: {
			enabled: !!isDefaultUser,
		},
	});

	const repliesList = useMemo(() => flattenPages(replies), [replies]);
	const repostList = useMemo(() => flattenPages(reposts), [reposts]);

	const [isRepostsRefresh, setIsRepostRefresh] = useState(false);

	const onTimelineContentLoadMore = () => {
		if (hasNextPage) {
			return fetchNextPage();
		}
	};

	const handleRefresh = () => {
		refreshProfileTimeline();
		refetchAccountInfo();
		refetchRelationships();
	};

	const onReplyFeedLoadMore = () => {
		if (hasNextReplies) {
			return fetchReplies();
		}
	};
	const onRepostFeedLoadMore = () => {
		if (hasNextReposts) {
			return fetchReposts();
		}
	};

	const calculateHeaderHeightForIos = () => {
		if (windowHeight < 680) {
			return 80;
		}
		return windowWidth > 768 ? 80 : 100;
	};
	const stickyHeaderHeight = top + 45;

	return (
		<ScrollProvider>
			<SafeScreen isTopSafe={false}>
				{timeline && accountInfoData ? (
					<>
						<View
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								zIndex: 100,
								elevation: 100,
							}}
							pointerEvents="box-none"
						>
							<FeedTitleHeader
								emojis={accountInfoData.emojis}
								title={
									accountInfoData.display_name || accountInfoData?.username
								}
							/>
						</View>
						<VerticalSwipeHelper />
						<Tabs.Container
							renderHeader={() => {
								return (
									<CollapsibleFeedHeader
										type="Profile"
										is_my_account={false}
										profile={accountInfoData}
										specifyServerAccId={specificServerProfile?.accounts[0]?.id}
										otherUserId={id}
										relationships={relationships}
										isFromNoti={isFromNoti}
										isOwnChannelFeed={isOwnChannelFeed}
									/>
								);
							}}
							minHeaderHeight={
								Platform.OS == 'ios'
									? calculateHeaderHeightForIos()
									: stickyHeaderHeight
							}
							tabBarHeight={400}
							containerStyle={{ flex: 1 }}
							lazy={true}
							renderTabBar={props => {
								return (
									<MaterialTabBar
										keepActiveTabCentered
										{...props}
										indicatorStyle={{
											backgroundColor: tabBarTextColor,
											...(isTablet
												? {
														maxWidth: windowWidth * 0.375,
														marginLeft: windowWidth * 0.0625,
												  }
												: {
														maxWidth: isDefaultUser ? 110 : 160,
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
													lineHeight: isBurmese ? 32 : undefined,
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
							<Tabs.Tab label={t('common.posts')} name="Posts">
								<Tabs.FlashList
									data={flattenPages(timeline)}
									contentContainerStyle={{
										paddingBottom: bottom,
										backgroundColor:
											colorScheme === 'dark'
												? customColor['patchwork-dark-100']
												: '#ffffff',
										paddingHorizontal: isTablet ? 10 : 0,
									}}
									keyExtractor={item => item.id.toString()}
									renderItem={({ item }) => {
										return item.in_reply_to_id ? (
											<></>
										) : (
											<StatusWrapper
												status={item}
												comeFrom={isFromNoti ? 'noti' : 'other'}
												currentPage="ProfileOther"
												statusType={item.reblog ? 'reblog' : 'normal'}
												extraPayload={
													item.reblog
														? {
																profileFeedQueryId: id,
																profileSource: 'other',
														  }
														: {
																domain_name:
																	process.env.API_URL ?? DEFAULT_API_URL,
														  }
												}
											/>
										);
									}}
									onEndReachedThreshold={0.15}
									onEndReached={onTimelineContentLoadMore}
									showsVerticalScrollIndicator={false}
									ListEmptyComponent={<ListEmptyComponent className="mt-10" />}
									ListFooterComponent={
										isFetching ? (
											<View className="my-3 items-center">
												<CircleFade
													size={25}
													color={colorScheme === 'dark' ? '#fff' : '#000'}
												/>
											</View>
										) : (
											<>
												{repliesList.length <= 5 && (
													<View
														style={{
															height:
																Dimensions.get('window').height -
																(repliesList.length == 1 ? 300 : 400),
														}}
													/>
												)}
											</>
										)
									}
									refreshControl={
										<RefreshControl
											refreshing={isFetching}
											tintColor={colorScheme == 'dark' ? 'white' : 'black'}
											onRefresh={handleRefresh}
										/>
									}
								/>
							</Tabs.Tab>
							<Tabs.Tab
								label={
									isDefaultUser
										? t('common.replies')
										: t('common.posts_and_replies')
								}
								name={isDefaultUser ? 'Replies' : 'Posts&Replies'}
							>
								<Tabs.FlashList
									data={repliesList}
									contentContainerStyle={{
										paddingBottom: bottom,
										backgroundColor:
											colorScheme === 'dark'
												? customColor['patchwork-dark-100']
												: '#ffffff',
										paddingHorizontal: isTablet ? 10 : 0,
									}}
									keyExtractor={item => item.id.toString()}
									renderItem={({ item }) => {
										return (
											<StatusWrapper
												status={item}
												comeFrom={isFromNoti ? 'noti' : 'other'}
												currentPage="ProfileOther"
												statusType={item.reblog ? 'reblog' : 'normal'}
												extraPayload={{ isFromReplyTab: true }}
											/>
										);
									}}
									refreshControl={
										<RefreshControl
											className="mt-1"
											refreshing={isFetchingReplies}
											tintColor={colorScheme == 'dark' ? 'white' : 'black'}
											onRefresh={() => {
												refetchReplies();
											}}
										/>
									}
									onEndReachedThreshold={0.15}
									ListEmptyComponent={() => {
										return (
											<ListEmptyComponent
												title={t('common.no_replies_found')}
												className="mt-10"
											/>
										);
									}}
									onEndReached={onReplyFeedLoadMore}
									showsVerticalScrollIndicator={false}
									ListFooterComponent={
										isFetchingReplies ? (
											<View className="my-3 items-center">
												<CircleFade
													size={25}
													color={colorScheme === 'dark' ? '#fff' : '#000'}
												/>
											</View>
										) : (
											<>
												{repliesList.length <= 5 && (
													<View
														style={{
															height:
																Dimensions.get('window').height -
																(repostList.length == 1 ? 300 : 400),
														}}
													/>
												)}
											</>
										)
									}
								/>
							</Tabs.Tab>
							{isDefaultUser ? (
								<Tabs.Tab label={t('common.reposts')} name="Reposts">
									<Tabs.FlashList
										data={repostList}
										contentContainerStyle={{
											paddingBottom: bottom,
											backgroundColor:
												colorScheme === 'dark'
													? customColor['patchwork-dark-100']
													: '#ffffff',
											paddingHorizontal: isTablet ? 10 : 0,
										}}
										keyExtractor={item => item.id.toString()}
										renderItem={({ item }) => {
											return (
												<>
													<StatusWrapper
														status={item}
														currentPage="Profile"
														statusType={item.reblog ? 'reblog' : 'normal'}
													/>
												</>
											);
										}}
										ListEmptyComponent={() => (
											<ListEmptyComponent
												title={t('common.no_reposts_found')}
												className="mt-10"
											/>
										)}
										refreshControl={
											<RefreshControl
												className="mt-1"
												refreshing={isRepostsRefresh}
												tintColor={colorScheme == 'dark' ? 'white' : 'black'}
												onRefresh={() => {
													setIsRepostRefresh(true);
													delay(() => setIsRepostRefresh(false), 1500);
													refetchReposts();
												}}
											/>
										}
										onEndReachedThreshold={0.15}
										onEndReached={onRepostFeedLoadMore}
										showsVerticalScrollIndicator={false}
										ListFooterComponent={
											isFetchingReposts ? (
												<View className="my-3 items-center">
													<CircleFade
														size={25}
														color={colorScheme === 'dark' ? '#fff' : '#000'}
													/>
												</View>
											) : (
												<>
													{repostList.length <= 5 && (
														<View
															style={{
																height:
																	Dimensions.get('window').height -
																	(repostList.length == 1 ? 300 : 400),
															}}
														/>
													)}
												</>
											)
										}
									/>
								</Tabs.Tab>
							) : null}
						</Tabs.Container>
						<LinkInfoForOtherInstanceUser
							openThemeModal={linkInfoForOtherInstanceUser.isVisible}
							onClose={() =>
								setLinkInfoForOtherInstanceUser({ isVisible: false })
							}
							data={linkInfoForOtherInstanceUser.linkInfo}
						/>
					</>
				) : (
					<View className="flex-1">
						<ChannelBannerLoading />
						<View style={{ position: 'absolute', top }}>
							<TouchableOpacity
								onPress={() => navigation.canGoBack() && navigation.goBack()}
								className="w-9 h-9 items-center justify-center rounded-full bg-patchwork-dark-50 ml-4 mb-3"
							>
								<ProfileBackIcon forceLight />
							</TouchableOpacity>
						</View>
						<View style={{ marginTop: -30 }}>
							<ChannelProfileLoading />
						</View>
					</View>
				)}
			</SafeScreen>
		</ScrollProvider>
	);
};

export default ProfileOther;
