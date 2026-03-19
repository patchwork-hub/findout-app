import { QueryFunctionContext } from '@tanstack/react-query';
import {
	AccountInfoQueryKey,
	CheckRelationshipQueryKey,
	FollowerAccountsQueryKey,
	FollowingAccountsQueryKey,
	GetSuggestedPeopleQueryKey,
	SpecificServerProfileQueryKey,
	UpdateProfilePayload,
} from '@/types/queries/profile.type';
import {
	appendApiVersion,
	appendDynamicDomain,
	handleError,
	removeHttps,
} from '@/util/helper/helper';
import axios, { AxiosResponse } from 'axios';
import instance from './instance';
import { useAuthStore } from '@/store/auth/authStore';
import {
	CHANNEL_INSTANCE,
	DEFAULT_BRISTOL_DASHBOARD_API_URL,
	DEFAULT_DASHBOARD_API_URL,
	DEFAULT_INSTANCE,
} from '@/util/constant';
import { SearchUsersQueryKey } from '@/types/queries/conversations.type';

export const accountInfoQueryFn = async ({
	queryKey,
}: QueryFunctionContext<AccountInfoQueryKey>) => {
	try {
		const { id, domain_name } = queryKey[1];
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;

		const resp: AxiosResponse<Patchwork.Account> = await instance.get(
			appendApiVersion(`accounts/${id}`, 'v1'),
			{
				params: {
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
				},
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const getSpecificServerProfile = async (
	qfContext: QueryFunctionContext<SpecificServerProfileQueryKey>,
) => {
	try {
		const { q, type } = qfContext.queryKey[1];
		const resp: AxiosResponse<Patchwork.SearchResult> = await instance.get(
			appendApiVersion(`search`, 'v2'),
			{
				params: { q: q, resolve: true, type: type ?? 'accounts' },
			},
		);

		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

// export const getSpecificServerProfile = async (
// 	qfContext: QueryFunctionContext<SpecificServerProfileQueryKey>,
// ) => {
// 	try {
// 		const { q } = qfContext.queryKey[1];
// 		const resp: AxiosResponse<Patchwork.Account[]> = await instance.get(
// 			appendApiVersion('accounts/search'),
// 			{
// 				params: {
// 					q,
// 					limit: 1,
// 					resolve: true,
// 				},
// 			},
// 		);
// 		return { accounts: resp.data, hashtags: [], statuses: [] };
// 	} catch (e) {
// 		return handleError(e);
// 	}
// };

export const checkRelationshipQueryFn = async (
	qfContext: QueryFunctionContext<CheckRelationshipQueryKey>,
) => {
	try {
		const { accountIds } = qfContext.queryKey[1];
		const resp: AxiosResponse<Patchwork.RelationShip[]> = await instance.get(
			appendApiVersion(`accounts/relationships`, 'v1'),
			{
				params: { with_suspended: true, id: accountIds },
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const relationshipQueryFn = async ({
	accountId,
	isFollowing,
}: {
	accountId: string;
	isFollowing: boolean;
}) => {
	try {
		const relation = isFollowing ? 'unfollow' : 'follow';
		const resp: AxiosResponse<Patchwork.RelationShip> = await instance.post(
			appendApiVersion(`accounts/${accountId}/${relation}`, 'v1'),
			isFollowing ? undefined : { reblogs: true },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const followRequestsQueryFn = async ({
	accountId,
	requestType,
}: {
	accountId: string;
	requestType: 'authorize' | 'reject';
}) => {
	try {
		const resp: AxiosResponse<Patchwork.RelationShip> = await instance.post(
			appendApiVersion(`follow_requests/${accountId}/${requestType}`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getFollowingAccountsQueryFn = async (
	qfContext: QueryFunctionContext<FollowingAccountsQueryKey>,
) => {
	try {
		const { domain_name, accountId } = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`accounts/${accountId}/following`),
			{
				params: {
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
					max_id,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const getFollowerAccountsQueryFn = async (
	qfContext: QueryFunctionContext<FollowerAccountsQueryKey>,
) => {
	try {
		const { domain_name, accountId } = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == CHANNEL_INSTANCE &&
			state.userOriginInstance !== CHANNEL_INSTANCE;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`accounts/${accountId}/followers`),
			{
				params: {
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
					max_id,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (e) {
		return handleError(e);
	}
};

// type ProfileDetailStatusResponse = {
// 	statuses_data: Patchwork.Status[];
// 	meta: {
// 		pagination: { total_objects: number | null; has_more_objects: boolean };
// 	};
// };

// export const getProfileDetailStatus = async ({
// 	queryKey,
// }: QueryFunctionContext<ProfileDetailStatusQueryKey>) => {
// 	try {
// 		const [, params] = queryKey;
// 		const { id } = params;
// 		const resp = await axios.get<ProfileDetailStatusResponse>(
// 			`https://backend.newsmast.org/api/v1/users/get_profile_detail_statuses_by_account`,
// 			{
// 				params: { id: id.toString() },
// 				headers: {
// 					Authorization: `Bearer ${token}`,
// 				},
// 			},
// 		);
// 		return resp.data.statuses_data;
// 	} catch (e) {
// 		return handleError(e);
// 	}
// };

export const updateProfile = async (
	params: UpdateProfilePayload,
): Promise<Patchwork.Account> => {
	try {
		const formData = new FormData();
		if (params.avatar && typeof params.avatar !== 'string') {
			const avatar = {
				uri: params.avatar?.uri,
				type: params.avatar?.type,
				name: params.avatar?.uri?.split('/').pop(),
			};
			formData.append('avatar', avatar);
		}
		if (params.header && typeof params.header !== 'string') {
			const header = {
				uri: params.header?.uri,
				type: params.header?.type,
				name: params.header?.uri?.split('/').pop(),
			};
			formData.append('header', header);
		}
		if (params.display_name !== undefined) {
			formData.append('display_name', params.display_name);
		}
		if (params.note !== undefined) {
			formData.append('note', params.note);
		}

		if (params.locked !== undefined) {
			formData.append('locked', params.locked.toString());
		}

		if (params.fields_attributes) {
			Object.values(params.fields_attributes).forEach((field, index) => {
				if (field.value.trim() === '') {
					formData.append(`fields_attributes[${index}][name]`, '');
					formData.append(`fields_attributes[${index}][value]`, '');
				} else {
					formData.append(`fields_attributes[${index}][name]`, field.name);
					formData.append(`fields_attributes[${index}][value]`, field.value);
				}
			});
		}
		const resp: AxiosResponse<Patchwork.Account> = await instance.patch(
			appendApiVersion(`accounts/update_credentials`, 'v1'),
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const deleteProfileMedia = async ({
	mediaType,
}: {
	mediaType: 'avatar' | 'header';
}): Promise<Patchwork.Account> => {
	const endpoint = mediaType === 'avatar' ? 'profile/avatar' : 'profile/header';
	const resp: AxiosResponse<Patchwork.Account> = await instance.delete(
		appendApiVersion(endpoint, 'v1'),
	);
	return resp.data;
};

export const getSuggestedPeople = async (
	qfContext: QueryFunctionContext<GetSuggestedPeopleQueryKey>,
) => {
	try {
		const { limit } = qfContext.queryKey[1];
		const resp: AxiosResponse<Patchwork.SuggestedPeople[]> = await instance.get(
			appendApiVersion(`suggestions`, 'v2'),
			{
				params: { limit },
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const checkUserThemeSetting = async () => {
	const state = useAuthStore.getState();
	const domain = removeHttps(state.userOriginInstance);
	try {
		const response: AxiosResponse<{ data: Patchwork.UserTheme }> =
			await instance.get(
				appendDynamicDomain(
					process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					appendApiVersion(`settings`, 'v1'),
				),
				{
					params: {
						instance_domain: domain,
						app_name: 'newsmast',
					},
				},
			);
		return response.data.data;
	} catch (e) {
		return handleError(e);
	}
};

export const getUserLocale = async () => {
	try {
		const response: AxiosResponse<Patchwork.UserPreferences> =
			await instance.get(appendApiVersion(`preferences`, 'v1'));
		return response.data;
	} catch (e) {
		return handleError(e);
	}
};

export const changeUserThemeSetting = async ({
	theme,
}: {
	theme: 'light' | 'dark' | undefined;
}) => {
	try {
		const state = useAuthStore.getState();
		const domain = removeHttps(state.userOriginInstance);
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(
					`settings/upsert?app_name=newsmast&instance_domain=${domain}`,
					'v1',
				),
			),
			{
				settings: {
					theme: {
						type: theme,
					},
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const changeUserLocale = async ({ lang }: { lang: string }) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendApiVersion(`user_locales`, 'v1'),
			{
				lang,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getUserSetting = async () => {
	const state = useAuthStore.getState();
	const domain = removeHttps(state.userOriginInstance);
	try {
		const response: AxiosResponse<{ data: Patchwork.UserSetting }> =
			await instance.get(
				appendDynamicDomain(
					DEFAULT_BRISTOL_DASHBOARD_API_URL,
					appendApiVersion(`settings`, 'v1'),
				),
				{
					params: {
						instance_domain: domain,
						app_name: 'bristol_cable',
					},
				},
			);
		return response.data.data;
	} catch (e) {
		return handleError(e);
	}
};

export const changeUserSetting = async ({
	theme,
	user_timeline,
}: {
	theme?: 'light' | 'dark' | undefined;
	user_timeline?: number[];
}) => {
	try {
		const state = useAuthStore.getState();
		const domain = removeHttps(state.userOriginInstance);
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				DEFAULT_BRISTOL_DASHBOARD_API_URL,
				appendApiVersion(
					`settings/upsert?app_name=bristol_cable&instance_domain=${domain}`,
					'v1',
				),
			),
			{
				settings: {
					user_timeline,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updateAccNoti = async ({
	accountId,
	notify,
}: {
	accountId: string;
	notify: boolean;
}) => {
	try {
		const resp: AxiosResponse<Patchwork.RelationShip> = await instance.post(
			appendApiVersion(`accounts/${accountId}/follow`, 'v1'),
			{ notify: notify },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};
