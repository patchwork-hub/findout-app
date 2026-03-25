import { handleError, toArray } from '@/util/helper/helper';
import { PeopleDirectoryQueryParam } from '@/types/people.type';
import {
	CIVI_API_PATHS,
	getCleanString,
	civiGet,
	civiPostJson,
	valuesToArray,
} from './civicrmBase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CiviContactRecord = Record<string, unknown>;
type CiviV4GetResponse = {
	is_error?: number;
	count?: number;
	values?: CiviContactRecord[] | Record<string, CiviContactRecord>;
};
type CiviContactTypeRecord = {
	name?: string;
	label?: string;
	parent_id?: number | null;
	is_active?: boolean;
};
type CiviV4ContactTypeResponse = {
	is_error?: number;
	values?: CiviContactTypeRecord[] | Record<string, CiviContactTypeRecord>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Fields to fetch for people directory listing */
const PEOPLE_CONTACT_FIELDS = [
	'id',
	'contact_id',
	'contact_type',
	'contact_sub_type',
	'display_name',
	'first_name',
	'last_name',
	'job_title',
	'current_employer',
	'image_URL',
	'email.email',
	'phone.phone',
	'address.city',
	'address.country_id:label',
] as const;

const PEOPLE_CONTACT_JOINS = [
	['Email AS email', 'LEFT', ['email.is_primary', '=', true]],
	['Phone AS phone', 'LEFT', ['phone.is_primary', '=', true]],
	['Address AS address', 'LEFT', ['address.is_primary', '=', true]],
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const normalizeFilterValue = (value: string): string =>
	value.trim().toLowerCase().replace(/\s+/g, ' ');

const getUniqueSortedLabels = (labels: string[]) =>
	[...new Set(labels)].sort((a, b) => a.localeCompare(b));

const mapContactToPerson = (
	contact: CiviContactRecord,
	index: number,
): Patchwork.PeopleDirectoryItem => {
	const id =
		getCleanString(contact.id) ||
		getCleanString(contact.contact_id) ||
		`unknown-contact-${index + 1}`;
	const firstName = getCleanString(contact.first_name);
	const lastName = getCleanString(contact.last_name);
	const contactType = getCleanString(contact.contact_type) || 'Unknown';
	const department =
		getCleanString(contact.contact_sub_type) ||
		getCleanString(contact.current_employer) ||
		contactType;
	const displayName =
		getCleanString(contact.display_name) ||
		`${firstName} ${lastName}`.trim() ||
		`Unnamed Contact #${id}`;
	const subtitle =
		getCleanString(contact.job_title) ||
		getCleanString(contact.current_employer) ||
		contactType;

	const avatar = getCleanString(contact.image_URL);
	const avatarUrl = /^https?:\/\//i.test(avatar) ? avatar : '';

	return {
		id,
		displayName,
		firstName,
		lastName,
		department,
		subtitle,
		email:
			getCleanString(contact['email.email']) || getCleanString(contact.email),
		phone:
			getCleanString(contact['phone.phone']) || getCleanString(contact.phone),
		country:
			getCleanString(contact['address.country_id:label']) ||
			getCleanString(contact.country),
		city:
			getCleanString(contact['address.city']) || getCleanString(contact.city),
		avatarUrl,
		contactType,
	};
};

/** Client-side filtering for fields not available in CiviCRM server-side queries. */
const applyClientFilters = (
	people: Patchwork.PeopleDirectoryItem[],
	{
		search,
		department,
	}: Pick<PeopleDirectoryQueryParam, 'search' | 'department'>,
): Patchwork.PeopleDirectoryItem[] => {
	const searchTerm = normalizeFilterValue(search || '');
	const deptTerm = normalizeFilterValue(department || '');

	return people.filter(person => {
		// Department is a computed field (contact_sub_type || current_employer || contact_type)
		// — must be filtered client-side.
		if (deptTerm && normalizeFilterValue(person.department) !== deptTerm) {
			return false;
		}

		// Text search spans multiple fields not available as a single server-side filter.
		if (
			searchTerm &&
			![person.displayName, person.email, person.subtitle]
				.filter(Boolean)
				.some(value => normalizeFilterValue(value).includes(searchTerm))
		) {
			return false;
		}

		return true;
	});
};

/** Build CiviCRM v4 `orderBy` from sort param. */
const buildOrderBy = (
	sort: PeopleDirectoryQueryParam['sort'] = 'az',
): Record<string, string> => ({
	display_name: sort === 'za' ? 'DESC' : 'ASC',
});

const fetchCiviContacts = async (
	params: PeopleDirectoryQueryParam = {},
): Promise<Patchwork.PeopleDirectoryItem[]> => {
	const hasClientFilters = !!(params.search || params.department);

	const payload: Record<string, unknown> = {
		select: [...PEOPLE_CONTACT_FIELDS],
		join: [...PEOPLE_CONTACT_JOINS],
		orderBy: buildOrderBy(params.sort),
	};

	if (!hasClientFilters && params.limit && params.limit > 0) {
		payload.limit = params.limit;
	}

	const response = await civiGet(CIVI_API_PATHS.CONTACT_GET, {
		...payload,
		where: [['is_deleted', '=', false]],
	});

	const people = valuesToArray<CiviContactRecord>(response).map(
		(contact, index) => mapContactToPerson(contact, index),
	);

	// Apply limit after client-side filtering when filters are active
	if (hasClientFilters && params.limit && params.limit > 0) {
		return people.slice(0, params.limit);
	}

	return people;
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported functions
// ─────────────────────────────────────────────────────────────────────────────

export const getCiviPeopleList = async (
	queryParam: PeopleDirectoryQueryParam = {},
): Promise<Patchwork.PeopleDirectoryItem[]> => {
	try {
		const people = await fetchCiviContacts(queryParam);

		const filtered = applyClientFilters(people, queryParam);

		// Apply limit after client-side filtering
		if (queryParam.limit && queryParam.limit > 0) {
			return filtered.slice(0, queryParam.limit);
		}

		return filtered;
	} catch (error) {
		if (!(error as { response?: unknown })?.response) {
			throw error;
		}
		return handleError(error);
	}
};

export const getCiviDepartmentOptions = async (): Promise<string[]> => {
	try {
		// Use ContactType/get API to fetch contact types & subtypes directly
		const response = await civiPostJson<CiviV4ContactTypeResponse>(
			CIVI_API_PATHS.CONTACT_TYPE_GET,
			{
				select: ['name', 'label', 'parent_id', 'is_active'],
				where: [['is_active', '=', true]],
			},
		);

		const contactTypes = toArray(response?.values) as CiviContactTypeRecord[];

		const labels = contactTypes
			.map(ct => (ct.label || ct.name || '').trim())
			.filter(Boolean);

		if (labels.length > 0) {
			return getUniqueSortedLabels(labels);
		}
	} catch (error) {
		console.warn(
			'CiviCRM ContactType API unavailable, falling back to people list extraction:',
			error,
		);
	}

	// Fallback: extract departments from the people list
	const people = await getCiviPeopleList({ sort: 'az' });
	const fromPeople = new Map<string, string>();
	people.forEach(person => {
		const raw = (person.department || '').trim();
		if (!raw) return;
		const key = normalizeFilterValue(raw);
		if (!fromPeople.has(key)) fromPeople.set(key, raw);
	});

	return getUniqueSortedLabels([...fromPeople.values()]);
};
