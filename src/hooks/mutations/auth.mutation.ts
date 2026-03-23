import {
	verifyOTP,
	requestForgotPassword,
	resetPassword,
	updatePassword,
	revokeToken,
	requestInstance,
	authorizeInstance,
	changeEmail,
	changeEmailVerification,
	changeNewsmastEmail,
	changeNewsmastEmailVerification,
	deleteAccount,
	checkIsCurrentChannelAppDepracated,
	signUp,
	getAccessTokenForSignUp,
	requestResendSignUpOTP,
	wordpressLogin,
	mastodonLogin,
	getWordpressUserProfile,
	loginToMastodonWithWordpress,
	bristolCableSignIn,
} from '@/services/auth.service';
import { LoginMutationPayload } from '@/types/queries/auth.type';
import {
	MutationOptions,
	useMutation,
	UseMutationOptions,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

// export const useLoginEmailMutation = (
// 	options: UseMutationOptions<
// 		Patchwork.LoginRespone,
// 		AxiosError,
// 		LoginMutationPayload
// 	>,
// ) => {
// 	return useMutation({ mutationFn: login, ...options });
// };

export const useWordpressLoginMutation = (
	options: UseMutationOptions<
		Patchwork.LoginRespone,
		AxiosError,
		LoginMutationPayload
	>,
) => {
	return useMutation({ mutationFn: wordpressLogin, ...options });
};

export const useMastodonLoginMutation = (
	options: UseMutationOptions<
		Patchwork.LoginRespone,
		AxiosError,
		LoginMutationPayload
	>,
) => {
	return useMutation({ mutationFn: mastodonLogin, ...options });
};

export const useBristolCableSignInMutation = (
	options?: UseMutationOptions<
		Patchwork.LoginRespone,
		AxiosError,
		{
			username: string;
			email: string;
			password: string;
		}
	>,
) => {
	return useMutation({
		mutationFn: bristolCableSignIn,
		...options,
	});
};

export const useSignUpMutation = (
	options: UseMutationOptions<
		Patchwork.LoginRespone,
		AxiosError,
		{
			email: string;
			username: string;
			password: string;
			agreement: boolean;
			locale: string;
			access_token: string;
		}
	>,
) => {
	return useMutation({ mutationFn: signUp, ...options });
};

export const useGetSignUpAccessTokenMutation = (
	options: UseMutationOptions<Patchwork.LoginRespone, AxiosError>,
) => {
	return useMutation({ mutationFn: getAccessTokenForSignUp, ...options });
};

export const useForgotPWMutation = (
	options: UseMutationOptions<
		{ reset_password_token: string },
		AxiosError,
		{ email: string }
	>,
) => {
	return useMutation({ mutationFn: requestForgotPassword, ...options });
};

export const useRequestResendSignUpOTP = (
	options: UseMutationOptions<
		{ reset_password_token: string },
		AxiosError,
		{ token: string }
	>,
) => {
	return useMutation({ mutationFn: requestResendSignUpOTP, ...options });
};

export const useOTPVerificationMutation = (
	options: UseMutationOptions<
		{
			message: {
				access_token: string;
				token_type: string;
				scope: string;
				created_at: string;
			};
		},
		AxiosError,
		{
			id: string;
			otp_secret: string;
			is_reset_password: boolean;
		}
	>,
) => {
	return useMutation({ mutationFn: verifyOTP, ...options });
};

export const useResetPWMutation = (
	options: UseMutationOptions<
		{
			message: string;
		},
		AxiosError,
		{
			reset_password_token: string;
			password: string;
			password_confirmation: string;
		}
	>,
) => {
	return useMutation({ mutationFn: resetPassword, ...options });
};

export const useUpdatePasswordMutation = (
	options: UseMutationOptions<
		{
			message: string;
		},
		AxiosError,
		{
			current_password: string;
			password: string;
			password_confirmation: string;
		}
	>,
) => {
	return useMutation({ mutationFn: updatePassword, ...options });
};

export const useTokenRevokeMutation = (
	options: UseMutationOptions<{}, AxiosError, { token: string }>,
) => {
	return useMutation({ mutationFn: revokeToken, ...options });
};

export const useRequestPermissionToInstanceMutation = (
	options: UseMutationOptions<
		Patchwork.InstanceResponse,
		AxiosError,
		{
			domain: string;
		}
	>,
) => {
	return useMutation({ mutationFn: requestInstance, ...options });
};

export const useAuthorizeInstanceMutation = (
	options: UseMutationOptions<
		Patchwork.InstanceAuthroizationResponse,
		AxiosError,
		{
			code: string;
			grant_type: string;
			client_id: string;
			client_secret: string;
			redirect_uri: string;
			domain: string;
		}
	>,
) => {
	return useMutation({ mutationFn: authorizeInstance, ...options });
};

export const useChangeEmailMutation = (
	options: UseMutationOptions<
		{ message: Patchwork.LoginRespone },
		AxiosError,
		{
			current_password: string;
			email: string;
		}
	>,
) => {
	return useMutation({ mutationFn: changeEmail, ...options });
};

export const useChangeEmailVerificationMutation = (
	options: UseMutationOptions<
		{ message: Patchwork.LoginRespone },
		AxiosError,
		{
			id: string;
			otp_secret: string;
		}
	>,
) => {
	return useMutation({ mutationFn: changeEmailVerification, ...options });
};

export const useChangeNewsmastEmailMutation = (
	options: UseMutationOptions<
		{ message: Patchwork.LoginRespone },
		AxiosError,
		{
			email: string;
		}
	>,
) => {
	return useMutation({ mutationFn: changeNewsmastEmail, ...options });
};

export const useChangeNewsmastEmailVerificationMutation = (
	options: UseMutationOptions<
		{ message: Patchwork.LoginRespone },
		AxiosError,
		{
			user_id: string;
			confirmed_otp_code: string;
		}
	>,
) => {
	return useMutation({
		mutationFn: changeNewsmastEmailVerification,
		...options,
	});
};

export const useDeleteAccMutation = (
	options: UseMutationOptions<{ message: string }, AxiosError>,
) => {
	return useMutation({
		mutationFn: deleteAccount,
		...options,
	});
};

export const useCheckIsCurrentChannelAppDepracated = (
	options: UseMutationOptions<
		{ deprecated: boolean; link_url: string },
		AxiosError,
		{
			current_app_version: string;
			os_type: string;
		}
	>,
) => {
	return useMutation({
		mutationFn: checkIsCurrentChannelAppDepracated,
		...options,
	});
};
