import { useGetForYouTimeline } from '@/hooks/queries/channel.queries';
import { useAuthStore } from '@/store/auth/authStore';
import customColor from '@/util/constant/color';
import { flattenPages } from '@/util/helper/timeline';
import { delay } from 'lodash';
import { useColorScheme } from 'nativewind';
import { useMemo, useState, useRef, useEffect } from 'react';
import { RefreshControl, View, DeviceEventEmitter } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StatusWrapper from '../../feed/StatusWrapper/StatusWrapper';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { CircleFade } from 'react-native-animated-spinkit';
import TimelineLoading from '@/components/atoms/loading/TimelineLoading';
import { FlashList, FlashListRef } from '@shopify/flash-list';

const HomeForYouTab = () => {
	const { colorScheme } = useColorScheme();
	const { userInfo, userOriginInstance } = useAuthStore();
	const [isRefresh, setIsRefresh] = useState(false);
	const { bottom, top } = useSafeAreaInsets();
	const flashListRef = useRef<FlashListRef<Patchwork.Status>>(null);

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

	const {
		data: forYouTimeline,
		hasNextPage: hasForYouTimelineNextPage,
		fetchNextPage: fetchForYouTimelineNextPage,
		isFetching: isForYouTimelineFetching,
		isLoading: isForYouTimelineLoading,
		refetch: refetchForYouTimeline,
	} = useGetForYouTimeline();

	const activityFlattenData = useMemo(
		() => flattenPages(forYouTimeline),
		[forYouTimeline],
	);

	const handleRefresh = async () => {
		setIsRefresh(true);
		refetchForYouTimeline();
		delay(() => setIsRefresh(false), 1500);
	};

	const onActivityLoadMore = () => {
		if (hasForYouTimelineNextPage) {
			return fetchForYouTimelineNextPage();
		}
	};

	return (
		<>
			{isForYouTimelineLoading ? (
				<>
					<View className="flex-1">
						<View style={{ marginTop: top + 120 }}>
							<TimelineLoading />
							<TimelineLoading />
							<TimelineLoading />
						</View>
					</View>
				</>
			) : (
				<Tabs.FlashList
					ref={flashListRef}
					data={activityFlattenData}
					contentContainerStyle={{
						paddingBottom: bottom,
						backgroundColor:
							colorScheme === 'dark'
								? customColor['patchwork-dark-100']
								: '#ffffff',
					}}
					keyExtractor={item => item.id.toString()}
					renderItem={({ item }) => {
						return (
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
					ListEmptyComponent={() => <ListEmptyComponent className="top-32" />}
					refreshControl={
						<RefreshControl
							className="mt-1"
							refreshing={isForYouTimelineFetching || isRefresh}
							tintColor={
								colorScheme === 'dark'
									? customColor['patchwork-light-900']
									: customColor['patchwork-dark-100']
							}
							onRefresh={handleRefresh}
						/>
					}
					onEndReachedThreshold={0.15}
					onEndReached={onActivityLoadMore}
					showsVerticalScrollIndicator={false}
					ListFooterComponent={
						isForYouTimelineFetching ? (
							<View className="my-3 mt-5 items-center">
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
			)}
		</>
	);
};

export default HomeForYouTab;
