import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import type { CalendarStackParamList } from '@/types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faGlobe,
	faArrowUpRightFromSquare,
	faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { buildLautiMediaUrl } from '@/services/calendar.service';
import { formatDateRange } from '@/util/helper/helper';
import customColor from '@/util/constant/color';
import { useGetLautiUpcomingEvents } from '@/hooks/queries/calendar.queries';
import { useMemo } from 'react';
import type { LautiEventDocument } from '@/types/calendar.type';
import Header from '@/components/atoms/common/Header/Header';
import BackButton from '@/components/atoms/common/BackButton/BackButton';

type Props = NativeStackScreenProps<
	CalendarStackParamList,
	'CalendarOrganiserDetail'
>;

const OrganiserDetail = ({ route, navigation }: Props) => {
	const { group } = route.params;
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const titleColor = isDark ? '#EAF3F6' : '#033E45';
	const linkColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const imageUrl = buildLautiMediaUrl(group.image);

	const { data: eventsData, isLoading: isEventsLoading } =
		useGetLautiUpcomingEvents({ pageSize: 100, enabled: true });

	const groupEvents = useMemo(() => {
		const all = eventsData?.pages.flatMap(p => p.items) ?? [];
		return all.filter(e => e.organizers?.some(o => o.group?.id === group.id));
	}, [eventsData, group.id]);

	const handleEventPress = (event: LautiEventDocument) => {
		navigation.navigate('CalendarEventDetail', { event });
	};

	return (
		<SafeScreen
			style={{
				backgroundColor: isDark ? customColor['patchwork-dark-100'] : '#F5F5FA',
			}}
		>
			<View
				style={[
					styles.headerWrapper,
					{ borderBottomColor: isDark ? '#22343B' : '#D7E0E3' },
				]}
			>
				<Header
					title="Organiser Details"
					leftCustomComponent={<BackButton />}
					style={styles.header}
				/>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.heroContainer}>
					{imageUrl ? (
						<Image source={{ uri: imageUrl }} style={styles.heroImage} />
					) : (
						<View style={[styles.heroImage, { backgroundColor: '#033E45' }]} />
					)}
				</View>

				<View style={styles.card}>
					<ThemeText
						className="font-OpenSans_Bold"
						style={[styles.groupTitle, { color: titleColor }]}
						numberOfLines={3}
					>
						{group.name ?? 'Untitled Organiser'}
					</ThemeText>

					{group.link ? (
						<Pressable
							style={styles.metaRow}
							onPress={() => group.link && Linking.openURL(group.link)}
						>
							<FontAwesomeIcon icon={faGlobe} size={14} color={linkColor} />
							<ThemeText
								size="fs_13"
								style={[
									styles.metaText,
									{ color: linkColor, textDecorationLine: 'underline' },
								]}
								numberOfLines={1}
							>
								Visit Website
							</ThemeText>
							<FontAwesomeIcon
								icon={faArrowUpRightFromSquare}
								size={11}
								color={linkColor}
							/>
						</Pressable>
					) : null}

					<View
						style={[
							styles.divider,
							{ backgroundColor: isDark ? '#2A3A40' : '#E8EDEF' },
						]}
					/>
					<ThemeText
						className="font-OpenSans_Bold"
						style={[styles.sectionTitle, { color: titleColor }]}
					>
						About This Group
					</ThemeText>
					<ThemeText
						size="fs_13"
						style={[styles.bodyText, { color: isDark ? '#9CB0B7' : '#5D6E74' }]}
					>
						{group.description ?? 'No description available.'}
					</ThemeText>

					{/* Upcoming Events */}
					{!isEventsLoading && groupEvents.length > 0 ? (
						<>
							<View
								style={[
									styles.divider,
									{ backgroundColor: isDark ? '#2A3A40' : '#E8EDEF' },
								]}
							/>
							<ThemeText
								className="font-OpenSans_Bold"
								style={[styles.sectionTitle, { color: titleColor }]}
							>
								{`Upcoming Events (${groupEvents.length})`}
							</ThemeText>
							{groupEvents.map((event, index) => {
								const eventImageUrl = buildLautiMediaUrl(event.image);
								const dateLabel = formatDateRange(event.start, event.end);
								return (
									<Pressable
										key={event.id ?? `event-${index}`}
										style={[
											styles.eventRow,
											{
												borderColor: isDark ? '#2A3A40' : '#E8EDEF',
												backgroundColor: isDark
													? customColor['patchwork-dark-100']
													: '#F5F5FA',
											},
										]}
										onPress={() => handleEventPress(event)}
									>
										{eventImageUrl ? (
											<Image
												source={{ uri: eventImageUrl }}
												style={styles.eventThumb}
											/>
										) : (
											<View
												style={[
													styles.eventThumb,
													{ backgroundColor: '#033E45' },
												]}
											/>
										)}
										<View style={styles.eventInfo}>
											<ThemeText
												className="font-OpenSans_Bold"
												size="fs_13"
												style={{ color: titleColor }}
												numberOfLines={2}
											>
												{event.name ?? 'Event'}
											</ThemeText>
											{dateLabel ? (
												<View style={styles.dateMeta}>
													<FontAwesomeIcon
														icon={faCalendarDays}
														size={11}
														color={isDark ? '#9CB0B7' : '#6A7A81'}
													/>
													<ThemeText
														size="xs_12"
														style={{
															color: isDark ? '#9CB0B7' : '#6A7A81',
															marginLeft: 4,
														}}
														numberOfLines={1}
													>
														{dateLabel}
													</ThemeText>
												</View>
											) : null}
										</View>
									</Pressable>
								);
							})}
						</>
					) : null}
				</View>
			</ScrollView>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	headerWrapper: {
		borderBottomWidth: 0.5,
	},
	header: {
		height: 56,
		marginHorizontal: 16,
		marginTop: 0,
		marginBottom: 0,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	heroContainer: {
		width: '100%',
	},
	heroImage: {
		width: '100%',
		height: 220,
	},
	card: {
		padding: 16,
	},
	groupTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 12,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		gap: 8,
	},
	metaText: {
		flex: 1,
		lineHeight: 18,
	},
	divider: {
		height: 0.5,
		marginVertical: 14,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 8,
	},
	bodyText: {
		lineHeight: 20,
	},
	eventRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		borderWidth: 0.5,
		marginTop: 10,
		overflow: 'hidden',
	},
	eventThumb: {
		width: 80,
		height: 80,
	},
	eventInfo: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
		gap: 6,
	},
	dateMeta: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default OrganiserDetail;
