// CiviCRM Contact CRUD operations
export {
	findCiviCrmContactByHandle,
	findCiviCrmContactByEmail,
	getCiviCrmContactById,
	updateCiviCrmContactHandle,
	createCiviCrmContact,
	isAppCreatedCiviContact,
	pickPreferredCiviCrmContact,
	updateCiviCrmProfileFields,
	upsertPrimaryPhone,
	upsertPrimaryAddress,
	getCiviCrmCountries,
} from './civicrm.service';

// CiviCRM ↔ Mastodon pairing
export {
	pairUserWithCiviCrm,
	buildFullMastodonHandle,
	getUserEmail,
	mapCiviCrmProfile,
} from './civicrmPairing.service';
export type { PairUserResult } from './civicrmPairing.service';

// CiviCRM People directory
export {
	getCiviPeopleList,
	getCiviDepartmentOptions,
} from './civicrmPeople.service';
