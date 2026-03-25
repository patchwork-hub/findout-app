import { Linking, Platform } from 'react-native';
import type { LautiEventDocument } from '@/types/calendar.type';
import { openIOSCalendarComposer } from '@/native/calendarComposer';
import {
	getEventBookingUrl,
	getEventCalendarPayload,
} from '@/util/helper/event';

const toGoogleCalendarDate = (iso: string) =>
	new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

export const addEventToCalendar = async (event: LautiEventDocument) => {
	const payload = getEventCalendarPayload(event);
	if (!payload) return;

	if (Platform.OS === 'android') {
		const dtStart = toGoogleCalendarDate(payload.startDate);
		const dtEnd = toGoogleCalendarDate(payload.endDate ?? payload.startDate);
		const params = new URLSearchParams({
			action: 'TEMPLATE',
			text: payload.title,
			dates: `${dtStart}/${dtEnd}`,
			...(payload.notes ? { details: payload.notes } : {}),
			...(payload.location ? { location: payload.location } : {}),
		});

		await Linking.openURL(
			`https://calendar.google.com/calendar/render?${params.toString()}`,
		);
		return;
	}

	await openIOSCalendarComposer(payload);
};

export const openEventRegistration = async (event: LautiEventDocument) => {
	const bookingUrl = getEventBookingUrl(event);
	if (!bookingUrl) return;
	await Linking.openURL(bookingUrl);
};

export const canAddEventToCalendar = (event: LautiEventDocument) =>
	Boolean(event.start);

export const getEventActionState = (event: LautiEventDocument) => ({
	bookingUrl: getEventBookingUrl(event),
	canAddToCalendar: canAddEventToCalendar(event),
});
