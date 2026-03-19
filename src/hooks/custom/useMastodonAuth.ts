import { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {
	useAuthorizeInstanceMutation,
	useRequestPermissionToInstanceMutation,
} from '@/hooks/mutations/auth.mutation';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { verifyAuthToken } from '@/services/auth.service';
import {
	addOrUpdateAccount,
	AuthState,
	getAccountId,
	switchActiveAccount,
} from '@/util/storage';
import { ensureHttp, removeHttps } from '@/util/helper/helper';
import { GuestStackParamList } from '@/types/navigation';
import { DEFAULT_INSTANCE } from '@/util/constant';

interface UseMastodonAuthProps {
	onSuccess?: () => void;
	onError?: (error: any) => void;
	isAddAccount?: boolean;
	isFromSwitchAccount?: boolean;
}

export const useMastodonAuth = ({
	onSuccess,
	onError,
	isAddAccount = false,
	isFromSwitchAccount = false,
}: UseMastodonAuthProps = {}) => {
	const navigation = useNavigation<StackNavigationProp<GuestStackParamList>>();
	const { setAuthState, setUserInfo, setUserOriginInstance } =
		useAuthStoreAction();
	const [targetDomain, setTargetDomain] = useState<string>(
		process.env.API_URL ?? DEFAULT_INSTANCE,
	);

	const { mutate: authorizeUser, isPending: isAuthorizing } =
		useAuthorizeInstanceMutation({
			onSuccess: async resp => {
				try {
					const finalDomain = ensureHttp(targetDomain);
					const userInfo = await verifyAuthToken(
						resp.access_token,
						finalDomain,
					);
					InAppBrowser.close();
					const newAuthState: AuthState = {
						access_token: resp.access_token,
						domain: finalDomain,
						userInfo: {
							username: userInfo.username,
							displayName: userInfo.display_name,
							avatar: userInfo.avatar,
						},
					};

					if (isAddAccount) {
						await addOrUpdateAccount(newAuthState, false);
					} else {
						await addOrUpdateAccount(newAuthState);
						const accId = getAccountId(newAuthState);
						await switchActiveAccount(accId);
						setUserInfo(userInfo);
						setUserOriginInstance(targetDomain);
						setAuthState({
							wordpress: { token: '' },
							mastodon: { token: resp.access_token },
						});
					}

					if (onSuccess) onSuccess();
				} catch (err) {
					if (onError) onError(err);
				}
			},
			onError: error => {
				if (onError) onError(error);
			},
		});

	const handleAuthForIos = async (
		url: string,
		client_id: string,
		client_secret: string,
		domain: string,
	) => {
		try {
			if (!isAddAccount) {
				try {
					InAppBrowser.close();
				} catch (error) {
					console.warn('Failed to close InAppBrowser', error);
				}
				// Add a delay to ensure previous browser sessions are fully cleaned up
				await new Promise(resolve => setTimeout(resolve, 500));
			}

			if (await InAppBrowser.isAvailable()) {
				const result = await InAppBrowser.openAuth(url, 'FindOutMedia://', {
					ephemeralWebSession: false,
					showTitle: false,
					enableUrlBarHiding: true,
					enableDefaultShare: false,
					showInRecents: true,
					forceCloseOnRedirection: false,
				});
				if (result.type === 'success' && result.url) {
					const REGEX_FOR_CODE = /[?&]code=([^&]+)/;
					const authorizationCode = result.url.match(REGEX_FOR_CODE);

					if (authorizationCode && authorizationCode[1]) {
						authorizeUser({
							code: authorizationCode[1],
							domain: removeHttps(domain),
							client_id,
							client_secret,
							redirect_uri: 'FindOutMedia://',
							grant_type: 'authorization_code',
						});
					}
				}
			}
		} catch (error) {
			if (onError) onError(error);
		}
	};

	const { mutate: requestPermission, isPending: isRequestingPermission } =
		useRequestPermissionToInstanceMutation({
			onSuccess: res => {
				const queryParams = new URLSearchParams({
					client_id: res.client_id,
					client_secret: res.client_secret,
					response_type: 'code',
					redirect_uri: 'FindOutMedia://',
					scope: 'write read follow push',
				});
				const url = `https://${removeHttps(
					targetDomain,
				)}/oauth/authorize?${queryParams.toString()}`;

				if (Platform.OS === 'android') {
					navigation.navigate('MastodonSignInWebView', {
						url,
						domain: removeHttps(targetDomain),
						client_id: res.client_id,
						client_secret: res.client_secret,
						isAddAccount,
						isFromSwitchAccount: isFromSwitchAccount,
					});
				} else {
					handleAuthForIos(url, res.client_id, res.client_secret, targetDomain);
				}
			},
			onError: error => {
				if (onError) onError(error);
			},
		});

	const startAuth = (
		domain: string = process.env.API_URL ?? DEFAULT_INSTANCE,
	) => {
		setTargetDomain(domain);
		requestPermission({ domain: removeHttps(domain) });
	};

	return {
		startAuth,
		isLoading: isRequestingPermission || isAuthorizing,
	};
};
