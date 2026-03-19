import React, { useCallback, useMemo, useState } from 'react';
import {
	View,
	TouchableOpacity,
	Platform,
	Dimensions,
	RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useAccountDetailFeed } from '@/hooks/queries/feed.queries';
import { HomeStackScreenProps } from '@/types/navigation';
import { flattenPages } from '@/util/helper/timeline';
import { ProfileBackIcon } from '@/util/svg/icon.profile';
import ChannelProfileLoading from '@/components/atoms/loading/ChannelProfileLoading';
import ChannelBannerLoading from '@/components/atoms/loading/ChannelBannerLoading';
import { ScrollProvider } from '@/context/sharedScrollContext/sharedScroll.context';
import FeedTitleHeader from '@/components/atoms/feed/FeedTitleHeader/FeedTitleHeader';
import {
	MaterialTabBar,
	MaterialTabItem,
	Tabs,
} from 'react-native-collapsible-tab-view';
import CollapsibleFeedHeader from '@/components/atoms/feed/CollapsibleFeedHeader/CollapsibleFeedHeader';
import customColor from '@/util/constant/color';
import { useAuthStore } from '@/store/auth/authStore';
import {
	CHANNEL_INSTANCE,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import { CircleFade } from 'react-native-animated-spinkit';
import { AccountInfoQueryKey } from '@/types/queries/profile.type';
import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import { verifyAuthToken } from '@/services/auth.service';
import { useFocusEffect } from '@react-navigation/native';
import { useAccountInfo } from '@/hooks/queries/profile.queries';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import LinkInfoForOtherInstanceUser from '@/components/organisms/profile/LinkInfoForOtherInstanceUser/LinkInfoForOtherInstanceUser';
import { isTablet } from '@/util/helper/isTablet';
import VerticalSwipeHelper from '@/components/atoms/feed/VerticalSwipeHelper/VerticalSwipeHelper';
import { useTranslation } from 'react-i18next';
import { useTabBarTheme } from '@/hooks/custom/useTabBarTheme';
import { delay } from 'lodash';

const Profile: React.FC<HomeStackScreenProps<'Profile'>> = ({
	route,
	navigation,
}) => {
	const { t, i18n } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { bottom, top } = useSafeAreaInsets();
	const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
	const [socialLinkAction, setSocialLinkAction] = useState<{
		visible: boolean;
		formType: 'add' | 'edit';
	}>({ visible: false, formType: 'add' });
	const [linkInfoForOtherInstanceUser, setLinkInfoForOtherInstanceUser] =
		useState<{
			isVisible: boolean;
			linkInfo?: { label: string; content: string };
		}>({ isVisible: false, linkInfo: undefined });
	const isBurmese = i18n.language === 'my';

	const {
		userInfo,
		actions: { setUserInfo },
	} = useAuthStore();
	const { userOriginInstance } = useAuthStore();
	const isDefaultUser = [
		DEFAULT_INSTANCE,
		MO_ME_INSTANCE,
		NEWSMAST_INSTANCE_V1,
		CHANNEL_INSTANCE,
	].includes(userOriginInstance);
	const { barColor, tabBarTextColor } = useTabBarTheme();
	const { resetAttachmentStore } = useManageAttachmentActions();

	const acctInfoQueryKey: AccountInfoQueryKey = [
		'get_account_info',
		{ id: userInfo?.id!, domain_name: userOriginInstance },
	];

	const { data: accountInfoData, refetch: refetchAccountInfo } =
		useAccountInfo(acctInfoQueryKey);

	const {
		data: timeline,
		hasNextPage,
		fetchNextPage,
		isFetching,
		refetch: refetchProfileFeed,
	} = useAccountDetailFeed({
		account_id: userInfo?.id!,
		exclude_replies: true,
		exclude_reblogs: !!isDefaultUser,
		exclude_original_statuses: false,
	});

	const {
		data: replies,
		hasNextPage: hasNextReplies,
		fetchNextPage: fetchReplies,
		isFetching: isFetchingReplies,
		refetch: refetchReplies,
	} = useAccountDetailFeed({
		account_id: userInfo?.id!,
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
		account_id: userInfo?.id!,
		exclude_replies: true,
		exclude_reblogs: false,
		only_reblogs: true,
		options: {
			enabled: !!isDefaultUser,
		},
	});

	const [isRefresh, setIsRefresh] = useState(false);
	const [isRepliesRefresh, setIsRepliesRefresh] = useState(false);
	const [isRepostsRefresh, setIsRepostRefresh] = useState(false);

	const repliesList = useMemo(() => flattenPages(replies), [replies]);
	const repostList = useMemo(() => flattenPages(reposts), [reposts]);

	const onTimelineContentLoadMore = () => {
		if (hasNextPage) {
			return fetchNextPage();
		}
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

	const handleRefresh = async () => {
		setIsRefresh(true);
		refetchProfileFeed();
		refetchAccountInfo();
		const res = await verifyAuthToken();
		setUserInfo(res);
		setIsRefresh(false);
	};

	useFocusEffect(
		useCallback(() => {
			resetAttachmentStore();
		}, []),
	);

	const calculateHeaderHeightForIos = () => {
		if (windowHeight < 680) {
			return 80;
		}
		return windowWidth > 768 ? 80 : 100;
	};

	useFocusEffect(
		useCallback(() => {
			refetchAccountInfo();
			refetchProfileFeed();
			refetchReplies();
			if (isDefaultUser) {
				refetchReposts();
			}
		}, [
			refetchAccountInfo,
			refetchProfileFeed,
			refetchReplies,
			refetchReposts,
			isDefaultUser,
		]),
	);

	return (
		<ScrollProvider>
			<View className="flex-1 bg-patchwork-light-900 dark:bg-patchwork-dark-100">
				{timeline && accountInfoData ? (
					<>
						<FeedTitleHeader
							emojis={accountInfoData.emojis}
							title={accountInfoData.display_name || accountInfoData.username}
							isOwnProfile={true}
						/>
						<VerticalSwipeHelper />
						<Tabs.Container
							tabBarHeight={400}
							renderHeader={() => {
								return (
									<CollapsibleFeedHeader
										type="Profile"
										is_my_account={true}
										// myAcctId={accountInfoData.id}
										profile={accountInfoData}
									/>
								);
							}}
							minHeaderHeight={
								Platform.OS == 'ios' ? calculateHeaderHeightForIos() : 90
							}
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
							<Tabs.Tab label={t('common.posts')} name={'Posts'}>
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
												currentPage="Profile"
												statusType={item.reblog ? 'reblog' : 'normal'}
												extraPayload={
													item.reblog
														? {
																profileFeedQueryId: userInfo?.id,
																profileSource: 'own',
														  }
														: {
																domain_name: userOriginInstance,
														  }
												}
											/>
										);
									}}
									ListEmptyComponent={() => (
										<ListEmptyComponent className="mt-10" />
									)}
									refreshControl={
										<RefreshControl
											className="mt-1"
											refreshing={isRefresh}
											tintColor={colorScheme == 'dark' ? 'white' : 'black'}
											onRefresh={handleRefresh}
										/>
									}
									onEndReachedThreshold={0.15}
									onEndReached={onTimelineContentLoadMore}
									showsVerticalScrollIndicator={false}
									ListFooterComponent={
										isFetching ? (
											<View className="my-3 items-center">
												<CircleFade
													size={25}
													color={colorScheme === 'dark' ? '#fff' : '#000'}
												/>
											</View>
										) : (
											<></>
										)
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
											title={t('common.no_replies_found')}
											className="mt-10"
										/>
									)}
									refreshControl={
										<RefreshControl
											className="mt-1"
											refreshing={isRepliesRefresh}
											tintColor={colorScheme == 'dark' ? 'white' : 'black'}
											onRefresh={() => {
												setIsRepliesRefresh(true);
												delay(() => setIsRepliesRefresh(false), 1500);
												refetchReplies();
											}}
										/>
									}
									onEndReachedThreshold={0.15}
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
																(repliesList.length == 1 ? 300 : 400),
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
			</View>
		</ScrollProvider>
	);
};

export default Profile;
