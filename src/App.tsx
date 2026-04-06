import 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';
import { useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'nativewind';
import ApplicationNavigator from './navigators/Application';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
	getThemeFromStorage,
	isDevelopment,
	ThemeValue,
} from './util/helper/helper';
import { useAuthStoreAction } from './store/auth/authStore';
import { Alert, Appearance, StatusBar, View } from 'react-native';
import { searchServerInstance, verifyAuthToken } from './services/auth.service';
import Toast from 'react-native-toast-message';
import { MenuProvider } from 'react-native-popup-menu';
import * as Sentry from '@sentry/react-native';
import { DEFAULT_INSTANCE } from './util/constant';
import SuccessToast from './components/atoms/common/SuccessToast/SuccessToast';
import ErrorToast from './components/atoms/common/ErrorToast/ErrorToast';
import { withStallion } from 'react-native-stallion';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './i18n';
import { useTranslation } from 'react-i18next';
import {
	ILanguage,
	supportedLanguage,
	useLanguageStore,
} from './store/feed/languageStore';
import { throttle } from 'lodash';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useLanguageSelectionActions } from './store/compose/languageSelection/languageSelection';
import {
	checkUserThemeSetting,
	getUserLocale,
	getUserSetting,
} from './services/profile.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchServerInstanceQueryKey } from './types/queries/auth.type';
import {
	addOrUpdateAccount,
	AuthState,
	getActiveAuthState,
	removeAccount,
} from './util/storage';
import { useAccounts } from './hooks/custom/useAccounts';
import SplashAnimation from './components/organisms/SplashAnimation/SplashAnimation';
import { SystemBars } from 'react-native-edge-to-edge';
import Sound from 'react-native-sound';
import { useUserThemeSetting } from './hooks/queries/profile.queries';

Sound.setCategory('Ambient', true);

Sentry.init({
	dsn: isDevelopment() ? undefined : process.env.DEFAULT_SENTRY_DSN,
	tunnel: '/tunnel',
	tracesSampleRate: 1.0,
	debug: false,
});

export const queryClient = new QueryClient();

export const storage = new MMKV();

const toastConfig = {
	successToast: ({ text1 }: any) => <SuccessToast text1={text1} />,
	errorToast: ({ text1 }: any) => <ErrorToast text1={text1} />,
};

function App() {
	const { colorScheme, setColorScheme } = useColorScheme();
	const { i18n } = useTranslation();
	const { language, setLanguage, setDefaultGuestLanguage } = useLanguageStore();
	const { setSelectedLanguage } = useLanguageSelectionActions();
	const {
		setAuthState,
		setUserInfo,
		setUserOriginInstance,
		clearAuthState,
		setUserTheme,
		setSelectedTimeline,
		setHomeLayout,
	} = useAuthStoreAction();
	const [isLoading, setLoading] = useState(true);
	const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>();
	const { activeAccId } = useAccounts();

	const hasStartedInitialization = useRef(false);

	useEffect(() => {
		throttle(() => {
			if (language) {
				i18n.changeLanguage(language);
				setSelectedLanguage(language);
			}
		}, 1000)();
	}, [language]);

	const initializeApp = async () => {
		if (hasStartedInitialization.current) return;
		hasStartedInitialization.current = true;
		await initTheme();
		retrieveToken();
	};

	const initTheme = async () => {
		const savedTheme = await getThemeFromStorage();
		if (savedTheme) {
			setColorScheme(savedTheme);
			setResolvedTheme(savedTheme);
		} else {
			const systemTheme = Appearance.getColorScheme() as ThemeValue;
			setColorScheme(systemTheme);
			setResolvedTheme(systemTheme);
		}
	};

	const retrieveToken = async () => {
		const { access_token, domain } = await getActiveAuthState();

		if (!access_token)
			return handleLocaleIfAuthFail().finally(() => setLoading(false));

		try {
			const userInfo = await verifyAuthToken(access_token, domain);
			if (!userInfo) return handleLocaleIfAuthFail();

			// noted: for account switching flow
			const newAuthState: AuthState = {
				access_token: access_token,
				domain: domain,
				userInfo: {
					username: userInfo.username,
					displayName: userInfo.display_name,
					avatar: userInfo.avatar,
				},
			};

			await addOrUpdateAccount(newAuthState);

			setUserInfo(userInfo);
			setUserOriginInstance(domain);

			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: access_token },
			});

			// noted: these below apis will be refactored later
			try {
				const userSetting = await checkUserThemeSetting();

				if (userSetting) {
					const selectedTheme =
						(userSetting.settings?.theme?.type as ThemeValue) ?? 'light';
					if (selectedTheme) {
						setColorScheme(selectedTheme);
						setResolvedTheme(selectedTheme);
					}
				}
			} catch (e) {
				console.warn('[App] Failed to load user theme:', e);
			}

			try {
				const userSetting = await getUserSetting();

				if (userSetting) {
					const selectedTimeline =
						userSetting.settings?.user_timeline?.[0] ?? 2; // default is 2 (for you custom timeline)
					setSelectedTimeline(selectedTimeline);

					const layout = userSetting.settings?.user_timeline?.[1] ?? 1;
					if (layout !== undefined) setHomeLayout(layout);
				}
			} catch (e) {
				console.warn('[App] Failed to load user settings:', e);
			}

			const userPrefs = await getUserLocale();
			const lang = userPrefs?.['posting:default:language'];
			if (lang) setLanguage(lang as ILanguage);
		} catch {
			await handleLocaleIfAuthFail();
		} finally {
			setLoading(false);
		}
	};

	const handleLocaleIfAuthFail = async () => {
		clearAuthState();
		if (activeAccId) {
			await removeAccount(activeAccId);
		}
		const defaultInstance = await queryClient.fetchQuery<
			Patchwork.Instance_V2,
			Error,
			Patchwork.Instance_V2,
			SearchServerInstanceQueryKey
		>({
			queryKey: ['search-server-instance', { domain: DEFAULT_INSTANCE }],
			queryFn: searchServerInstance,
		});
		const isDefaultLocaleSupported = supportedLanguage.includes(
			defaultInstance.languages[0],
		);
		const serverLocale = isDefaultLocaleSupported
			? defaultInstance.languages[0]
			: 'en';

		setDefaultGuestLanguage(serverLocale as ILanguage);
		const storedLanguage = await AsyncStorage.getItem(
			'language-settings-storage',
		);

		if (!storedLanguage && defaultInstance?.languages?.[0]) {
			setLanguage(serverLocale as ILanguage);
			if (!isDefaultLocaleSupported) {
				Alert.alert(
					'Language Not Supported',
					`Your server's default language "${defaultInstance.languages[0]}" is not supported. "en" will be automatically set as the default.`,
					[{ text: 'OK', onPress: () => {} }],
					{ cancelable: true },
				);
			}
		}
	};

	useEffect(() => {
		if (resolvedTheme) {
			setUserTheme(resolvedTheme);
		}
	}, [resolvedTheme]);

	if (isLoading) {
		return <SplashAnimation onFinishAnimation={initializeApp} />;
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
			<BottomSheetModalProvider>
				<View className="flex-1 bg-white dark:bg-patchwork-dark-100">
					<QueryClientProvider client={queryClient}>
						<KeyboardProvider>
							<MenuProvider>
								<ApplicationNavigator />
								<Toast config={toastConfig} />
							</MenuProvider>
						</KeyboardProvider>
					</QueryClientProvider>
				</View>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}

export default withStallion(App);
