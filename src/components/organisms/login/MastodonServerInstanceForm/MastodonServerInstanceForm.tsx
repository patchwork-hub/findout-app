import { Button } from '@/components/atoms/common/Button/Button';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import Image from '@/components/atoms/common/Image/Image';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { ServerInstanceLoading } from '@/components/atoms/loading/ServerInstanceLoading';
import useDebounce from '@/hooks/custom/useDebounce';
import {
	useAuthorizeInstanceMutation,
	useRequestPermissionToInstanceMutation,
} from '@/hooks/mutations/auth.mutation';
import { useSearchServerInstance } from '@/hooks/queries/auth.queries';
import { verifyAuthToken } from '@/services/auth.service';
import { getUserLocale } from '@/services/profile.service';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import { GuestStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { initialAlertState } from '@/util/constant/common';
import { mastodonInstances } from '@/util/constant/popularMastodonInstances';
import { ensureHttp, formatNumber, saveAuthState } from '@/util/helper/helper';
import { checkSupportsNotiV2 } from '@/util/helper/instanceVersionUtils';
import { isTablet } from '@/util/helper/isTablet';
import { cn } from '@/util/helper/twutil';
import { SearchIcon } from '@/util/svg/icon.common';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { Blurhash } from 'react-native-blurhash';
import FastImage from '@d11/react-native-fast-image';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
	addOrUpdateAccount,
	AuthState,
	getAccountId,
	switchActiveAccount,
} from '@/util/storage';

