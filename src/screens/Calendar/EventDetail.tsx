import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import type { CalendarStackParamList } from '@/types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

import {
	faCalendarDays,
	faLocationDot,
	faArrowUpRightFromSquare,
	faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import Image from '@/components/atoms/common/Image/Image';
import {
	buildLautiMediaUrl,
	getEventCoords,
	inferEventType,
} from '@/services/calendar.service';
import customColor from '@/util/constant/color';
import MapView, { Marker } from 'react-native-maps';
import VirtualGlobe from '../../../assets/svg/VirtualGlobe';
import Header from '@/components/atoms/common/Header/Header';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import EventActionGroup from '@/components/molecules/calender/EventActionGroup';
import {
	addEventToCalendar,
	getEventActionState,
	openEventRegistration,
} from '@/services/calendarEvent.service';
import {
	getEventDateLabel,
	getEventOrganizerName,
	getEventLocationLabel,
} from '@/util/helper/event';

type Props = NativeStackScreenProps<
	CalendarStackParamList,
	'CalendarEventDetail'
>;

const isValidCoord = (v: unknown): v is number =>
	typeof v === 'number' && isFinite(v) && v !== 0;

const EventDetail = ({ route, navigation }: Props) => {
	const { event } = route.params;
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const bgColor = isDark ? customColor['patchwork-dark-100'] : '#F5F5FA';
	const cardBg = isDark ? customColor['patchwork-dark-400'] : '#FFFFFF';
	const metaColor = isDark ? '#9CB0B7' : '#6A7A81';
	const titleColor = isDark ? '#EAF3F6' : '#033E45';
	const bodyColor = isDark ? '#9CB0B7' : '#5D6E74';
	const linkColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const imageUrl = buildLautiMediaUrl(event.image);
	const dateLabel = getEventDateLabel(event);
	const eventType = inferEventType(event);
	const isVirtual = eventType === 'virtual';
	const locationLabel = getEventLocationLabel(event);
	const organizerName = getEventOrganizerName(event);
	const { bookingUrl, canAddToCalendar } = getEventActionState(event);

	const { lat, lng } = getEventCoords(event);
	const hasMapLocation = isValidCoord(lat) && isValidCoord(lng);

	const handleLocationPress = () => {
		if (!hasMapLocation) return;
		navigation.navigate('CalendarHome', {
			focusMarker: { lat: lat as number, lng: lng as number },
			focusEvent: event,
		});
	};

	const handleAddToCalendar = async () => {
		try {
			await addEventToCalendar(event);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Unknown calendar error';
			Alert.alert('Unable to open Calendar', message);
		}
	};

	return (
		<SafeScreen style={{ backgroundColor: bgColor }}>
			<Header
				title={'Event Details'}
				leftCustomComponent={<BackButton />}
				style={{ backgroundColor: bgColor }}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.heroContainer}>
					{event.image ? (
						<Image
							uri={imageUrl}
							style={styles.heroImage}
							fallbackType="channels"
						/>
					) : (
						<View style={[styles.heroImage, { backgroundColor: '#033E45' }]} />
					)}
				</View>

				{/* Content Card */}
				<View style={[styles.card, { backgroundColor: cardBg }]}>
					<ThemeText
						className="font-OpenSans_Bold"
						style={[styles.eventTitle, { color: titleColor }]}
						numberOfLines={3}
					>
						{event.name ?? 'Untitled Event'}
					</ThemeText>

					<View style={styles.metaRow}>
						<FontAwesomeIcon
							icon={faCalendarDays}
							size={14}
							color={metaColor}
						/>
						<ThemeText
							size="fs_13"
							style={[styles.metaText, { color: metaColor }]}
							numberOfLines={1}
						>
							{dateLabel}
						</ThemeText>
					</View>

					{locationLabel ? (
						<Pressable
							style={styles.metaRow}
							onPress={handleLocationPress}
							disabled={!hasMapLocation}
						>
							{isVirtual ? (
								<View style={styles.virtualIconWrap}>
									<VirtualGlobe />
								</View>
							) : (
								<FontAwesomeIcon
									icon={faLocationDot}
									size={14}
									color={hasMapLocation ? linkColor : metaColor}
								/>
							)}
							<ThemeText
								size="fs_13"
								style={[
									styles.metaText,
									{ color: hasMapLocation ? linkColor : metaColor },
								]}
								numberOfLines={2}
							>
								{locationLabel}
							</ThemeText>
							{hasMapLocation ? (
								<FontAwesomeIcon
									icon={faArrowUpRightFromSquare}
									size={11}
									color={linkColor}
								/>
							) : null}
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
						About This Event
					</ThemeText>
					<ThemeText
						size="fs_13"
						style={[styles.bodyText, { color: bodyColor }]}
					>
						{event.description ||
							(typeof event.location === 'object' &&
								event.location?.place?.description) ||
							'No description available.'}
					</ThemeText>

					{/* Organiser */}
					{organizerName ? (
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
								Organiser
							</ThemeText>
							<ThemeText
								size="fs_13"
								style={[styles.bodyText, { color: bodyColor }]}
							>
								{organizerName}
							</ThemeText>
						</>
					) : null}

					{hasMapLocation ? (
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
								Event Location
							</ThemeText>
							<View style={styles.miniMap}>
								<MapView
									style={StyleSheet.absoluteFill}
									initialRegion={{
										latitude: lat as number,
										longitude: lng as number,
										latitudeDelta: 0.05,
										longitudeDelta: 0.05,
									}}
									scrollEnabled
									zoomEnabled
									rotateEnabled
									pitchEnabled
								>
									<Marker
										coordinate={{
											latitude: lat as number,
											longitude: lng as number,
										}}
									/>
								</MapView>
								<Pressable
									style={styles.miniMapExpandBtn}
									onPress={handleLocationPress}
								>
									<FontAwesomeIcon
										icon={faUpRightAndDownLeftFromCenter}
										size={11}
										color="#FFFFFF"
									/>
								</Pressable>
							</View>
						</>
					) : null}
				</View>

				{/* Buttons */}
				<EventActionGroup
					containerStyle={styles.buttonsContainer}
					onRegister={() => void openEventRegistration(event)}
					onAddToCalendar={() => void handleAddToCalendar()}
					canRegister={Boolean(bookingUrl)}
					canAddToCalendar={canAddToCalendar}
					titleColor={titleColor}
					outlineBorderColor={isDark ? '#3A5560' : '#C5D5DA'}
				/>
			</ScrollView>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
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
	eventTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 12,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
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
	aboutHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: '700',
	},
	bodyText: {
		lineHeight: 20,
	},
	buttonsContainer: {
		marginHorizontal: 16,
		marginTop: 20,
	},
	virtualIconWrap: {
		width: 14,
		height: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	miniMap: {
		height: 180,
		borderRadius: 10,
		overflow: 'hidden',
		marginTop: 8,
	},
	miniMapExpandBtn: {
		position: 'absolute',
		top: 8,
		right: 8,
		width: 28,
		height: 28,
		borderRadius: 8,
		backgroundColor: 'rgba(3, 62, 69, 0.75)',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default EventDetail;
