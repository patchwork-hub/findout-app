import { NativeModules, Platform } from 'react-native';

export type IOSCalendarComposerPayload = {
	title: string;
	startDate: string;
	endDate?: string;
	location?: string | null;
	notes?: string | null;
	url?: string | null;
};

const { CalendarComposerModule } = NativeModules as {
	CalendarComposerModule?: {
		presentEventEditor(payload: IOSCalendarComposerPayload): Promise<{
			status: 'saved' | 'deleted' | 'canceled';
			eventIdentifier?: string;
		}>;
	};
};

export const openIOSCalendarComposer = async (
	payload: IOSCalendarComposerPayload,
) => {
	if (Platform.OS !== 'ios') {
		throw new Error('CalendarComposerModule is iOS only.');
	}
	if (!CalendarComposerModule) {
		throw new Error('CalendarComposerModule is not linked.');
	}
	return CalendarComposerModule.presentEventEditor(payload);
};
