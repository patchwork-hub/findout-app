import { CIVICRM_BASE_URL } from '@/util/constant';
import instance from '@/services/instance';
import { AxiosResponse } from 'axios';
import type { CiviCrmResponse } from '@/types/civicrm.type';

// ─────────────────────────────────────────────────────────────────────────────
// API Paths
// ─────────────────────────────────────────────────────────────────────────────

export const CIVI_API_PATHS = {
	CONTACT_GET: '/civicrm/ajax/api4/Contact/get',
	CONTACT_CREATE: '/civicrm/ajax/api4/Contact/create',
	CONTACT_UPDATE: '/civicrm/ajax/api4/Contact/update',
	CONTACT_TYPE_GET: '/civicrm/ajax/api4/ContactType/get',
	COUNTRY_GET: '/civicrm/ajax/api4/Country/get',
	PHONE_SAVE: '/civicrm/ajax/api4/Phone/save',
	ADDRESS_SAVE: '/civicrm/ajax/api4/Address/save',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// URL & Auth
// ─────────────────────────────────────────────────────────────────────────────

/** Returns CiviCRM base URL without trailing slash */
const getCiviBaseUrl = (): string => CIVICRM_BASE_URL.replace(/\/$/, '');

/** Returns CiviCRM API key from environment */
const getCiviApiKey = (): string => {
	const apiKey = process.env.CIVICRM_API_KEY;
	if (!apiKey) {
		throw new Error('Missing CIVICRM_API_KEY environment value');
	}
	return apiKey;
};

/** Builds auth headers for CiviCRM API requests */
const buildCiviHeaders = () => ({
	'X-Civi-Auth': `Bearer ${getCiviApiKey()}`,
	'X-Requested-With': 'XMLHttpRequest',
	skipInterceptor: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extracts values array from CiviCRM response (handles object or array format) */
export const valuesToArray = <T = Record<string, unknown>>(
	data: CiviCrmResponse | undefined,
): T[] => {
	if (!data) return [];
	if (Array.isArray(data.values)) return data.values as T[];
	if (data.values && typeof data.values === 'object') {
		return Object.values(data.values) as T[];
	}
	return [];
};

/** Returns first value from CiviCRM response or null */
export const firstValue = <T = Record<string, unknown>>(
	data: CiviCrmResponse | undefined,
): T | null => (valuesToArray<T>(data)[0] as T) || null;

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client
// ─────────────────────────────────────────────────────────────────────────────

/** Throws if CiviCRM response indicates an error */
const assertNoError = (data: CiviCrmResponse | undefined) => {
	if (data?.is_error) {
		throw new Error('CiviCRM returned error response');
	}
};

/** GET request with params serialized as JSON in query string */
export const civiGet = async (
	path: string,
	params: Record<string, unknown>,
): Promise<CiviCrmResponse> => {
	const response: AxiosResponse<CiviCrmResponse> = await instance.get(
		`${getCiviBaseUrl()}${path}`,
		{
			params: { params: JSON.stringify(params) },
			headers: buildCiviHeaders(),
		},
	);

	assertNoError(response.data);
	return response.data;
};

/** POST request with URL-encoded form body (for CiviCRM API4 mutations) */
export const civiPostForm = async (
	path: string,
	params: Record<string, unknown>,
): Promise<CiviCrmResponse> => {
	const body = new URLSearchParams({
		params: JSON.stringify(params),
	});

	const response: AxiosResponse<CiviCrmResponse> = await instance.post(
		`${getCiviBaseUrl()}${path}`,
		body.toString(),
		{
			headers: {
				...buildCiviHeaders(),
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		},
	);

	assertNoError(response.data);
	return response.data;
};

/** POST request with JSON body */
export const civiPostJson = async <T = CiviCrmResponse>(
	path: string,
	payload: Record<string, unknown>,
): Promise<T> => {
	const response: AxiosResponse<T> = await instance.post(
		`${getCiviBaseUrl()}${path}`,
		payload,
		{
			headers: {
				...buildCiviHeaders(),
				'Content-Type': 'application/json',
			},
		},
	);

	assertNoError(response.data as CiviCrmResponse);
	return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// String utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Extracts a clean string from unknown value (handles arrays, numbers, strings) */
export const getCleanString = (value: unknown): string => {
	if (Array.isArray(value)) {
		const firstVal = value[0];
		if (typeof firstVal === 'string') return firstVal.trim();
		if (typeof firstVal === 'number') return String(firstVal);
		return '';
	}
	if (typeof value === 'number') return String(value);
	return typeof value === 'string' ? value.trim() : '';
};
