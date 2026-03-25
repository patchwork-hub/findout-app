import { handleError } from '@/util/helper/helper';
import type {
	CiviCrmRecord,
	CiviCrmCountryOption,
	CreateCiviCrmContactArgs,
	UpdateCiviCrmProfileFieldsArgs,
	UpsertPrimaryPhoneArgs,
	UpsertPrimaryAddressArgs,
} from '@/types/civicrm.type';
import {
	CIVI_API_PATHS,
	civiGet,
	civiPostForm,
	valuesToArray,
	firstValue,
	getCleanString,
} from './civicrmBase';

const CONTACT_SELECT_FIELDS = [
	'id',
	'contact_type',
	'source',
	'display_name',
	'first_name',
	'middle_name',
	'last_name',
	'gender_id',
	'gender_id:label',
	'birth_date',
	'preferred_language',
	'preferred_language:label',
	'employer_id',
	'employer_id.display_name',
	'Individual_information.Bio',
	'Individual_information.Career_Level',
	'Individual_information.Areas_of_expertise',
	'Individual_information.Acknowledgement',
	'Individual_information.Data_sharing',
	'Individual_information.Data_sharing:label',
	'Individual_information.StakeHolder_Group',
	'Individual_information.StakeHolder_Group:label',
	'Individual_information.Mastodon',
	'Individual_information.LinkedIn',
	'Individual_information.GitHub',
	'phone.phone',
	'phone.phone_type_id',
	'address.city',
	'address.country_id',
	'address.country_id:label',
] as const;

const APP_CREATED_SOURCES = new Set(['csid-app-signup', 'csid-app-pairing']);

const numericId = (value: unknown) => {
	if (typeof value === 'number') return value;
	if (typeof value === 'string' && value.trim()) return Number(value);
	return Number.POSITIVE_INFINITY;
};

const CONTACT_JOINS = [
	['Phone AS phone', 'LEFT'],
	['Address AS address', 'LEFT', ['address.is_primary', '=', true]],
] as const;

export const findCiviCrmContactByHandle = async (mastodonHandle: string) => {
	try {
		if (!mastodonHandle) return [];

		return valuesToArray(
			await civiGet(CIVI_API_PATHS.CONTACT_GET, {
				select: [...CONTACT_SELECT_FIELDS],
				join: [...CONTACT_JOINS],
				where: [
					['is_deleted', '=', false],
					['Individual_information.Mastodon', '=', mastodonHandle],
				],
			}),
		);
	} catch (error) {
		return handleError(error);
	}
};

export const findCiviCrmContactByEmail = async (email: string) => {
	try {
		if (!email) return [];

		return valuesToArray(
			await civiGet(CIVI_API_PATHS.CONTACT_GET, {
				select: [...CONTACT_SELECT_FIELDS],
				join: [['Email AS email', 'LEFT'], ...CONTACT_JOINS],
				where: [
					['is_deleted', '=', false],
					['email.email', '=', email],
				],
			}),
		);
	} catch (error) {
		return handleError(error);
	}
};

export const getCiviCrmContactById = async (contactId: number) => {
	try {
		if (!contactId) return null;

		return firstValue(
			await civiGet(CIVI_API_PATHS.CONTACT_GET, {
				select: [...CONTACT_SELECT_FIELDS],
				join: [['Email AS email', 'LEFT'], ...CONTACT_JOINS],
				where: [['id', '=', contactId]],
				limit: 1,
			}),
		);
	} catch (error) {
		return handleError(error);
	}
};

export const updateCiviCrmContactHandle = async (
	contactId: number,
	mastodonHandle: string,
) => {
	try {
		await civiPostForm(CIVI_API_PATHS.CONTACT_UPDATE, {
			values: {
				'Individual_information.Mastodon': mastodonHandle,
			},
			where: [['id', '=', contactId]],
		});
	} catch (error) {
		return handleError(error);
	}
};

export const createCiviCrmContact = async ({
	firstName,
	middleName,
	lastName,
	mastodonHandle,
	source,
	email,
}: CreateCiviCrmContactArgs) => {
	try {
		const trimmedEmail = email?.trim();

		return firstValue(
			await civiPostForm(CIVI_API_PATHS.CONTACT_CREATE, {
				values: {
					contact_type: 'Individual',
					first_name: firstName,
					middle_name: middleName,
					last_name: lastName,
					source,
					'Individual_information.Mastodon': mastodonHandle,
				},
				...(trimmedEmail
					? {
							chain: {
								create_email: [
									'Email',
									'create',
									{
										values: {
											contact_id: '$id',
											email: trimmedEmail,
											is_primary: true,
										},
									},
								],
							},
						}
					: {}),
			}),
		);
	} catch (error) {
		return handleError(error);
	}
};

export const isAppCreatedCiviContact = (contact: CiviCrmRecord | null) => {
	if (!contact) return false;
	const source =
		typeof contact.source === 'string' ? contact.source.trim() : '';
	return APP_CREATED_SOURCES.has(source);
};

