import React, { useMemo, useState, useEffect } from 'react';
import { View, RefreshControl, Platform, Dimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { CircleFade } from 'react-native-animated-spinkit';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useTranslation } from 'react-i18next';
import { delay } from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import customColor from '@/util/constant/color';
import { flattenPages } from '@/util/helper/timeline';
import { isTablet } from '@/util/helper/isTablet';
import { useAccountDetailFeed } from '@/hooks/queries/feed.queries';
import { useAuthStore } from '@/store/auth/authStore';

interface ChannelPostsTabProps {
	accountId: string;
	onLoadingChange?: (isLoading: boolean) => void;
}

const ChannelPostsTab: React.FC<ChannelPostsTabProps> = ({
	accountId,
	onLoadingChange,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { bottom } = useSafeAreaInsets();
	const [isRefresh, setIsRefresh] = useState(false);
	const { userOriginInstance } = useAuthStore();

	const {
		data: timeline,
		hasNextPage,
		fetchNextPage,
		refetch: refreshNewsmastTimeline,
		isFetching,
		isLoading,
	} = useAccountDetailFeed({
		account_id: accountId || '',
		exclude_reblogs: false,
		exclude_replies: true,
		exclude_original_statuses: false,
		options: { enabled: !!accountId },
	});

	useEffect(() => {
		if (onLoadingChange) {
			onLoadingChange(isLoading);
		}
	}, [isLoading, onLoadingChange]);

	const feed = useMemo(() => flattenPages(timeline), [timeline]);

	useEffect(() => {
		if (
			timeline?.pages?.length === 1 &&
			hasNextPage &&
			!isFetching &&
			!isLoading
		) {
			fetchNextPage();
		}
	}, [
		timeline?.pages?.length,
		hasNextPage,
		isFetching,
		isLoading,
		fetchNextPage,
	]);

	const onTimelineContentLoadMore = () => {
		if (hasNextPage) {
			return fetchNextPage();
		}
	};

	const handleRefresh = () => {
		setIsRefresh(true);
		refreshNewsmastTimeline();
		delay(() => setIsRefresh(false), 1500);
	};

	return (
		<Tabs.FlashList
			data={feed}
			contentContainerStyle={{
				paddingBottom: bottom,
				backgroundColor:
					colorScheme === 'dark'
						? customColor['patchwork-dark-100']
						: '#ffffff',
				paddingHorizontal: isTablet ? 10 : 0,
			}}
			keyExtractor={item => item.id.toString()}
			renderItem={({ item }) => (
				<StatusWrapper
					status={item}
					comeFrom={'other'}
					currentPage="NewsmastChannelTimeline"
					statusType={item.reblog ? 'channel-feed' : 'normal'}
					extraPayload={
						item.reblog
							? {
									profileFeedQueryId: accountId,
									profileSource: 'other',
							  }
							: {
									domain_name: userOriginInstance,
							  }
					}
				/>
			)}
			refreshControl={
				<RefreshControl
					refreshing={isRefresh}
					tintColor={colorScheme == 'dark' ? 'white' : 'black'}
					onRefresh={handleRefresh}
				/>
			}
			ListEmptyComponent={() => {
				return <ListEmptyComponent />;
			}}
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
	);
};

export default ChannelPostsTab;
