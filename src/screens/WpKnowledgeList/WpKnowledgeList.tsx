import BackButton from '@/components/atoms/common/BackButton/BackButton';
import { ResourceCardSkeleton } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useGetWpResourcesPaginated } from '@/hooks/queries/wpFeed.queries';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import Header from '@/components/atoms/common/Header/Header';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { normalizeUrl, stripHtml } from '@/util/helper/helper';
import KnowledgeCard from '@/components/molecules/home/WpKnowledgeSection/KnowledgeCard';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

export const getResourceUrl = (item: Patchwork.WPPost): string => {
	return normalizeUrl(item.external_url ?? item.link);
};
export const getResourceTitle = (item: Patchwork.WPPost): string =>
	stripHtml(item.title.rendered).trim() || 'Knowledge';

const WpKnowledgeList = () => {
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useGetWpResourcesPaginated();
	const isDark = colorScheme === 'dark';
	const bgColor = isDark
		? customColor['patchwork-dark-100']
		: customColor['patchwork-grey-50'];

	const allResources = useMemo(
		() => data?.pages.flatMap(p => p.resources) ?? [],
		[data],
	);

	return (
		<SafeScreen style={{ backgroundColor: bgColor }}>
			<Header title="Knowledge" leftCustomComponent={<BackButton />} />
			<View
				style={{
					height: 1,
					backgroundColor: isDark ? '#23363D' : '#E0E0EA',
				}}
			/>

			<View style={{ flex: 1, backgroundColor: bgColor }}>
				{isLoading ? (
					<View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
						{Array.from({ length: 4 }).map((_, i) => (
							<ResourceCardSkeleton key={i} />
						))}
					</View>
				) : (
					<FlatList
						data={allResources}
						keyExtractor={item => item.id.toString()}
						contentContainerStyle={{
							paddingHorizontal: 16,
							paddingTop: 16,
							paddingBottom: 24,
						}}
						showsVerticalScrollIndicator={false}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) fetchNextPage();
						}}
						onEndReachedThreshold={0.3}
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
							<KnowledgeCard
								item={item}
								onPress={() => {
									const url = getResourceUrl(item);
									if (!url) return;
									navigation.navigate('WebViewer', {
										url,
										customTitle: getResourceTitle(item),
										hideExternalOpen: true,
									});
								}}
							/>
						)}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

export default WpKnowledgeList;
