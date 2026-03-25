import { NewsCardSkeleton } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import WpKnowledgeCard from '@/components/molecules/home/WpKnowledgeCard/WpKnowledgeCard';
import WpSectionHeader from '@/components/molecules/home/WpSectionHeader/WpSectionHeader';
import { useGetWpResourcesPaginated } from '@/hooks/queries/wpFeed.queries';
import { useMemo } from 'react';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, useWindowDimensions } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { getWpNewsCardSize } from '../cardSizing';

const WpKnowledgeSection = () => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { width: screenWidth } = useWindowDimensions();
	const { width: cardWidth, height: cardHeight } =
		getWpNewsCardSize(screenWidth);
	const { data, isLoading } = useGetWpResourcesPaginated();
	const resources = useMemo(() => data?.pages[0]?.resources ?? [], [data]);

	if (!isLoading && resources.length === 0) return null;

	return (
		<View className="mb-2">
			<View className="px-4">
				<WpSectionHeader
					title="Knowledge"
					onViewAll={() => navigation.navigate('WpKnowledgeList')}
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
					: resources.map(item => (
							<WpKnowledgeCard key={item.id.toString()} item={item} />
					  ))}
			</ScrollView>
		</View>
	);
};

export default WpKnowledgeSection;
