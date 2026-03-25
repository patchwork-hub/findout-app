import { removeHttps } from '@/util/helper/helper';
import {
	createCiviCrmContact,
	findCiviCrmContactByEmail,
	findCiviCrmContactByHandle,
	getCiviCrmContactById,
	isAppCreatedCiviContact,
	pickPreferredCiviCrmContact,
	updateCiviCrmContactHandle,
} from './civicrm.service';
import type {
	CiviCrmContact,
	CiviCrmMatchedBy,
	PairUserOptions,
	PairUserResult,
} from '@/types/civicrm.type';

export type { PairUserResult } from '@/types/civicrm.type';

const text = (value: unknown) => {
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return String(value);
	return '';
};

const optionalText = (value: unknown) => text(value) || undefined;

const splitAreas = (value: string) =>
	value
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);

const getNameParts = (userInfo: Patchwork.Account) => {
	const parts = (userInfo.display_name || userInfo.username || '')
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	return {
		firstName: parts[0] || '',
		middleName: parts.slice(1, -1).join(' '),
		lastName: parts.length > 1 ? parts[parts.length - 1] : '',
	};
};
export const buildFullMastodonHandle = (
	userInfo: Patchwork.Account,
	domain?: string,
) => {
	const rawAcct = userInfo.acct?.trim();
	const cleanDomain = removeHttps(domain || process.env.API_URL || '').trim();

	if (!rawAcct) return '';

	if (rawAcct.includes('@')) {
		return rawAcct.startsWith('@') ? rawAcct : `@${rawAcct}`;
	}

	return `@${rawAcct}@${cleanDomain}`;
};

export const getUserEmail = (userInfo: Patchwork.Account) =>
	userInfo.email || userInfo.source?.email || '';

export const mapCiviCrmProfile = (
	contact: CiviCrmContact | null,
	matchedBy: CiviCrmMatchedBy,
	mastodonHandle: string,
): Patchwork.Account['civicrm'] => {
	if (!contact) {
		return {
			matchedBy: 'none',
			mastodonHandle,
			areasOfInterest: [],
		};
	}

	return {
		contactId: Number(contact.id),
		contactType: optionalText(contact.contact_type),
		source: optionalText(contact.source),
		appCreated: isAppCreatedCiviContact(contact),
		matchedBy,
		mastodonHandle:
			optionalText(contact['Individual_information.Mastodon']) ||
			mastodonHandle,
		institution: optionalText(contact['employer_id.display_name']),
		locationCity: optionalText(contact['address.city']),
		locationCountryId: Number(contact['address.country_id'] || 0) || undefined,
		locationCountryName: optionalText(contact['address.country_id:label']),
		areasOfInterest: splitAreas(
			text(contact['Individual_information.Areas_of_expertise']),
		),
		phoneNumber: optionalText(contact['phone.phone']),
		bio: optionalText(contact['Individual_information.Bio']),
		careerLevel: optionalText(contact['Individual_information.Career_Level']),
		linkedin: optionalText(contact['Individual_information.LinkedIn']),
		github: optionalText(contact['Individual_information.GitHub']),
	};
};

export const pairUserWithCiviCrm = async (
	userInfo: Patchwork.Account,
	domain?: string,
	options: PairUserOptions = {},
): Promise<PairUserResult> => {
	try {
		const existingContactId = userInfo.civicrm?.contactId;
		const mastodonHandle = buildFullMastodonHandle(userInfo, domain);
		const email = getUserEmail(userInfo);
		const createSource = options.createSource ?? 'csid-app-pairing';

		if (existingContactId) {
			const contact = await getCiviCrmContactById(existingContactId);
			return {
				user: {
					...userInfo,
					civicrm: mapCiviCrmProfile(
						contact,
						userInfo.civicrm?.matchedBy ?? 'mastodon',
						mastodonHandle,
					),
				},
				contactId: existingContactId,
			};
		}

		const handleMatches = await findCiviCrmContactByHandle(mastodonHandle);

		const handleMatch = pickPreferredCiviCrmContact(handleMatches || []);

		if (handleMatch) {
			return {
				user: {
					...userInfo,
					civicrm: mapCiviCrmProfile(handleMatch, 'mastodon', mastodonHandle),
				},
				contactId: Number(handleMatch?.id),
			};
		}

		const emailMatches = await findCiviCrmContactByEmail(email);

		const emailMatch = pickPreferredCiviCrmContact(emailMatches || []);

		if (emailMatch) {
			const contactId = Number(emailMatch?.id);

			await updateCiviCrmContactHandle(contactId, mastodonHandle);

			const freshContact = await getCiviCrmContactById(contactId);

			return {
				user: {
					...userInfo,
					civicrm: mapCiviCrmProfile(freshContact, 'email', mastodonHandle),
				},
				contactId,
			};
		}

		const { firstName, middleName, lastName } = getNameParts(userInfo);

		const createdContact = await createCiviCrmContact({
			firstName,
			middleName,
			lastName,
			mastodonHandle,
			source: createSource,
			email,
		});

		const createdContactId = Number(createdContact?.id);
		const freshCreatedContact = createdContactId
			? await getCiviCrmContactById(createdContactId)
			: null;

		return {
			user: {
				...userInfo,
				civicrm: mapCiviCrmProfile(
					freshCreatedContact,
					'created',
					mastodonHandle,
				),
			},
			contactId: createdContactId || undefined,
		};
	} catch {
		return {
			user: {
				...userInfo,
				civicrm: mapCiviCrmProfile(
					null,
					'none',
					buildFullMastodonHandle(userInfo, domain),
				),
			},
		};
	}
};
