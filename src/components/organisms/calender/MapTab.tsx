import type { LautiEventDocument } from '@/types/calendar.type';
import Loading from '@/components/atoms/common/Loading/Loading';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { formatDateRange } from '@/util/helper/helper';
import InPersonPin from '../../../../assets/svg/InPersonPin';
import VirtualGlobe from '../../../../assets/svg/VirtualGlobe';
import EventTypesCard from '@/components/molecules/calender/map/EventTypesCard';
import Image from '@/components/atoms/common/Image/Image';
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { buildLautiMediaUrl } from '@/services/calendar.service';

const DEFAULT_REGION: Region = {
	latitude: 20,
	longitude: 10,
	latitudeDelta: 80,
	longitudeDelta: 100,
};

type MarkerType = 'in_person' | 'virtual';

type Props = {
	focusMarker?: { lat: number; lng: number };
	onMarkerPress?: (event: LautiEventDocument) => void;
	events: LautiEventDocument[];
	isLoading: boolean;
};

type EventMarker = {
	id: string;
	title: string;
	latitude: number;
	longitude: number;
	type: MarkerType;
	event: LautiEventDocument;
};

const VIRTUAL_KEYWORDS = [
	'virtual',
	'online',
	'zoom',
	'jitsi',
	'livestream',
	'webinar',
	'remote',
];

const toNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
};

const isValidLatLng = (lat?: number, lng?: number) => {
	if (typeof lat !== 'number' || typeof lng !== 'number') return false;
	if (lat === 0 && lng === 0) return false;
	return true;
};

const inferMarkerType = (event: LautiEventDocument): MarkerType => {
	const locationName =
		typeof event.location === 'string'
			? event.location
			: event.location?.name ?? '';
	const fullText = `${locationName} ${event.location2 ?? ''} ${
		event.description ?? ''
	}`.toLowerCase();

	return VIRTUAL_KEYWORDS.some(keyword => fullText.includes(keyword))
		? 'virtual'
		: 'in_person';
};

const pickCoordinates = (event: LautiEventDocument) => {
	const location =
		typeof event.location === 'object' && event.location
			? event.location
			: undefined;
	const place = location?.place;

	const lat = [event.lat, location?.lat, place?.lat]
		.map(toNumber)
		.find(v => v !== undefined);
	const lng = [event.lng, location?.lng, place?.lng]
		.map(toNumber)
		.find(v => v !== undefined);

	return { lat, lng };
};

const jitterCoord = (
	lat: number,
	lng: number,
	seenCoords: Set<string>,
): { lat: number; lng: number } => {
	const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
	if (!seenCoords.has(key)) {
		seenCoords.add(key);
		return { lat, lng };
	}
	// offset ~111m, 60° angle intervals to spiral duplicates apart
	const offset = 0.001;
	const angle = seenCoords.size * 60 * (Math.PI / 180);
	const newLat = lat + offset * Math.cos(angle);
	const newLng = lng + offset * Math.sin(angle);
	seenCoords.add(`${newLat.toFixed(5)},${newLng.toFixed(5)}`);
	return { lat: newLat, lng: newLng };
};

const buildMarkers = (events: LautiEventDocument[]): EventMarker[] => {
	const seenCoords = new Set<string>();
	return events.reduce<EventMarker[]>((acc, event, index) => {
		const { lat, lng } = pickCoordinates(event);
		if (!isValidLatLng(lat, lng)) return acc;
		if (lat === undefined || lng === undefined) return acc;

		const { lat: jLat, lng: jLng } = jitterCoord(lat, lng, seenCoords);
		acc.push({
			id: event.id ?? `event-${index}`,
			title: event.name ?? 'Event',
			latitude: jLat,
			longitude: jLng,
			type: inferMarkerType(event),
			event,
		});

		return acc;
	}, []);
};

const clampDelta = (value: number) => Math.max(0.002, Math.min(120, value));

