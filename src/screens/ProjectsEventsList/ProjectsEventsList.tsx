import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SkeletonCard } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useGetWpEventsPaginated } from '@/hooks/queries/wpFeed.queries';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CompactEventCard from './CompactEventCard';
import FeaturedEventCard from './FeatureEventCard';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const getFeaturedEventId = (events: Patchwork.WPPost[]) => {
	const now = Date.now();

	const candidates = events
		.map(item => ({
			id: item.id.toString(),
			time: new Date(item.date ?? '').getTime(),
		}))
		.filter(item => Number.isFinite(item.time));

	if (candidates.length === 0) return events[0]?.id.toString() ?? null;

	const upcoming = candidates
		.filter(item => item.time >= now)
		.sort((a, b) => a.time - b.time);
	if (upcoming.length > 0) return upcoming[0].id;

	const latestPast = candidates.sort((a, b) => b.time - a.time)[0];
	return latestPast?.id ?? events[0]?.id.toString() ?? null;
};

const ProjectsEventsList = () => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const isDark = colorScheme === 'dark';
	const bgColor = isDark
		? customColor['patchwork-dark-100']
		: customColor['patchwork-light-900'];
	const cardWidth = clamp(Math.round(width * 0.92), 280, 720);
	const imageHeight = clamp(Math.round(cardWidth * 0.52), 180, 250);

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useGetWpEventsPaginated();

	const allEvents = useMemo(
		() => data?.pages.flatMap(p => p.events) ?? [],
		[data],
	);
	const featuredId = useMemo(() => getFeaturedEventId(allEvents), [allEvents]);
	const featuredEvent = useMemo(
		() => allEvents.find(item => item.id.toString() === featuredId) ?? null,
		[allEvents, featuredId],
	);
	const compactEvents = useMemo(
		() => allEvents.filter(item => item.id.toString() !== featuredId),
		[allEvents, featuredId],
	);

	const navigateToDetail = (item: Patchwork.WPPost) => {
		navigation.navigate('ProjectsEventsDetail', {
			title: item.title?.rendered ?? '',
			date: item.date ?? '',
			excerpt: item.excerpt?.rendered ?? '',
			content: item.content?.rendered ?? '',
			imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url,
			acf: item.acf,
			meta: item.meta,
		});
	};

	const renderHeader = () => {
		if (!featuredEvent) return null;
		return (
			<FeaturedEventCard
				item={featuredEvent}
				cardWidth={cardWidth}
				imageHeight={imageHeight}
				onPress={() => navigateToDetail(featuredEvent)}
			/>
		);
	};

	return (
		<SafeScreen style={{ backgroundColor: bgColor }}>
			<Header
				title={t('home.projects_events', { defaultValue: 'Projects & Events' })}
				leftCustomComponent={<BackButton />}
				style={{ backgroundColor: bgColor }}
			/>
			<View
				style={{
					height: 1,
					backgroundColor: isDark ? '#22343B' : '#EEEEEE',
				}}
			/>
			<View
				style={{
					flex: 1,
					backgroundColor: isDark
						? customColor['patchwork-dark-100']
						: '#F5F5F5',
				}}
			>
				{isLoading ? (
					<View className="items-center pt-4 px-4">
						<SkeletonCard
							width={cardWidth}
							height={imageHeight + 140}
							borderRadius={16}
							style={{ marginBottom: 20 }}
						/>
						{Array.from({ length: 4 }).map((_, i) => (
							<SkeletonCard
								key={i}
								width={cardWidth}
								height={120}
								borderRadius={16}
								style={{ marginBottom: 16 }}
							/>
						))}
					</View>
				) : (
					<FlatList
						data={compactEvents}
						keyExtractor={item => item.id.toString()}
						contentContainerStyle={styles.contentContainer}
						ListHeaderComponent={renderHeader}
						showsVerticalScrollIndicator={false}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) fetchNextPage();
						}}
						onEndReachedThreshold={0.3}
						ListEmptyComponent={
							<ThemeText
								className="text-center mt-8 font-OpenSans_Regular"
								size="fs_13"
								style={{ color: isDark ? '#9FB3BC' : '#888' }}
							>
								{t('home.no_events_found', {
									defaultValue: 'No events found.',
								})}
							</ThemeText>
						}
						ListFooterComponent={
							isFetchingNextPage ? (
								<ActivityIndicator
									size="small"
									color={
										isDark
											? customColor['patchwork-soft-primary']
											: customColor['patchwork-primary']
									}
									style={{ marginVertical: 12 }}
								/>
							) : null
						}
						renderItem={({ item }) => (
							<CompactEventCard
								item={item}
								cardWidth={cardWidth}
								onPress={() => navigateToDetail(item)}
							/>
						)}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	contentContainer: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
		alignItems: 'center',
	},
});

export default ProjectsEventsList;
