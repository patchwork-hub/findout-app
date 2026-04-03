import customColor from '@/util/constant/color';
import { delay, chunk } from 'lodash';
import { useColorScheme } from 'nativewind';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
	Dimensions,
	Platform,
	RefreshControl,
	View,
	ViewToken,
	DeviceEventEmitter,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { Tabs } from 'react-native-collapsible-tab-view';
import { queryClient } from '@/App';
import { useWordpressFeed } from '@/hooks/queries/wpFeed.queries';
import { Flow } from 'react-native-animated-spinkit';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPodcast } from '@fortawesome/free-solid-svg-icons';
import VideoFeedItem from '@/components/molecules/home/VideoFeedItem/VideoFeedItem';
import PreloadManager from '@/components/molecules/home/PreloadManager/PreloadManager';
import LiveVideoFeedFilterBar from '@/components/atoms/feed/LiveVideoFeedFilterBar/LiveVideoFeedFilterBar';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WpstoryCard } from '@/components/molecules/home/WpStoryCard/WpStoryCard';
import { CommentsSheet } from '@/components/organisms/home/CommentsSheet/CommentsSheet';
import { ContentSheet } from '@/components/organisms/feed/ContentSheet/ContentSheet';
import { LikeSheet } from '../../feed/LikeSheet/LikeSheet';
import { cn } from '@/util/helper/twutil';

const { height: screenHeight } = Dimensions.get('window');

const HomeDefaultTab = () => {
	const { colorScheme } = useColorScheme();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
	const [filter, setFilter] = useState('Most recent');
	const [selectedCategoryId, setSelectedCategoryId] = useState<
		number | string | undefined
	>();
	const insets = useSafeAreaInsets();
	const bottomTabBarHeight = useBottomTabBarHeight();
	const tabBarHeight =
		bottomTabBarHeight || (Platform.OS === 'ios' ? 60 + insets.bottom : 90);
	const VISIBLE_HEIGHT = screenHeight - tabBarHeight - insets.top - 58;

	const order = filter === 'Oldest' ? 'asc' : 'desc';
	const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
		useWordpressFeed(order, selectedCategoryId);

	const handleFilterChange = (
		newFilter: string,
		categoryId?: number | string,
	) => {
		setFilter(newFilter);
		setSelectedCategoryId(categoryId);
	};
	const feedItems = data?.pages.flatMap(page => page.posts) ?? [];
	const displayData = viewMode === 'list' ? feedItems : chunk(feedItems, 2);

	const flashListRef = useRef<FlashListRef<any>>(null);

	useEffect(() => {
		const scrollToTopListener = DeviceEventEmitter.addListener(
			'scrollToTopHomeFeed',
			() => {
				flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
			},
		);
		return () => {
			scrollToTopListener.remove();
		};
	}, []);

	useEffect(() => {
		setCurrentIndex(0);
	}, [filter]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		delay(() => setIsRefreshing(false), 2000);
		await queryClient.invalidateQueries({
			queryKey: ['wordpressFeed', order],
		});
	};

	const handleEndReached = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0) {
				const index = viewableItems[0].index;
				if (index !== null && index !== undefined) {
					setCurrentIndex(index);
				}
			}
		},
		[],
	);

	const viewabilityConfig = useRef({
		itemVisiblePercentThreshold: 50,
	}).current;

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colorScheme === 'dark' ? 'black' : 'white',
			}}
		>
			<PreloadManager posts={feedItems} currentIndex={currentIndex} />

			<Tabs.FlashList
				ref={flashListRef}
				key={filter}
				data={displayData}
				ListHeaderComponent={
					viewMode == 'list' ? (
						<></>
					) : (
						<View className="mb-4">
							<LiveVideoFeedFilterBar
								viewMode={viewMode}
								onViewModeChange={setViewMode}
								filter={filter}
								onFilterChange={handleFilterChange}
							/>
						</View>
					)
				}
				renderItem={({ item, index }) =>
					viewMode === 'list' ? (
						<View
							style={{
								height: VISIBLE_HEIGHT,
								width: '100%',
							}}
						>
							{index == 0 && (
								<View
									className={cn(
										'absolute left-0 right-0',
										Platform.OS === 'ios' ? '-top-[100]' : 'top-14',
									)}
								>
									<LiveVideoFeedFilterBar
										viewMode={viewMode}
										onViewModeChange={setViewMode}
										filter={filter}
										onFilterChange={handleFilterChange}
									/>
								</View>
							)}
							<VideoFeedItem
								post={item as Patchwork.WPStory}
								isActive={index === currentIndex}
								isPreloading={index === currentIndex + 1}
								index={index}
								visibleHeight={VISIBLE_HEIGHT}
							/>
						</View>
					) : (
						<View className="flex-row">
							{(item as Patchwork.WPStory[]).map(subItem => (
								<View className="flex-1 p-2" key={subItem.id}>
									<WpstoryCard
										post={subItem}
										isFullWidth={true}
										variant="video-grid"
									/>
								</View>
							))}
							{(item as Patchwork.WPStory[]).length === 1 && (
								<View className="flex-1 p-2" />
							)}
						</View>
					)
				}
				contentContainerStyle={{
					paddingTop:
						viewMode == 'list' ? 120 : Platform.OS === 'android' ? 175 : 20,
				}}
				snapToInterval={viewMode === 'list' ? VISIBLE_HEIGHT : undefined}
				snapToAlignment={viewMode === 'list' ? 'start' : undefined}
				decelerationRate={viewMode === 'list' ? 'fast' : 'normal'}
				keyboardShouldPersistTaps="handled"
				keyExtractor={item =>
					viewMode === 'list'
						? (item as Patchwork.WPStory).id.toString()
						: (item as Patchwork.WPStory[])[0].id.toString()
				}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				// drawDistance={VISIBLE_HEIGHT * 4}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						tintColor={'white'}
						onRefresh={handleRefresh}
					/>
				}
				ListEmptyComponent={() => {
					return (
						<View style={{ flex: 1, minHeight: VISIBLE_HEIGHT }}>
							{viewMode === 'list' && (
								<View
									className={cn(
										'absolute left-0 right-0 z-50',
										Platform.OS === 'ios' ? '-top-[100]' : 'top-14',
									)}
								>
									<LiveVideoFeedFilterBar
										viewMode={viewMode}
										onViewModeChange={setViewMode}
										filter={filter}
										onFilterChange={handleFilterChange}
									/>
								</View>
							)}
							{isLoading ? (
								<View
									style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Flow
										size={32}
										color={
											colorScheme === 'dark'
												? customColor['patchwork-primary-dark']
												: customColor['patchwork-primary']
										}
									/>
								</View>
							) : (
								<View
									style={{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									}}
									className="px-6 -mt-32"
								>
									<View className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-gray-800">
										<FontAwesomeIcon
											icon={faPodcast}
											size={48}
											color={colorScheme === 'dark' ? '#9ca3af' : '#9ca3af'}
										/>
									</View>
									<ThemeText className="text-xl font-bold text-center mb-2">
										No podcast found
									</ThemeText>
									<ThemeText className="text-center text-gray-500 dark:text-gray-400">
										There are currently no podcasts available for this category.
										Please try selecting a different category or check back
										later.
									</ThemeText>
								</View>
							)}
						</View>
					);
				}}
				onEndReachedThreshold={0.5}
				onEndReached={handleEndReached}
				showsVerticalScrollIndicator={false}
			/>

			<CommentsSheet />
			<ContentSheet />
			<LikeSheet />
		</View>
	);
};

export default HomeDefaultTab;
