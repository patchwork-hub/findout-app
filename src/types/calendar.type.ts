export type LautiLocation =
	| string
	| {
			name?: string;
			address?: string;
			lat?: number;
			lng?: number;
			place?: {
				address?: string;
				lat?: number;
				lng?: number;
				description?: string;
			};
	  };

export type LautiOrganizerEntry = {
	group?: {
		id?: string;
		name?: string;
		description?: string;
		image?: string | null;
		alt?: string;
		link?: string;
		email?: string;
		deactivated?: boolean;
		published?: boolean;
		ownedBy?: string[];
	};
	involved?: string[];
};

export type LautiEventDocument = {
	alt?: string;
	cancled?: boolean; // API typo preserved
	category?: string | null;
	day?: string;
	description?: string;
	end?: string;
	id?: string;
	image?: string | null;
	listed?: boolean;
	location?: LautiLocation;
	location2?: string;
	lat?: number;
	lng?: number;
	multiday?: boolean;
	multiDay?: boolean;
	name?: string;
	organizers?: LautiOrganizerEntry[];
	start?: string;
	tags?: string[];
	topic?: string | null;
	published?: boolean;
};

export type GetLautiEventsParams = {
	page?: number;
	pageSize?: number;
};

export type PaginatedLautiEvents = {
	items: LautiEventDocument[];
	nextPage?: number;
};

export type LautiGroupDocument = {
	alt?: string;
	id?: string;
	name?: string;
	description?: string;
	image?: string | null;
	link?: string;
	email?: string;
	deactivated?: boolean;
	published?: boolean;
	ownedBy?: [];
};

export type GetLautiGroupsParams = {
	offset?: number;
	limit?: number;
};

export type PaginatedLautiGroups = {
	items: LautiGroupDocument[];
	nextOffset?: number;
};

export type LautiMapMarker = {
	id: string;
	lat: number;
	lng: number;
	title: string;
	kind: 'place' | 'event';
	eventType?: 'in_person' | 'virtual';
};
