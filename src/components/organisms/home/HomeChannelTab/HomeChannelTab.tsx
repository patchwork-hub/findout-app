import AvatarLoading from '@/components/atoms/loading/AvatarLoading';
import ChannelLoading from '@/components/atoms/loading/ChannelLoading';
import HashtagLoading from '@/components/atoms/loading/HashtagLoading';
import { HashtagsFollowingSection } from '@/components/molecules/home/HashtagsFollowingSection/HashtagsFollowingSection';
import { HorizontalChannelSection } from '@/components/molecules/home/HorizontalChannelSection/HorizontalChannelSection';
import { MyListsSection } from '@/components/molecules/home/MyListsSection/MyListsSection';
import { NewsmastCollectionSection } from '@/components/molecules/home/NewsmastCollectionSection/NewsmastCollectionSection';
import { PeopleFollowingSection } from '@/components/molecules/home/PeopleFollowingSection/PeopleFollowingSection';
import {
	useCollectionChannelList,
	useGetCatchUpChannelList,
	useGetSpeakOutChannelList,
	useGetForYouChannelList,
	useNewsmastCollectionList,
} from '@/hooks/queries/channel.queries';
import { useGetHashtagsFollowing } from '@/hooks/queries/hashtag.queries';
import { useListsQueries } from '@/hooks/queries/lists.queries';
import { useFollowingAccountsQuery } from '@/hooks/queries/profile.queries';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { HomeStackParamList } from '@/types/navigation';
import { CHANNEL_INSTANCE } from '@/util/constant';
import customColor from '@/util/constant/color';
import { defaultAppStoreTesterAcctHandle } from '@/util/constant/common';
import { isTablet } from '@/util/helper/isTablet';
import { flattenPages } from '@/util/helper/timeline';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { delay } from 'lodash';
import { useColorScheme } from 'nativewind';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, DeviceEventEmitter } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';

