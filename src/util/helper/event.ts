import type { LautiEventDocument } from '@/types/calendar.type';
import { formatDateRange } from '@/util/helper/helper';

export const extractUrl = (text?: string | null): string | null => {
	if (!text) return null;
	const match = text.match(/https?:\/\/[^\s]+/);
	return match?.[0] ?? null;
};

export const getEventLocationLabel = (
	event: LautiEventDocument,
): string | null => {
	if (typeof event.location === 'string') return event.location;
	if (typeof event.location === 'object' && event.location?.name) {
		return event.location.name;
	}
	return event.location2 || event.location?.place?.address || null;
};

export const getEventBookingUrl = (
	event: LautiEventDocument,
): string | null =>
	extractUrl(event.location2) ??
	extractUrl(typeof event.location === 'string' ? event.location : null);

export const getEventOrganizerName = (
	event: LautiEventDocument,
): string | null => event.organizers?.[0]?.group?.name ?? null;

export const getEventDateLabel = (event: LautiEventDocument): string =>
	formatDateRange(event.start, event.end);

export type DeviceCalendarPayload = {
	title: string;
	startDate: string;
	endDate?: string;
	location?: string;
	notes?: string;
	url?: string;
};

export const getEventCalendarPayload = (
	event: LautiEventDocument,
): DeviceCalendarPayload | null => {
	if (!event.start) return null;

	return {
		title: event.name ?? 'Event',
		startDate: new Date(event.start).toISOString(),
		endDate: event.end ? new Date(event.end).toISOString() : undefined,
		location: getEventLocationLabel(event) ?? undefined,
		notes: event.description ?? undefined,
		url: getEventBookingUrl(event) ?? undefined,
	};
};