export const MastodonServerInstanceForm = () => {
	const { t, i18n } = useTranslation();
	const { setLanguage } = useLanguageStore();
	const { colorScheme } = useColorScheme();
	const [typedDomainName, setTypedDomainName] = useState('');
	const [finalKeyword, setFinalKeyword] = useState('');
	const [isLocalSearching, setIsLocalSearching] = useState(false);
	const [alertState, setAlert] = useState(initialAlertState);
	const startDebounce = useDebounce();
	const navigation = useNavigation<StackNavigationProp<GuestStackParamList>>();
	const { setAuthState, setUserInfo, setUserOriginInstance } =
		useAuthStoreAction();
	const [isImageLoaded, setImageLoaded] = useState(false);
	const [isImageError, setImageError] = useState(false);
	const [suggestions, setSuggestions] = useState<
		{ name: string; url: string }[]
	>([]);
	const lineHeightStyle =
		i18n.language === 'my' ? { lineHeight: 62, paddingTop: 20 } : {};

	const { data: searchInstanceRes, isFetching: isSearching } =
		useSearchServerInstance({
			domain: finalKeyword,
			enabled: finalKeyword.length > 0,
		});

	const { mutate, isPending } = useRequestPermissionToInstanceMutation({
		onSuccess: res => {
			const queryParams = new URLSearchParams({
				client_id: res.client_id,
				client_secret: res.client_secret,
				response_type: 'code',
				redirect_uri: 'FindOutMedia://',
				scope: 'write read follow push',
			});
			const url = `https://${finalKeyword}/oauth/authorize?${queryParams.toString()}`;
			if (Platform.OS == 'android') {
				return navigation.navigate('MastodonSignInWebView', {
					url,
					domain: finalKeyword,
					client_id: res.client_id,
					client_secret: res.client_secret,
				});
			}
			handleAuthForIos(url, res.client_id, res.client_secret);
		},
		onError: async error => {
			setAlert({
				message: error?.message || 'Something went wrong.',
				isErrorAlert: true,
				isOpen: true,
			});
		},
	});

	const { mutate: authorizeUser, isPending: isAuthroizing } =
		useAuthorizeInstanceMutation({
			onSuccess: async resp => {
				const userInfo = await verifyAuthToken(
					resp.access_token,
					ensureHttp(finalKeyword),
				);
				const newAuthState: AuthState = {
					access_token: resp.access_token,
					domain: ensureHttp(finalKeyword),
					userInfo: {
						username: userInfo.username,
						displayName: userInfo.display_name,
						avatar: userInfo.avatar,
					},
				};

				await addOrUpdateAccount(newAuthState);
				const accId = getAccountId(newAuthState);
				await switchActiveAccount(accId);

				setUserInfo(userInfo);
				setUserOriginInstance(finalKeyword);
				setAuthState({
					wordpress: { token: '' },
					mastodon: { token: resp.access_token },
				});

				const userPrefs = await getUserLocale();
				if (userPrefs?.['posting:default:language']) {
					setLanguage(userPrefs['posting:default:language'] as ILanguage);
				}
			},
			onError: async error => {
				setAlert({
					message: error?.message || 'Something went wrong.',
					isErrorAlert: true,
					isOpen: true,
				});
			},
		});

	const handleAuthForIos = async (
		url: string,
		client_id: string,
		client_secret: string,
	) => {
		InAppBrowser.close();
		const result = await InAppBrowser.openAuth(url, 'FindOutMedia://', {
			ephemeralWebSession: false,
			showTitle: false,
			enableUrlBarHiding: true,
			enableDefaultShare: false,
			showInRecents: true,
			forceCloseOnRedirection: false,
		});

		if (result.type === 'success') {
			const REGEX_FOR_CODE = /[?&]code=([^&]+)/;

			const authorizationCode = result.url.match(REGEX_FOR_CODE);

			if (authorizationCode && authorizationCode[1]) {
				authorizeUser({
					code: authorizationCode[1],
					// code: 'YAqK37FwJIbi3ABR-AcfgNjo_l3hQNx7zokoEX-IknA',
					domain: finalKeyword,
					client_id,
					client_secret,
					redirect_uri: 'FindOutMedia://',
					grant_type: 'authorization_code',
				});
			}
		}
	};

	useEffect(() => {
		setIsLocalSearching(true);
		startDebounce(() => {
			const query = typedDomainName.toLowerCase().trim();

			if (query.length === 0) {
				setSuggestions([]);
				setFinalKeyword('');
				setIsLocalSearching(false);
				return;
			}

			const filtered = mastodonInstances.filter(instance =>
				instance.name.toLowerCase().includes(query),
			);
			setSuggestions(filtered);

			if (filtered.length === 0) {
				setFinalKeyword(typedDomainName);
			} else {
				setFinalKeyword('');
			}
			setIsLocalSearching(false);
		}, 800);
	}, [typedDomainName]);

	const onPressLogin = () => {
		if (searchInstanceRes && !isPending) {
			mutate({ domain: searchInstanceRes.domain });
			if (typeof searchInstanceRes !== 'string') {
				const isSupportNotiV2 = checkSupportsNotiV2(searchInstanceRes?.version);
				// setInstanceInfo(searchInstanceRes?.version, isSupportNotiV2);
			}
		}
	};

	return (
		<>
			<KeyboardAwareScrollView
				className="mx-6"
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: 50,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<ThemeText
					size={'xl_24'}
					className="font-NewsCycle_Bold mb-2"
					style={lineHeightStyle}
				>
					{t('common.welcome_back')}
				</ThemeText>
				<ThemeText className="mb-4 text-md">
					{t('login.mastodon_login_instruction')}
				</ThemeText>
				<TextInput
					placeholder={t('login.enter_your_server')}
					value={typedDomainName}
					maxLength={40}
					onChangeText={str => {
						setTypedDomainName(str);
						if (str.trim().length === 0) {
							setSuggestions([]);
							setFinalKeyword('');
						}
					}}
					startIcon={<SearchIcon className="mt-[2]" />}
					autoCapitalize="none"
					autoCorrect={false}
				/>
				{/* Suggestions container */}
				{suggestions.length > 0 && (
					<View className="bg-patchwork-light-100 dark:bg-patchwork-dark-400 rounded-lg py-1.5 px-2 mt-2">
						{suggestions.map(instance => (
							<Pressable
								key={instance.name}
								onPress={() => {
									setFinalKeyword(instance.name);
									setSuggestions([]);
								}}
								className="flex-row items-center py-2 px-3 rounded-md my-0.5"
								style={({ pressed }) => ({
									backgroundColor: pressed ? '#f2f2f2' : 'transparent',
								})}
							>
								<Image
									source={{ uri: instance.url }}
									className="w-7 h-7 rounded-full mr-2.5"
									resizeMode="cover"
								/>
								<ThemeText variant={'textGrey'}>{instance.name}</ThemeText>
							</Pressable>
						))}
					</View>
				)}

				{isSearching && (
					<View className="mt-5 border border-slate-100 dark:border-patchwork-dark-50 rounded-md">
						<ServerInstanceLoading />
					</View>
				)}

				{!isLocalSearching &&
					!isSearching &&
					suggestions.length === 0 &&
					!searchInstanceRes &&
					typedDomainName.length > 0 && (
						<View className="mt-5 border border-slate-100 dark:border-patchwork-dark-50 rounded-md p-3">
							<ThemeText variant={'textGrey'}>
								{t('login.no_server_found')}
							</ThemeText>
						</View>
					)}

				{/* SEARCH RESULT */}
				{!isSearching && finalKeyword !== '' && searchInstanceRes && (
					<View className="mt-5 rounded-md border border-slate-100 dark:border-gray-500">
						<FastImage
							className="w-full h-[200] rounded-tl-md rounded-tr-md bg-gray-500"
							source={{
								uri: searchInstanceRes?.thumbnail?.url,
							}}
							onLoad={() => {
								setImageLoaded(true);
								setImageError(false);
							}}
							onLoadStart={() => setImageLoaded(false)}
							onError={() => setImageError(true)}
							resizeMode={'cover'}
						/>
						{(!isImageLoaded || isImageError) && (
							<Blurhash
								decodeAsync
								blurhash={
									searchInstanceRes?.thumbnail?.blurhash ||
									'UZK1zcI_-gxVF8WB--NK-4$wo#NJI[ItxYNH'
								}
								style={[
									{
										position: 'absolute',
										width: '100%',
										height: 200,
									},
								]}
							/>
						)}
						<View className="p-4 bg-slate-50 dark:bg-patchwork-dark-900">
							<ThemeText className="mb-2">
								{searchInstanceRes?.title} - {searchInstanceRes?.domain}{' '}
							</ThemeText>
							<ThemeText className="mb-2">
								{searchInstanceRes?.description}
							</ThemeText>
							<ThemeText>
								{t('login.monthly_user')} -{' '}
								{formatNumber(searchInstanceRes?.usage?.users?.active_month)}
							</ThemeText>
							<Button
								onPress={onPressLogin}
								className={cn('my-3', isTablet ? 'w-[30%] self-center' : '')}
								variant="outline"
							>
								{isPending ? (
									<Flow
										size={15}
										color={colorScheme === 'dark' ? '#fff' : '#000'}
									/>
								) : (
									<ThemeText className="dark:text-white">
										{t('login.login')}
									</ThemeText>
								)}
							</Button>
						</View>
					</View>
				)}
			</KeyboardAwareScrollView>
			{isAuthroizing && (
				<>
					<View className="flex-1 items-center justify-center absolute top-0 right-0 bottom-0 left-0 bg-black opacity-70"></View>
					<View className="items-center justify-center absolute top-0 right-0 bottom-0 left-0">
						<Flow
							size={35}
							color={
								colorScheme === 'dark'
									? customColor['patchwork-primary-dark']
									: customColor['patchwork-primary']
							}
						/>
					</View>
				</>
			)}
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
		</>
	);
};
export default MastodonServerInstanceForm;