const getContactPriority = (contact: CiviCrmRecord) => {
	const isAppCreated = isAppCreatedCiviContact(contact);

	return {
		isAppCreated,
		id: numericId(contact.id),
	};
};

const compareCiviCrmContacts = (
	currentContact: CiviCrmRecord,
	candidateContact: CiviCrmRecord,
) => {
	const currentPriority = getContactPriority(currentContact);
	const candidatePriority = getContactPriority(candidateContact);

	if (currentPriority.isAppCreated !== candidatePriority.isAppCreated) {
		return currentPriority.isAppCreated ? 1 : -1;
	}

	return currentPriority.id - candidatePriority.id;
};

export const pickPreferredCiviCrmContact = (contacts: CiviCrmRecord[]) => {
	if (!contacts.length) return null;

	const sortedContacts = [...contacts].sort(compareCiviCrmContacts);

	return sortedContacts[0] || null;
};

const normalizeAreasOfInterest = (areasOfInterest: string[]) =>
	areasOfInterest
		.map(item => item.trim())
		.filter(Boolean)
		.join(', ');

const findOrCreateOrganization = async (
	name: string,
): Promise<number | null> => {
	const trimmed = name.trim();
	if (!trimmed) return null;

	const existing = valuesToArray(
		await civiGet(CIVI_API_PATHS.CONTACT_GET, {
			select: ['id'],
			where: [
				['contact_type', '=', 'Organization'],
				['organization_name', '=', trimmed],
			],
			limit: 1,
		}),
	);

	if (existing[0]?.id) return Number(existing[0].id);

	const created = firstValue(
		await civiPostForm(CIVI_API_PATHS.CONTACT_CREATE, {
			values: {
				contact_type: 'Organization',
				organization_name: trimmed,
			},
		}),
	);

	return created?.id ? Number(created.id) : null;
};

export const updateCiviCrmProfileFields = async ({
	contactId,
	mastodonHandle,
	institution,
	areasOfInterest,
}: UpdateCiviCrmProfileFieldsArgs) => {
	try {
		const employerId = await findOrCreateOrganization(institution);

		const values: Record<string, unknown> = {
			'Individual_information.Mastodon': mastodonHandle,
			'Individual_information.Areas_of_expertise':
				normalizeAreasOfInterest(areasOfInterest),
		};

		if (employerId !== null) {
			values.employer_id = employerId;
		} else if (institution.trim() === '') {
			values.employer_id = null;
		}

		await civiPostForm(CIVI_API_PATHS.CONTACT_UPDATE, {
			values,
			where: [['id', '=', contactId]],
		});
	} catch (error) {
		return handleError(error);
	}
};

export const upsertPrimaryPhone = async ({
	contactId,
	phoneNumber,
}: UpsertPrimaryPhoneArgs) => {
	try {
		if (!phoneNumber.trim()) return;

		await civiPostForm(CIVI_API_PATHS.PHONE_SAVE, {
			records: [
				{
					contact_id: contactId,
					phone: phoneNumber.trim(),
					is_primary: true,
					phone_type_id: 1,
				},
			],
			match: ['contact_id', 'is_primary'],
		});
	} catch (error) {
		return handleError(error);
	}
};

export const upsertPrimaryAddress = async ({
	contactId,
	city,
	countryId,
}: UpsertPrimaryAddressArgs) => {
	try {
		const values: Record<string, unknown> = {
			contact_id: contactId,
			is_primary: true,
		};

		if (city.trim()) values.city = city.trim();
		if (countryId) values.country_id = countryId;

		await civiPostForm(CIVI_API_PATHS.ADDRESS_SAVE, {
			records: [values],
			match: ['contact_id', 'is_primary'],
		});
	} catch (error) {
		return handleError(error);
	}
};

const toCountryId = (value: unknown) => {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && value.trim()) {
		const parsedValue = Number(value);
		if (Number.isFinite(parsedValue)) return parsedValue;
	}
	return 0;
};

const mapCiviCountry = (
	country: CiviCrmRecord,
): CiviCrmCountryOption | undefined => {
	const id = toCountryId(country.id);
	const name =
		getCleanString(country.label) ||
		getCleanString(country.name) ||
		getCleanString(country.description);

	if (!id || !name) return undefined;

	return {
		id,
		name,
		isoCode:
			getCleanString(country.iso_code) || getCleanString(country.country_code),
	};
};

export const getCiviCrmCountries = async (): Promise<
	CiviCrmCountryOption[]
> => {
	try {
		const countries = valuesToArray<CiviCrmRecord>(
			await civiGet(CIVI_API_PATHS.COUNTRY_GET, {
				limit: 300,
				orderBy: { name: 'ASC' },
			}),
		)
			.map(mapCiviCountry)
			.filter(
				(country): country is CiviCrmCountryOption => country !== undefined,
			)
			.sort((left, right) => left.name.localeCompare(right.name));

		return countries;
	} catch (error) {
		return handleError(error);
	}
};
