import { NewsCardSkeleton } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import WpNewsCard from '@/components/molecules/home/WpNewsCard/WpNewsCard';
import WpSectionHeader from '@/components/molecules/home/WpSectionHeader/WpSectionHeader';
import { useGetWordpressPostsByCategoryId } from '@/hooks/queries/wpFeed.queries';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { getWpNewsCardSize } from '../cardSizing';

const WpNewsSection = () => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { width: screenWidth } = useWindowDimensions();
	const { width: cardWidth, height: cardHeight } =
		getWpNewsCardSize(screenWidth);
	const { data: posts, isLoading } = useGetWordpressPostsByCategoryId({
		categoryId: 0,
		limit: 10,
	});

	if (!isLoading && (!posts || posts.length === 0)) return null;

	return (
		<View className="mb-2">
			<View className="px-4">
				<WpSectionHeader
					title="News"
					onViewAll={() => navigation.navigate('WpNewsList')}
				/>
			</View>
			<ScrollView
				horizontal
				scrollEnabled
				nestedScrollEnabled
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingLeft: 16 }}
			>
				{isLoading
					? Array.from({ length: 3 }).map((_, i) => (
							<NewsCardSkeleton key={i} width={cardWidth} height={cardHeight} />
					  ))
					: posts!.map(item => (
							<WpNewsCard
								key={item.id.toString()}
								item={item as unknown as Patchwork.WPPost}
							/>
					  ))}
			</ScrollView>
		</View>
	);
};

export default WpNewsSection;
