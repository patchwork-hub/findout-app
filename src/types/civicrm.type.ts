/**
 * CiviCRM Types for Mastodon-CiviCRM Pairing
 */

// Base Types
/** Generic CiviCRM record from API response */
export type CiviCrmRecord = Record<string, unknown>;

/** CiviCRM contact record (alias for clarity) */
export type CiviCrmContact = CiviCrmRecord;

/** CiviCRM API response structure */
export type CiviCrmResponse = {
	is_error?: number;
	values?: CiviCrmRecord[] | Record<string, CiviCrmRecord>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Pairing Types
// ─────────────────────────────────────────────────────────────────────────────

/** How the CiviCRM contact was matched to the Mastodon user */
export type CiviCrmMatchedBy = 'mastodon' | 'email' | 'created' | 'none';

/** App sources that indicate a contact was created by the app */
export type CiviCrmAppSource = 'csid-app-signup' | 'csid-app-pairing';

/** Options for pairing a user with CiviCRM */
export type PairUserOptions = {
	createSource?: CiviCrmAppSource;
};

/** Result of pairing a user with CiviCRM */
export type PairUserResult = {
	user: Patchwork.Account;
	contactId?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Function Args
// ─────────────────────────────────────────────────────────────────────────────

/** Args for creating a new CiviCRM contact */
export type CreateCiviCrmContactArgs = {
	firstName: string;
	middleName: string;
	lastName: string;
	mastodonHandle: string;
	source: CiviCrmAppSource;
	email?: string;
};

/** Args for updating CiviCRM profile fields */
export type UpdateCiviCrmProfileFieldsArgs = {
	contactId: number;
	mastodonHandle: string;
	institution: string;
	areasOfInterest: string[];
};

/** Args for upserting primary phone */
export type UpsertPrimaryPhoneArgs = {
	contactId: number;
	phoneNumber: string;
};

/** Args for upserting primary address */
export type UpsertPrimaryAddressArgs = {
	contactId: number;
	city: string;
	countryId?: number;
};

/** Country option returned from CiviCRM */
export type CiviCrmCountryOption = {
	id: number;
	name: string;
	isoCode?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// CiviCRM Profile (Mapped from CiviCRM Contact)
// ─────────────────────────────────────────────────────────────────────────────

/** CiviCRM profile data attached to Mastodon account */
export type CiviCrmProfile = {
	contactId?: number;
	contactType?: string;
	source?: string;
	appCreated?: boolean;
	matchedBy: CiviCrmMatchedBy;
	mastodonHandle: string;
	institution?: string;
	locationCity?: string;
	locationCountryId?: number;
	locationCountryName?: string;
	areasOfInterest: string[];
	phoneNumber?: string;
	bio?: string;
	careerLevel?: string;
	linkedin?: string;
	github?: string;
};