const MapTab = ({ focusMarker, onMarkerPress, events, isLoading }: Props) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const mapRef = useRef<MapView | null>(null);
	const currentRegionRef = useRef<Region>(DEFAULT_REGION);
	const focusMarkerRef = useRef(focusMarker);
	focusMarkerRef.current = focusMarker;
	const [selectedMaker, setSelectedMarker] = useState<EventMarker | null>(null);
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const markers = useMemo(() => buildMarkers(events), [events]);

	const focusOnMarker = useCallback((lat: number, lng: number) => {
		mapRef.current?.animateToRegion(
			{
				latitude: lat,
				longitude: lng,
				latitudeDelta: 0.0019,
				longitudeDelta: 0.0019,
			},
			500,
		);
	}, []);

	const fitToMarkers = useCallback(() => {
		if (markers.length === 0) return;
		mapRef.current?.fitToCoordinates(
			markers.map(m => ({ latitude: m.latitude, longitude: m.longitude })),
			{
				edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
				animated: true,
			},
		);
	}, [markers]);

	const handleMapReady = useCallback(() => {
		const fm = focusMarkerRef.current;
		if (fm) {
			focusOnMarker(fm.lat, fm.lng);
		} else {
			fitToMarkers();
		}
	}, [fitToMarkers, focusOnMarker]);

	useEffect(() => {
		if (!focusMarkerRef.current) {
			fitToMarkers();
		}
	}, [fitToMarkers]);

	useEffect(() => {
		if (focusMarker) {
			focusOnMarker(focusMarker.lat, focusMarker.lng);
		}
	}, [focusMarker, focusOnMarker]);

	const handleZoom = useCallback((factor: number) => {
		const region = currentRegionRef.current;
		mapRef.current?.animateToRegion(
			{
				...region,
				latitudeDelta: clampDelta(region.latitudeDelta * factor),
				longitudeDelta: clampDelta(region.longitudeDelta * factor),
			},
			180,
		);
	}, []);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.4}
			/>
		),
		[],
	);

	if (isLoading) {
		return (
			<View style={styles.center}>
				<Loading isDark={colorScheme === 'dark'} />
			</View>
		);
	}

	if (markers.length === 0) {
		return (
			<View style={styles.center}>
				<ThemeText>No map events found.</ThemeText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<MapView
				ref={mapRef}
				style={StyleSheet.absoluteFill}
				provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
				initialRegion={DEFAULT_REGION}
				zoomEnabled
				scrollEnabled
				rotateEnabled
				pitchEnabled
				toolbarEnabled={false}
				onMapReady={handleMapReady}
				onRegionChangeComplete={region => {
					currentRegionRef.current = region;
				}}
			>
				{markers.map(marker => (
					<Marker
						key={marker.id}
						coordinate={{
							latitude: marker.latitude,
							longitude: marker.longitude,
						}}
						tracksViewChanges={false}
						onPress={() => {
							setSelectedMarker(marker);
							bottomSheetRef.current?.present();
						}}
					>
						{marker.type === 'virtual' ? (
							<View style={styles.virtualMarkerIcon}>
								<VirtualGlobe />
							</View>
						) : (
							<InPersonPin />
						)}
					</Marker>
				))}
			</MapView>
			<BottomSheetModal
				ref={bottomSheetRef}
				backdropComponent={renderBackdrop}
				enableDynamicSizing
				handleIndicatorStyle={{ backgroundColor: '#CBD5E1' }}
				backgroundStyle={{
					backgroundColor: isDark ? '#1E2D33' : '#FFFFFF',
				}}
				onDismiss={() => setSelectedMarker(null)}
			>
				<BottomSheetView>
					{selectedMaker ? (
						<>
							{selectedMaker.event.image ? (
								<Image
									uri={buildLautiMediaUrl(selectedMaker.event.image)}
									style={styles.sheetImage}
								/>
							) : null}
							<View style={styles.sheetContent}>
								<View
									style={[
										styles.sheetBadge,
										{
											backgroundColor:
												selectedMaker.type === 'virtual'
													? '#E0F4F8'
													: '#FEF0EE',
										},
									]}
								>
									<ThemeText
										size="xs_12"
										style={{
											color:
												selectedMaker.type === 'virtual'
													? '#0D6E8A'
													: '#EF8F84',
											fontWeight: '600',
										}}
									>
										{selectedMaker.type === 'virtual' ? 'Virtual' : 'In-Person'}
									</ThemeText>
								</View>
								<ThemeText
									className="font-OpenSans_Bold"
									style={[
										styles.sheetTitle,
										{ color: isDark ? '#EAF3F6' : '#033E45' },
									]}
									numberOfLines={2}
								>
									{selectedMaker.title}
								</ThemeText>
								{selectedMaker.event.start || selectedMaker.event.end ? (
									<ThemeText
										size="xs_12"
										style={styles.sheetDate}
										numberOfLines={1}
									>
										{formatDateRange(
											selectedMaker.event.start,
											selectedMaker.event.end,
										)}
									</ThemeText>
								) : null}
								{selectedMaker.event.description ? (
									<ThemeText
										size="fs_13"
										style={styles.sheetDesc}
										numberOfLines={2}
									>
										{selectedMaker.event.description}
									</ThemeText>
								) : null}
								<Pressable
									style={styles.sheetButton}
									onPress={() => {
										bottomSheetRef.current?.dismiss();
										onMarkerPress?.(selectedMaker.event);
									}}
								>
									<ThemeText
										className="font-OpenSans_Bold text-center"
										size="fs_13"
										style={{ color: '#FFFFFF' }}
									>
										View Details
									</ThemeText>
								</Pressable>
							</View>
						</>
					) : null}
				</BottomSheetView>
			</BottomSheetModal>
			<EventTypesCard />
			<View style={styles.zoomWrap}>
				<Pressable
					style={[styles.zoomButton, styles.zoomButtonTop]}
					onPress={() => handleZoom(0.6)}
				>
					<ThemeText style={styles.zoomText}>+</ThemeText>
				</Pressable>
				<Pressable style={styles.zoomButton} onPress={() => handleZoom(1.6)}>
					<ThemeText style={styles.zoomText}>−</ThemeText>
				</Pressable>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	zoomWrap: {
		position: 'absolute',
		right: 14,
		bottom: 22,
		borderRadius: 14,
		overflow: 'hidden',
	},
	zoomButton: {
		width: 42,
		height: 42,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.16,
		shadowRadius: 12,
		elevation: 6,
	},
	zoomButtonTop: {
		borderBottomWidth: 1,
		borderBottomColor: '#E6ECF2',
	},
	virtualMarkerIcon: {
		width: 25,
		height: 25,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: '#F6958A',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	zoomText: {
		fontSize: 24,
		lineHeight: 24,
		fontWeight: '700',
		color: '#0D4D57',
	},
	sheetImage: {
		height: 180,
		width: '95%',
		borderRadius: 10,
		alignSelf: 'center',
		resizeMode: 'contain',
	},
	sheetContent: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 32,
		gap: 10,
	},
	sheetBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 20,
	},
	sheetTitle: {
		fontSize: 16,
		fontWeight: '700',
		lineHeight: 22,
	},
	sheetDate: {
		color: '#6A7A81',
	},
	sheetDesc: {
		color: '#6A7A81',
		lineHeight: 20,
	},
	sheetButton: {
		backgroundColor: '#033E45',
		borderRadius: 10,
		paddingVertical: 14,
		marginTop: 4,
	},
});

export default MapTab;
