import BackButton from '@/components/atoms/common/BackButton/BackButton';
import { ResourceCardSkeleton } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useGetWordpressPostsByCategoryPaginated } from '@/hooks/queries/wpFeed.queries';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo } from 'react';
import Header from '@/components/atoms/common/Header/Header';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { stripHtml } from '@/util/helper/helper';
import NewsListCard from '@/components/molecules/home/WpNewsSection/NewsListCard';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const WpNewsList = () => {
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const isDark = colorScheme === 'dark';
	const bgColor = isDark
		? customColor['patchwork-dark-100']
		: customColor['patchwork-grey-50'];
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useGetWordpressPostsByCategoryPaginated(undefined);

	const allPosts = useMemo(
		() => data?.pages.flatMap(p => p.posts) ?? [],
		[data],
	);

	return (
		<SafeScreen style={{ backgroundColor: bgColor }}>
			<Header title="News" leftCustomComponent={<BackButton />} />
			<View
				style={{ height: 1, backgroundColor: isDark ? '#23363D' : '#E0E0EA' }}
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
						data={allPosts}
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
							<NewsListCard
								item={item as unknown as Patchwork.WPPost}
								onPress={() => {
									const post = item as unknown as Patchwork.WPPost;
									navigation.navigate('WpNewsDetail', {
										title: stripHtml(item.title.rendered),
										date: item.date,
										content:
											post.content?.rendered ?? post.excerpt?.rendered ?? '',
										link: item.link,
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

export default WpNewsList;
