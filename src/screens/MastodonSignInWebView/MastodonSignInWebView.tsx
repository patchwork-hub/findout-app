import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useAuthorizeInstanceMutation } from '@/hooks/mutations/auth.mutation';
import { verifyAuthToken } from '@/services/auth.service';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { GuestStackScreenProps } from '@/types/navigation';
import { ensureHttp } from '@/util/helper/helper';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import { initialAlertState } from '@/util/constant/common';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';
import { useTranslation } from 'react-i18next';
import { getUserLocale } from '@/services/profile.service';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import {
	addOrUpdateAccount,
	AuthState,
	getAccountId,
	switchActiveAccount,
} from '@/util/storage';
import { useAccounts } from '@/hooks/custom/useAccounts';
import { useAccountsStore } from '@/store/auth/accountsStore';

const MastodonSignInWebView = ({
	route,
	navigation,
}: GuestStackScreenProps<'MastodonSignInWebView'>) => {
	const { t } = useTranslation();
	const { setLanguage } = useLanguageStore();
	const { colorScheme } = useColorScheme();
	const {
		url,
		domain,
		client_id,
		client_secret,
		isAddAccount,
		isFromSwitchAccount,
	} = route.params;
	const [progress, setProgress] = useState(0);
	const [isLoaded, setLoaded] = useState(false);
	const { setAuthState, setUserInfo, setUserOriginInstance } =
		useAuthStoreAction();
	const [alertState, setAlert] = useState(initialAlertState);
	const { fetchAccounts } = useAccounts();
	const openAccSwitcher =
		useAccountsStore(state => state.openAccSwitcher) ?? (() => {});

	const { mutate } = useAuthorizeInstanceMutation({
		onSuccess: async resp => {
			const userInfo = await verifyAuthToken(
				resp.access_token,
				ensureHttp(domain),
			);

			const newAuthState: AuthState = {
				access_token: resp.access_token,
				domain: ensureHttp(domain),
				userInfo: {
					username: userInfo.username,
					displayName: userInfo.display_name,
					avatar: userInfo.avatar,
				},
			};

			if (isAddAccount) {
				await addOrUpdateAccount(newAuthState, false);
				if (Platform.OS === 'android' && isFromSwitchAccount) {
					navigation.goBack();
					navigation.goBack();
					fetchAccounts();
					openAccSwitcher?.();
				} else {
					navigation.goBack();
				}
			} else {
				await addOrUpdateAccount(newAuthState);
				const accId = getAccountId(newAuthState);
				await switchActiveAccount(accId);
				setUserInfo(userInfo);
				setUserOriginInstance(ensureHttp(domain));
				setAuthState({
					wordpress: { token: '' },
					mastodon: { token: resp.access_token },
				});
			}

			const userPrefs = await getUserLocale();
			if (userPrefs?.['posting:default:language']) {
				setLanguage(userPrefs['posting:default:language'] as ILanguage);
			}
		},
		onError: async error => {
			setAlert({
				message: error?.message || t('common.error'),
				isErrorAlert: true,
				isOpen: true,
			});
		},
	});

	const onNavigationStateChange = (navigationState: WebViewNavigation) => {
		const authorizationCode = navigationState.url.match(/[?&]code=([^&]+)/);

		if (authorizationCode && authorizationCode[1]) {
			mutate({
				code: authorizationCode[1],
				domain,
				client_id,
				client_secret,
				redirect_uri: 'FindOutMedia://',
				grant_type: 'authorization_code',
			});
		}
	};

	return (
		<SafeScreen style={{ flex: 1 }}>
			<Header
				title={''}
				leftCustomComponent={<BackButton extraClass="border-0" />}
				hideUnderline
			/>
			{!isLoaded && (
				<Progress.Bar
					progress={progress}
					width={null}
					borderWidth={0}
					borderRadius={0}
					height={3}
					color={
						colorScheme === 'dark'
							? customColor['patchwork-primary-dark']
							: customColor['patchwork-primary']
					}
				/>
			)}
			<KeyboardAvoidingView
				style={{ flex: 1, marginTop: !isLoaded ? 0 : 3 }}
				behavior="padding"
				keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
			>
				<WebView
					source={{ uri: url }}
					onLoadProgress={({ nativeEvent }) =>
						setProgress(nativeEvent.progress)
					}
					onLoadEnd={() => setLoaded(true)}
					onNavigationStateChange={onNavigationStateChange}
					overScrollMode="never"
					showsVerticalScrollIndicator={false}
					nestedScrollEnabled={true}
				/>
				<CustomAlert
					isVisible={alertState.isOpen}
					extraTitleStyle="text-white text-center -ml-2"
					extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
					message={alertState.message}
					title={
						alertState.isErrorAlert ? t('common.error') : t('common.success')
					}
					handleCancel={() =>
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}))
					}
					handleOk={() =>
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}))
					}
					type={alertState.isErrorAlert ? 'error' : 'success'}
				/>
			</KeyboardAvoidingView>
		</SafeScreen>
	);
};

export default MastodonSignInWebView;