const HomeChannelTab = () => {
	const scrollViewRef = useRef<ScrollView>(null);

	useEffect(() => {
		const scrollToTopListener = DeviceEventEmitter.addListener(
			'scrollToTopHomeFeed',
			() => {
				scrollViewRef.current?.scrollTo({ y: 0, animated: true });
			},
		);
		return () => {
			scrollToTopListener.remove();
		};
	}, []);

	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { userOriginInstance, userInfo } = useAuthStore();
	const domain_name = useActiveDomainStore(state => state.domain_name);
	const { actions } = useActiveDomainStore();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const loadingCardCount = isTablet ? 10 : 5;

	const {
		data: forYouChannelList,
		refetch: refetchForYouChannelList,
		isSuccess: isForYouChannelListSuccess,
	} = useGetForYouChannelList();

	const { data: catchUpList, refetch: refetchCatchUpList } =
		useGetCatchUpChannelList();

	const { data: speakOutList, refetch: refetchSpeakOutList } =
		useGetSpeakOutChannelList();

	const { data: collectionList, refetch: refetchCollectionList } =
		useCollectionChannelList();

	const { data: newsmastCollections, refetch: refetchNewsmastCollections } =
		useNewsmastCollectionList({});

	const { data: myLists, refetch: refetchMyLists } = useListsQueries();

	const { data: hashtagsFollowing, refetch: refetchHashtagsFollowing } =
		useGetHashtagsFollowing({
			limit: 10,
			domain_name: domain_name,
			options: { enabled: domain_name === userOriginInstance },
		});

	// const { data: channelFeedList, refetch: refetchChannelFeed } =
	// 	useGetChannelFeedListQuery({
	// 		enabled:
	// 			userOriginInstance === CHANNEL_INSTANCE
	// 				? isForYouChannelListSuccess
	// 				: true,
	// 	});

	const { data: peopleFollowing, refetch: refetchPeopleFollowing } =
		useFollowingAccountsQuery({
			accountId: userInfo?.id!,
			domain_name: domain_name,
			options: { enabled: domain_name === userOriginInstance },
		});

	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = () => {
		setIsRefreshing(true);
		refetchCollectionList();
		refetchMyLists();
		refetchPeopleFollowing();
		refetchHashtagsFollowing();
		refetchNewsmastCollections();
		refetchForYouChannelList();
		refetchCatchUpList();
		refetchSpeakOutList();
		delay(() => setIsRefreshing(false), 2000);
	};

	useFocusEffect(
		useCallback(() => {
			if (domain_name !== userOriginInstance) {
				actions.setDomain(userOriginInstance);
			}
		}, [domain_name]),
	);

	const onPressMyNewsmastChannelItem = (item: Patchwork.ChannelList) => {
		navigation.navigate('NewsmastChannelTimeline', {
			accountHandle: item?.attributes?.community_admin?.username,
			fetchTimelineFromLoggedInServer: true,
			slug: item?.attributes?.slug,
			avatar_image_url: item?.attributes?.avatar_image_url,
			banner_image_url: item?.attributes?.banner_image_url,
			channel_name: item?.attributes?.name,
		});
	};

	const onPressPeopleFollowingAll = () =>
		navigation.navigate('PeopleFollowing');
	const onPressPeopleFollowingItem = (item: Patchwork.Account) =>
		navigation.navigate('ProfileOther', { id: item.id });
	const onPressFollowing = () => navigation.navigate('PeopleFollowing');

	const onPressMyListsAll = () =>
		navigation.navigate('ListsStack', { screen: 'Lists' });

	const onPressHashtagsFollowingAll = () =>
		navigation.navigate('HashtagsFollowing');

	return (
		<>
			{collectionList ? (
				<Tabs.ScrollView
					ref={scrollViewRef}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							tintColor={
								colorScheme === 'dark'
									? customColor['patchwork-light-900']
									: customColor['patchwork-dark-100']
							}
							onRefresh={handleRefresh}
						/>
					}
					showsVerticalScrollIndicator={false}
				>
					{forYouChannelList && (
						<HorizontalChannelSection
							title={'Find Out Media Shows'}
							data={forYouChannelList}
							onPressItem={onPressMyNewsmastChannelItem}
							onPressViewAll={() => {
								navigation.navigate('ViewAllChannelScreen', {
									title: 'Find Out Media Shows',
									data: forYouChannelList,
								});
							}}
						/>
					)}
					{catchUpList && (
						<HorizontalChannelSection
							title={'News'}
							data={catchUpList}
							onPressItem={onPressMyNewsmastChannelItem}
							onPressViewAll={() => {
								navigation.navigate('ViewAllChannelScreen', {
									title: 'News',
									data: catchUpList,
								});
							}}
						/>
					)}
					{speakOutList && (
						<HorizontalChannelSection
							title={'Activism'}
							data={speakOutList}
							onPressItem={onPressMyNewsmastChannelItem}
							onPressViewAll={() => {
								navigation.navigate('ViewAllChannelScreen', {
									title: 'Activism',
									data: speakOutList,
								});
							}}
						/>
					)}

					{/* <StarterPackSection /> */}

					{flattenPages(peopleFollowing).length > 0 && (
						<PeopleFollowingSection
							data={flattenPages(peopleFollowing)}
							onPressItem={onPressPeopleFollowingItem}
							onPressViewAll={onPressPeopleFollowingAll}
							onPressFollowing={onPressFollowing}
						/>
					)}

					{newsmastCollections && newsmastCollections.length > 0 && (
						<NewsmastCollectionSection data={newsmastCollections} />
					)}

					{hashtagsFollowing && hashtagsFollowing.length > 0 && (
						<HashtagsFollowingSection
							data={hashtagsFollowing}
							onPressViewAll={onPressHashtagsFollowingAll}
						/>
					)}
					<MyListsSection data={myLists} onPressViewAll={onPressMyListsAll} />
				</Tabs.ScrollView>
			) : (
				<Tabs.ScrollView
					contentContainerStyle={{ marginHorizontal: 16, overflow: 'hidden' }}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							tintColor={
								colorScheme === 'dark'
									? customColor['patchwork-light-900']
									: customColor['patchwork-dark-100']
							}
							onRefresh={handleRefresh}
						/>
					}
					showsVerticalScrollIndicator={false}
				>
					<ChannelLoading
						title="Find Out Media Shows"
						cardCount={loadingCardCount}
					/>
					<ChannelLoading title="News" cardCount={loadingCardCount} />
					<ChannelLoading title="Activism" cardCount={loadingCardCount} />
					<ChannelLoading
						title="Starter Packs"
						cardCount={loadingCardCount}
						customHeight={160}
						customWidth={280}
					/>
					{userOriginInstance !== CHANNEL_INSTANCE && (
						<AvatarLoading title="Following" cardCount={loadingCardCount} />
					)}
					<ChannelLoading
						title="Newsmast Channels"
						cardCount={loadingCardCount}
					/>
					<ChannelLoading title="Channels" cardCount={loadingCardCount} />

					{userInfo?.acct !== defaultAppStoreTesterAcctHandle && (
						<ChannelLoading title="Communities" cardCount={loadingCardCount} />
					)}
					{userOriginInstance === CHANNEL_INSTANCE && (
						<AvatarLoading title="Following" cardCount={loadingCardCount} />
					)}
					<HashtagLoading
						title="Hashtags Following"
						cardCount={loadingCardCount}
					/>
					<HashtagLoading title="My Lists" cardCount={loadingCardCount} />
				</Tabs.ScrollView>
			)}
		</>
	);
};

export default HomeChannelTab;
