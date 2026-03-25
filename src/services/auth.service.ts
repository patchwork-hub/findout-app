import { QueryFunctionContext } from '@tanstack/react-query';
import {
	GetNewsmastAccountlDetailQueryKey,
	GetUserQueryKey,
	LoginMutationPayload,
	SearchServerInstanceQueryKey,
} from '@/types/queries/auth.type';
import instance from '@/services/instance';
import { appendApiVersion, handleError } from '@/util/helper/helper';
import axios, { AxiosResponse } from 'axios';
import {
	DEFAULT_API_URL,
	DEFAULT_DASHBOARD_API_URL,
	CHANNEL_INSTANCE,
	DEFAULT_BRISTOL_DASHBOARD_API_URL,
	DEFAULT_FINDOUT_DASHBOARD_API_URL,
} from '@/util/constant';
import { platform } from 'os';
import { getActiveAuthState } from '@/util/storage';

export const getUserById = async ({
	queryKey,
}: QueryFunctionContext<GetUserQueryKey>) => {
	try {
		const [, payload] = queryKey;
		const resp = await instance.get(`users/${payload.id}`);
		return resp;
	} catch (e) {
		return handleError(e);
	}
};

export const mastodonLogin = async (params: LoginMutationPayload) => {
	const body = {
		...params,
		grant_type: 'password',
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET_TOKEN,
		scope: 'read write follow push profile',
	};

	try {
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			'/oauth/token',
			body,
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};

export const bristolCableSignIn = async (params: {
	username: string;
	email: string;
	password: string;
}) => {
	try {
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			appendApiVersion('custom_passwords/bristol_cable_sign_in'),
			params,
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};

export const wordpressLogin = async (params: LoginMutationPayload) => {
	const body = {
		username: params.username,
		password: params.password,
	};

	try {
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			'/jwt-auth/v1/token',
			body,
			{
				baseURL: 'https://newsmast.wpcomstaging.com',
			},
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};

export const exchangeCodeForWordpressToken = async (code: string) => {
	try {
		const response: AxiosResponse<{ access_token: string }> = await axios.post(
			'https://public-api.wordpress.com/oauth2/token',
			new URLSearchParams({
				client_id: process.env.WORDPRESS_CLIENT_ID || '',
				client_secret: process.env.WORDPRESS_CLIENT_SECRET || '',
				redirect_uri: process.env.APP_REDIRECT_URI || '',
				grant_type: 'authorization_code',
				code: code,
			}).toString(),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			},
		);
		return response.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressUserProfile = async (wordpressToken: string) => {
	try {
		const response: AxiosResponse<Patchwork.WPUserProfileResponse> =
			await axios.get('https://public-api.wordpress.com/rest/v1.1/me', {
				headers: {
					Authorization: `Bearer ${wordpressToken}`,
					skipInterceptor: true,
				},
			});
		return response.data;
	} catch (error) {
		return handleError(error);
	}
};

export const loginToMastodonWithWordpress = async (params: {
	wordpressProfile: Patchwork.WPUserProfileResponse;
}) => {
	try {
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			'/api/v1/auth/wordpress_login',
			{
				userData: params.wordpressProfile,
			},
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};

export const signUp = async (params: {
	email: string;
	username: string;
	password: string;
	agreement: boolean;
	locale: string;
	access_token: string;
	date_of_birth?: string;
}) => {
	try {
		const { access_token, ...payload } = params;
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			appendApiVersion('accounts'),
			payload,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
					skipInterceptor: true,
				},
			},
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};

// export const verifyAuthToken = async () => {
// 	try {
// 		const resp: AxiosResponse<Patchwork.Account> = await instance.get(
// 			appendApiVersion('accounts/verify_credentials', 'v1'),
// 		);
// 		return resp.data;
// 	} catch (error) {
// 		return handleError(error);
// 	}
// };

export const verifyAuthToken = async (token?: string, domain?: string) => {
	try {
		const authToken = token ?? (await getActiveAuthState()).access_token;
		const baseURL =
			domain ?? (await getActiveAuthState()).domain ?? DEFAULT_API_URL;
		const resp: AxiosResponse<Patchwork.Account> = await instance.get(
			appendApiVersion('accounts/verify_credentials', 'v1'),
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
					skipInterceptor: true,
				},
				baseURL,
			},
		);

		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const requestForgotPassword = async (params: { email: string }) => {
	try {
		const resp: AxiosResponse<{ reset_password_token: string }> =
			await instance.post(appendApiVersion('custom_passwords', 'v1'), params);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const requestResendSignUpOTP = async ({ token }: { token: string }) => {
	try {
		const resp: AxiosResponse<{ reset_password_token: string }> =
			await instance.get(
				appendApiVersion(`custom_passwords/request_otp?id=${token}`, 'v1'),
			);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const verifyOTP = async (params: {
	id: string;
	otp_secret: string;
	is_reset_password: boolean;
}) => {
	try {
		const resp: AxiosResponse<{
			message: {
				access_token: string;
				token_type: string;
				scope: string;
				created_at: string;
			};
		}> = await instance.post(
			appendApiVersion('custom_passwords/verify_otp', 'v1'),
			{
				id: params.id,
				otp_secret: params.otp_secret,
				is_reset_password: params.is_reset_password,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const resetPassword = async (params: {
	reset_password_token: string;
	password: string;
	password_confirmation: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.put(
			appendApiVersion(`custom_passwords/${params.reset_password_token}`, 'v1'),
			{
				password: params.password,
				password_confirmation: params.password_confirmation,
				is_reset_password: true,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updatePassword = async (params: {
	current_password: string;
	password: string;
	password_confirmation: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendApiVersion(`custom_passwords/change_password`, 'v1'),
			{
				current_password: params.current_password,
				password: params.password,
				password_confirmation: params.password_confirmation,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const revokeToken = async (params: { token: string }) => {
	try {
		const body = {
			...params,
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET_TOKEN,
		};
		const resp: AxiosResponse<{}> = await instance.post('/oauth/revoke', body);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const searchServerInstance = async (
	qfContext: QueryFunctionContext<SearchServerInstanceQueryKey>,
) => {
	try {
		const { domain } = qfContext.queryKey[1];
		const resp: AxiosResponse<Patchwork.Instance_V2> = await instance.get(
			appendApiVersion('instance', 'v2'),
			{
				params: {
					domain_name: domain,
					isDynamicDomain: true,
				},
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const requestInstance = async ({ domain }: { domain: string }) => {
	try {
		const body = {
			client_name: domain,
			website: DEFAULT_API_URL,
			redirect_uris: 'Patchwork://',
			scopes: `write read follow push`,
		};

		const resp: AxiosResponse<Patchwork.InstanceResponse> = await instance.post(
			`https://${domain}/api/v1/apps`,
			body,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const authorizeInstance = async (payload: {
	code: string;
	grant_type: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
	domain: string;
}) => {
	try {
		const resp: AxiosResponse<Patchwork.InstanceAuthroizationResponse> =
			await instance.post(`https://${payload.domain}/oauth/token`, payload);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const changeEmail = async (params: {
	current_password: string;
	email: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: Patchwork.LoginRespone }> =
			await instance.post(
				appendApiVersion(`custom_passwords/change_email`, 'v1'),
				{
					current_password: params.current_password,
					email: params.email,
				},
			);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const changeEmailVerification = async (params: {
	id: string;
	otp_secret: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: Patchwork.LoginRespone }> =
			await instance.post(
				appendApiVersion('custom_passwords/verify_otp', 'v1'),
				{ id: params.id, otp_secret: params.otp_secret, is_change_email: true },
			);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getNewsmastUserInfo = async (
	qfContext: QueryFunctionContext<GetNewsmastAccountlDetailQueryKey>,
) => {
	const { domain_name } = qfContext.queryKey[1];
	const resp: AxiosResponse<{ data: Patchwork.Account }> = await instance.get(
		appendApiVersion(`users/show_details`, 'v1'),
		{
			params: {
				domain_name: domain_name,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data.data;
};

export const changeNewsmastEmail = async (params: {
	email: string;
	domain_name: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: Patchwork.LoginRespone }> =
			await instance.put(appendApiVersion(`users/change_email_phone`, 'v1'), {
				user: {
					email: params.email,
				},
			});
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const changeNewsmastEmailVerification = async (params: {
	user_id: string;
	confirmed_otp_code: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: Patchwork.LoginRespone }> =
			await instance.put(appendApiVersion(`verify_otp`, 'v1'), {
				confirmed_otp_code: params.confirmed_otp_code,
				user_id: '',
			});
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const deleteAccount = async (params: { password: string }) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendApiVersion('delete_account', 'v1'),
			{
				password: params.password,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getShowMastodonLoginForm = async () => {
	try {
		const resp: AxiosResponse<{ display: boolean }> = await instance.get(
			appendApiVersion(`custom_menus/display`, 'v1'),
			{
				params: {
					domain_name: DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
					app_name: 'bristol-cable',
					platform: 'android',
				},
			},
		);
		return resp;
	} catch (e) {
		return handleError(e);
	}
};

export const checkIsCurrentChannelAppDepracated = async ({
	current_app_version,
	os_type,
}: {
	current_app_version: string;
	os_type: string;
}) => {
	try {
		const resp: AxiosResponse<{ deprecated: boolean; link_url: string }> =
			await instance.get(appendApiVersion(`app_versions/check_version`, 'v1'), {
				params: {
					current_app_version,
					os_type,
					isDynamicDomain: true,
					domain_name: DEFAULT_FINDOUT_DASHBOARD_API_URL,
					removeBearerToken: true,
				},
				headers: {
					client_id: process.env.CLIENT_ID || '',
					client_secret: process.env.CLIENT_SECRET_TOKEN || '',
				},
			});
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const getAccessTokenForSignUp = async () => {
	const body = {
		grant_type: 'client_credentials',
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET_TOKEN,
		scope: 'read write follow push profile',
	};

	try {
		const { data }: AxiosResponse<Patchwork.LoginRespone> = await instance.post(
			'/oauth/token',
			body,
		);
		return data;
	} catch (error) {
		return handleError(error);
	}
};
