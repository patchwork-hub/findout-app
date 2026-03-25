import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import type { LautiGroupDocument } from '@/types/calendar.type';
import { useCallback } from 'react';
import type { TFunction } from 'i18next';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import GroupCard from '@/components/molecules/calender/organisers/GroupCard';
import Loading from '@/components/atoms/common/Loading/Loading';
import OrganiserCardSkeleton from '@/components/molecules/calender/organisers/SkeletonCard';

type OrganisersTabProps = {
	groups: LautiGroupDocument[];
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	fetchNextPage: () => void;
	refetch: () => void;
	isDark: boolean;
	t: TFunction;
	onGroupPress?: (group: LautiGroupDocument) => void;
};

const OrganisersTab = ({
	groups,
	isLoading,
	isFetching,
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
	refetch,
	isDark,
	t,
	onGroupPress,
}: OrganisersTabProps) => {
	const { width } = useWindowDimensions();

	const renderItem = useCallback(
		({ item }: { item: LautiGroupDocument }) => (
			<GroupCard
				item={item}
				isDark={isDark}
				cardWidth={Math.max((width - 44) / 2, 140)}
				onPress={() => onGroupPress?.(item)}
			/>
		),
		[width, isDark, onGroupPress],
	);

	if (isLoading) {
		return (
			<View style={styles.groupListContent}>
				<View style={styles.groupColumn}>
					{Array.from({ length: 6 }).map((_, index) => (
						<OrganiserCardSkeleton
							key={index}
							width={Math.max((width - 44) / 2, 140)}
							style={styles.skeletonCard}
						/>
					))}
				</View>
			</View>
		);
	}

	return (
		<FlatList
			data={groups}
			keyExtractor={(group, index) =>
				group.id || `${group.name || 'group'}-${index}`
			}
			renderItem={renderItem}
			numColumns={2}
			columnWrapperStyle={styles.groupColumn}
			contentContainerStyle={styles.groupListContent}
			showsVerticalScrollIndicator={false}
			onRefresh={refetch}
			refreshing={isFetching && !isFetchingNextPage}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) fetchNextPage();
			}}
			onEndReachedThreshold={0.3}
			ListEmptyComponent={
				<ThemeText
					className="text-center mt-10 font-OpenSans_Regular"
					size="fs_13"
					style={{ color: isDark ? '#8EA0A8' : '#79888E' }}
				>
					{t('calendar.no_organisers_found', {
						defaultValue: 'No organisers found.',
					})}
				</ThemeText>
			}
			ListFooterComponent={
				isFetchingNextPage ? <Loading isDark={isDark} /> : null
			}
		/>
	);
};

const styles = StyleSheet.create({
	groupListContent: {
		paddingHorizontal: 12,
		paddingBottom: 20,
		gap: 12,
	},
	groupColumn: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		paddingHorizontal: 4,
	},
	skeletonCard: {
		marginTop: 12,
	},
});

export default OrganisersTab;
