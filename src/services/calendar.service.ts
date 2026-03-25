import axios from 'axios';
import { handleError } from '@/util/helper/helper';
import type {
	GetLautiEventsParams,
	GetLautiGroupsParams,
	LautiEventDocument,
	LautiGroupDocument,
	LautiMapMarker,
	PaginatedLautiEvents,
	PaginatedLautiGroups,
} from '@/types/calendar.type';

export const LAUTI_BASE_URL =
	process.env.LAUTI_BASE_URL ?? 'https://lauti.newsmast.org';

const lautiClient = axios.create({
	baseURL: LAUTI_BASE_URL,
	timeout: 15000,
});

export const getLautiUpcomingEvents = async ({
	page = 0,
	pageSize = 20,
}: GetLautiEventsParams): Promise<PaginatedLautiEvents> => {
	try {
		const { data } = await lautiClient.get<{
			events: LautiEventDocument[];
			total: number;
		}>('/api/v1/eventsearch', {
			params: { page, pageSize, sort: 'start', sortAscending: true },
		});

		const nextPage = (page + 1) * pageSize < data.total ? page + 1 : undefined;
		return { items: data.events, nextPage };
	} catch (error) {
		return handleError(error);
	}
};

export const getLautiGroups = async ({
	offset = 0,
	limit = 20,
}: GetLautiGroupsParams): Promise<PaginatedLautiGroups> => {
	try {
		const { data } = await lautiClient.get<LautiGroupDocument[]>(
			'/api/v1/groups/',
			{ params: { limit, offset } },
		);

		const nextOffset = data.length === limit ? offset + limit : undefined;
		return { items: data, nextOffset };
	} catch (error) {
		return handleError(error);
	}
};

export const isValidCoord = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value !== 0;

export const hasValidCoords = (event: LautiEventDocument): boolean => {
	const { lat, lng } = getEventCoords(event);
	return isValidCoord(lat) && isValidCoord(lng);
};

const getEventIdentity = (event: LautiEventDocument, index: number) =>
	event.id ??
	`${event.name ?? 'event'}-${event.start ?? 'no-start'}-${
		event.end ?? 'no-end'
	}-${index}`;

export const dedupeLautiEvents = (
	events: LautiEventDocument[],
	seen = new Set<string>(),
) =>
	events.filter((event, index) => {
		const identity = getEventIdentity(event, index);
		if (seen.has(identity)) return false;
		seen.add(identity);
		return true;
	});

const VIRTUAL_KEYWORDS = ['virtual', 'online', 'digital', 'zoom', 'stream'];

export const inferEventType = (
	event: LautiEventDocument,
): 'in_person' | 'virtual' => {
	const locationText =
		typeof event.location === 'string'
			? event.location
			: event.location?.name ?? event.location2 ?? '';

	if (VIRTUAL_KEYWORDS.some(kw => locationText.toLowerCase().includes(kw))) {
		return 'virtual';
	}
	return 'in_person';
};

export const getEventCoords = (event: LautiEventDocument) => {
	// console.log('getEventCoords event.location:', event);
	const loc = typeof event.location === 'object' ? event.location : null;
	// console.log('getEventCoords loc:', loc);
	return {
		lat: loc?.lat ?? loc?.place?.lat,
		lng: loc?.lng ?? loc?.place?.lng,
	};
};

export const toMapEventMarkers = (
	events: LautiEventDocument[],
): LautiMapMarker[] =>
	events.reduce<LautiMapMarker[]>((acc, event, index) => {
		const { lat, lng } = getEventCoords(event);
		if (!isValidCoord(lat) || !isValidCoord(lng)) return acc;

		acc.push({
			id: event.id ?? `event-${index}`,
			lat,
			lng,
			title: event.name ?? 'Event',
			kind: 'event',
			eventType: inferEventType(event),
		});
		return acc;
	}, []);

export const buildLautiMediaUrl = (mediaHash?: string | null) => {
	if (!mediaHash) return undefined;
	return `${LAUTI_BASE_URL}/api/v1/media/${encodeURIComponent(mediaHash)}`;
};
