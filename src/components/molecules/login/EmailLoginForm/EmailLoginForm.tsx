import { View, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { useColorScheme } from 'nativewind';
import { PasswordEyeCloseIcon, PasswordEyeIcon } from '@/util/svg/icon.common';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getLoginSchema } from '@/util/schema/loginSchema';
import { useMastodonLoginMutation } from '@/hooks/mutations/auth.mutation';
import { Flow } from 'react-native-animated-spinkit';
import { HTTP_ERROR_MESSAGE } from '@/util/constant';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { verifyAuthToken } from '@/services/auth.service';
import { GuestStackParamList } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import { useTranslation } from 'react-i18next';
import { getUserSetting, getUserLocale } from '@/services/profile.service';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import {
	addOrUpdateAccount,
	AuthState,
	getAccountId,
	switchActiveAccount,
} from '@/util/storage';
import customColor from '@/util/constant/color';
import { useMastodonAuth } from '@/hooks/custom/useMastodonAuth';

const EmailLoginForm = () => {
	const { t } = useTranslation();
	const { setLanguage } = useLanguageStore();
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(getLoginSchema(t)),
	});
	const { setAuthState, setUserInfo, setSelectedTimeline } =
		useAuthStoreAction();
	const [alertState, setAlert] = useState<{
		message: string;
		isOpen: boolean;
		isErrorAlert: boolean;
		alertType?: 'link-extended' | 'default';
		linkText?: string;
		onLinkPress?: () => void;
	}>({
		message: '',
		isOpen: false,
		isErrorAlert: false,
	});
	const navigation = useNavigation<StackNavigationProp<GuestStackParamList>>();

	const { startAuth, isLoading } = useMastodonAuth({
		onError: error =>
			setAlert({
				message: error?.message || t('common.error'),
				isErrorAlert: true,
				isOpen: true,
			}),
	});

	const { mutateAsync: mastodonLogin, isPending: isMastodonPending } =
		useMastodonLoginMutation({
			onSuccess: async (mastodonResponse, variables) => {
				const userInfo = await verifyAuthToken(
					mastodonResponse.access_token,
					process.env.API_URL ?? '',
				);
				const newAuthState: AuthState = {
					access_token: mastodonResponse.access_token,
					domain: process.env.API_URL ?? '',
					userInfo: {
						username: userInfo.username,
						displayName: userInfo.display_name,
						avatar: userInfo.avatar,
					},
				};
				await addOrUpdateAccount(newAuthState);
				const accId = getAccountId(newAuthState);
				await switchActiveAccount(accId);

				setAuthState({
					wordpress: { token: '' },
					mastodon: { token: mastodonResponse.access_token },
				});

				const userSetting = await getUserSetting();
				if (userSetting) {
					setSelectedTimeline(userSetting.settings?.user_timeline[0]);
				}

				const userPrefs = await getUserLocale();
				if (userPrefs?.['posting:default:language']) {
					setLanguage(userPrefs['posting:default:language'] as ILanguage);
				}

				setUserInfo(userInfo);
			},
			onError: (error: any, variables) => {
				if (error.status == 400) {
					if (error?.message == HTTP_ERROR_MESSAGE?.INVALID_GRANT) {
						return setAlert({
							message: t('login.two_factor_auth_error_message'),
							isErrorAlert: true,
							isOpen: true,
							alertType: 'link-extended',
							linkText: t('login.two_factor_auth_error_link'),
							onLinkPress: () => {
								setAlert(prev => ({ ...prev, isOpen: false }));
								startAuth();
							},
						});
					}
				}
				if (error.status == 401 && error?.data?.firstname) {
					navigation.navigate('AddUserNameScreen', {
						email: variables.username,
						password: variables.password,
						firstName: error?.data?.firstname || '',
						lastName: error?.data?.lastname || '',
					});
					return;
				}
				if (error.status == 401 && error?.message == 'Missing credentials') {
					return setAlert({
						message: 'Channel creation process must be completed before login',
						isErrorAlert: true,
						isOpen: true,
					});
				}
				return setAlert({
					message: error?.message || 'Something went wrong.',
					isErrorAlert: true,
					isOpen: true,
				});
			},
		});

	const [pwVisibility, setPwVissibility] = useState({
		password: false,
	});

	const { colorScheme } = useColorScheme();

	const onSubmit = (data: any) => {
		if (!isMastodonPending) {
			mastodonLogin({ username: data.email, password: data.password });
		}
	};

	return (
		<View className={cn(isTablet ? 'w-[50%] self-center' : '')}>
			<Controller
				name="email"
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<View>
						<TextInput
							placeholder={t('login.email_address')}
							onChangeText={onChange}
							value={value}
							onBlur={onBlur}
							inputMode="email"
							extraContainerStyle="mb-6 mt-8"
							autoCorrect={false}
							keyboardType="email-address"
						/>
						{errors.email && (
							<ThemeText
								size="xs_12"
								variant={'textOrange'}
								className="-mt-4 mb-2"
							>
								{'*' + errors.email.message}
							</ThemeText>
						)}
					</View>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<View>
						<TextInput
							placeholder={t('login.password')}
							onChangeText={onChange}
							onBlur={onBlur}
							value={value}
							secureTextEntry={!pwVisibility.password}
							endIcon={
								<Pressable
									className="px-2 py-2 -mt-2 active:opacity-80"
									onPress={() =>
										setPwVissibility(prev => ({
											...prev,
											password: !prev.password,
										}))
									}
								>
									{pwVisibility.password ? (
										<PasswordEyeIcon
											fill={colorScheme === 'dark' ? 'white' : 'gray'}
											className=""
										/>
									) : (
										<PasswordEyeCloseIcon
											fill={colorScheme === 'dark' ? 'white' : 'gray'}
										/>
									)}
								</Pressable>
							}
							extraContainerStyle="mb-4"
						/>
						{errors.password && (
							<ThemeText
								size="xs_12"
								variant={'textOrange'}
								className="-mt-2 mb-2"
							>
								{'*' + errors.password.message}
							</ThemeText>
						)}
					</View>
				)}
			/>

			<View className="flex flex-row justify-end mb-6">
				<Pressable
					onPress={() => navigation.navigate('ForgotPassword')}
					className="active:opacity-90"
				>
					<ThemeText>{t('login.forgot_password?')}</ThemeText>
				</Pressable>
			</View>
			<Button onPress={handleSubmit(onSubmit)} className="my-3 h-[48]">
				{isMastodonPending || isLoading ? (
					<Flow size={25} color={'#fff'} />
				) : (
					<ThemeText className="text-white dark:text-white">
						{t('login.log_in')}
					</ThemeText>
				)}
			</Button>
			{isLoading && (
				<Modal
					transparent
					visible={isLoading}
					animationType="fade"
					statusBarTranslucent
				>
					<View className="flex-1 items-center justify-center">
						<View className="absolute top-0 right-0 bottom-0 left-0 bg-black opacity-70" />
						<Flow size={35} color={customColor['patchwork-primary']} />
					</View>
				</Modal>
			)}
			<CustomAlert
				isVisible={alertState.isOpen}
				extraTitleStyle="text-white text-center -ml-2"
				extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
				message={alertState.message}
				title={
					alertState.isErrorAlert ? t('common.error') : t('common.success')
				}
				alertType={alertState.alertType}
				linkText={alertState.linkText}
				onLinkPress={alertState.onLinkPress}
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
				type="error"
			/>
		</View>
	);
};

export default EmailLoginForm;
