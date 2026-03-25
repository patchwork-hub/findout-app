import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import type { LautiEventDocument } from '@/types/calendar.type';
import customColor from '@/util/constant/color';
import type { TFunction } from 'i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useCallback } from 'react';
import EventCard from '@/components/molecules/calender/dates/EventCard';
import Loading from '@/components/atoms/common/Loading/Loading';

type DatesTabProps = {
	events: LautiEventDocument[];
	isLoading: boolean;
	isFetching: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	fetchNextPage: () => void;
	refetch: () => void;
	onEventPress: (event: LautiEventDocument) => void;
	isDark: boolean;
	t: TFunction;
};

const getEventKey = (event: LautiEventDocument, index: number) =>
	event.id ? `${event.id}-${index}` : `${event.name || 'event'}-${event.start || 'no-start'}-${index}`;

const DatesTab = ({
	events,
	isLoading,
	isFetching,
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
	refetch,
	onEventPress,
	isDark,
	t,
}: DatesTabProps) => {
	const renderItem = useCallback(
		({ item }: { item: LautiEventDocument }) => (
			<EventCard item={item} isDark={isDark} t={t} onPress={() => onEventPress(item)} />
		),
		[isDark, t, onEventPress],
	);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loading isDark={isDark} />
			</View>
		);
	}

	return (
		<FlatList
			data={events}
			keyExtractor={getEventKey}
			renderItem={renderItem}
			contentContainerStyle={styles.listContent}
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
					No upcoming events found.
				</ThemeText>
			}
			ListFooterComponent={
				isFetchingNextPage ? (
					<ActivityIndicator
						size="small"
						color={
							isDark
								? customColor['csid-primary-dark']
								: customColor['csid-primary']
						}
						style={{ marginVertical: 16 }}
					/>
				) : null
			}
		/>
	);
};

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 20,
	},
});

export default DatesTab;
