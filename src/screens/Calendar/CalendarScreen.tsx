import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import {
	useGetLautiGroups,
	useGetLautiUpcomingEvents,
} from '@/hooks/queries/calendar.queries';
import customColor from '@/util/constant/color';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CalendarStackParamList } from '@/types/navigation';
import type {
	LautiEventDocument,
	LautiGroupDocument,
} from '@/types/calendar.type';
import OrganisersTab from '@/components/organisms/calender/OrganisersTab';
import DatesTab from '@/components/organisms/calender/DatesTab';
import MapTab from '@/components/organisms/calender/MapTab';
import Header from '@/components/atoms/common/Header/Header';

type CalendarTab = 'dates' | 'organisers' | 'map';

type Props = NativeStackScreenProps<CalendarStackParamList, 'CalendarHome'>;

const CalendarScreen = ({ route, navigation }: Props) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<CalendarTab>('dates');
	const [activeFocusEvent, setActiveFocusEvent] = useState<
		LautiEventDocument | undefined
	>(route.params?.focusEvent);
	const focusMarker = route.params?.focusMarker;

	useEffect(() => {
		setActiveFocusEvent(route.params?.focusEvent ?? undefined);
	}, [route.params?.focusEvent]);

	useEffect(() => {
		if (focusMarker) {
			setActiveTab('map');
		}
	}, [focusMarker]);

	const handleEventPress = useCallback(
		(event: LautiEventDocument) => {
			navigation.navigate('CalendarEventDetail', { event });
		},
		[navigation],
	);

	const handleGroupPress = useCallback(
		(group: LautiGroupDocument) => {
			navigation.navigate('CalendarOrganiserDetail', { group });
		},
		[navigation],
	);

	const isDark = colorScheme === 'dark';
	const activeTabColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];
	const inactiveTabColor = isDark
		? '#8EA0A8'
		: customColor['patchwork-grey-400'];

	const {
		data: eventsData,
		isLoading: isEventsLoading,
		isFetching: isEventsFetching,
		isFetchingNextPage: isEventsFetchingNextPage,
		hasNextPage: hasEventsNextPage,
		fetchNextPage: fetchEventsNextPage,
		refetch: refetchEvents,
	} = useGetLautiUpcomingEvents();

	const {
		data: groupsData,
		isLoading: isGroupsLoading,
		isFetching: isGroupsFetching,
		isFetchingNextPage: isGroupsFetchingNextPage,
		hasNextPage: hasGroupsNextPage,
		fetchNextPage: fetchGroupsNextPage,
		refetch: refetchGroups,
	} = useGetLautiGroups({
		limit: 20,
		enabled: activeTab === 'organisers',
	});

	const events = useMemo(
		() => eventsData?.pages.flatMap(page => page.items) ?? [],
		[eventsData],
	);
	const groups = useMemo(
		() => groupsData?.pages.flatMap(page => page.items) ?? [],
		[groupsData],
	);

	const handleTabPress = useCallback((tab: CalendarTab) => {
		if (tab === 'map') {
			setActiveFocusEvent(undefined);
		}
		setActiveTab(tab);
	}, []);

	const renderTab = useCallback(
		(tab: CalendarTab, label: string) => {
			const selected = activeTab === tab;
			return (
				<Pressable onPress={() => handleTabPress(tab)} style={styles.tabItem}>
					<ThemeText
						style={[
							styles.tabLabel,
							{ color: selected ? activeTabColor : inactiveTabColor },
						]}
					>
						{label}
					</ThemeText>
					<View
						style={[
							styles.tabIndicator,
							{ backgroundColor: selected ? activeTabColor : 'transparent' },
						]}
					/>
				</Pressable>
			);
		},
		[activeTab, activeTabColor, inactiveTabColor, handleTabPress],
	);

	return (
		<SafeScreen>
			<Header
				title={t('calendar.title', { defaultValue: 'Calendar' })}
				// style={styles.header}
			/>

			<View style={styles.tabRow}>
				{renderTab('dates', t('calendar.dates', { defaultValue: 'Dates' }))}
				{renderTab(
					'organisers',
					t('calendar.organisers', { defaultValue: 'Organisers' }),
				)}
				{renderTab('map', t('calendar.map', { defaultValue: 'Map' }))}
			</View>

			{activeTab === 'dates' ? (
				<DatesTab
					events={events}
					isLoading={isEventsLoading}
					isFetching={isEventsFetching}
					isFetchingNextPage={isEventsFetchingNextPage}
					hasNextPage={Boolean(hasEventsNextPage)}
					fetchNextPage={fetchEventsNextPage}
					refetch={refetchEvents}
					onEventPress={handleEventPress}
					isDark={isDark}
					t={t}
				/>
			) : null}

			{activeTab === 'organisers' ? (
				<OrganisersTab
					groups={groups}
					isLoading={isGroupsLoading}
					isFetching={isGroupsFetching}
					isFetchingNextPage={isGroupsFetchingNextPage}
					hasNextPage={Boolean(hasGroupsNextPage)}
					fetchNextPage={fetchGroupsNextPage}
					refetch={refetchGroups}
					isDark={isDark}
					t={t}
					onGroupPress={handleGroupPress}
				/>
			) : null}

			{activeTab === 'map' ? (
				<MapTab
					focusMarker={focusMarker}
					onMarkerPress={handleEventPress}
					events={activeFocusEvent ? [activeFocusEvent] : events}
					isLoading={isEventsLoading}
				/>
			) : null}
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	headerWrapper: {
		borderBottomWidth: 0.5,
	},
	header: {
		height: 60,
		marginHorizontal: 16,
		marginTop: 0,
		marginBottom: 0,
	},
	tabRow: {
		flexDirection: 'row',
		marginHorizontal: 12,
		marginBottom: 8,
	},
	tabItem: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 12,
	},
	tabLabel: {
		fontFamily: 'Inter-Bold',
		fontSize: 15,
	},
	tabIndicator: {
		marginTop: 8,
		height: 3,
		width: '70%',
		borderRadius: 999,
	},
});

export default CalendarScreen;
