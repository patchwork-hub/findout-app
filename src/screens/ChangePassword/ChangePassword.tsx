import BackButton from '@/components/atoms/common/BackButton/BackButton';
import { Button } from '@/components/atoms/common/Button/Button';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import Header from '@/components/atoms/common/Header/Header';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useResetPWMutation } from '@/hooks/mutations/auth.mutation';
import { verifyAuthToken } from '@/services/auth.service';
import { getUserSetting, getUserLocale } from '@/services/profile.service';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import { GuestStackScreenProps } from '@/types/navigation';
import { resetPasswordSchema } from '@/util/schema/resetPasswordSchema';
import { addOrUpdateAccount, AuthState } from '@/util/storage';
import { PasswordEyeCloseIcon, PasswordEyeIcon } from '@/util/svg/icon.common';
import { yupResolver } from '@hookform/resolvers/yup';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ChangePassword: React.FC<GuestStackScreenProps<'ChangePassword'>> = ({
	navigation,
	route,
}) => {
	const { t } = useTranslation();
	const { setLanguage } = useLanguageStore();
	const [alertState, setAlert] = useState({
		isOpen: false,
		isSuccess: false,
		message: '',
	});
	const { reset_password_token, access_token } = route.params;
	const [pwVisibility, setPwVissibility] = useState({
		password: false,
		confirm_password: false,
	});
	const { colorScheme } = useColorScheme();
	const {
		setAuthState,
		setUserInfo,
		setUserOriginInstance,
		setSelectedTimeline,
		setHomeLayout,
	} = useAuthStoreAction();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(resetPasswordSchema(t)),
	});
	const { mutate, isPending } = useResetPWMutation({
		onSuccess: async resp => {
			const userInfo = await verifyAuthToken(
				access_token,
				process.env.API_URL ?? '',
			);

			setUserInfo(userInfo);
			setUserOriginInstance(process.env.API_URL ?? '');
			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: access_token },
			});

			// noted: for account switching flow
			const newAuthState: AuthState = {
				access_token: access_token,
				domain: process.env.API_URL ?? '',
				userInfo: {
					username: userInfo.username,
					displayName: userInfo.display_name,
					avatar: userInfo.avatar,
				},
			};
			await addOrUpdateAccount(newAuthState);

			const userSetting = await getUserSetting();
			if (userSetting) {
				setSelectedTimeline(userSetting.settings.user_timeline[0]);
				const layout = userSetting.settings.user_timeline?.[1] ?? 1;
				if (layout !== undefined) setHomeLayout(layout);
			}

			const userPrefs = await getUserLocale();
			if (userPrefs?.['posting:default:language']) {
				setLanguage(userPrefs['posting:default:language'] as ILanguage);
			}
		},
		onError: error => {
			setAlert({
				isOpen: true,
				isSuccess: false,
				message: error?.message || 'Something went wrong!',
			});
		},
	});

	const onSubmit = (data: any) => {
		if (!isPending) {
			mutate({
				reset_password_token,
				password: data.password,
				password_confirmation: data.confirmPassword,
			});
		}
	};

	return (
		<SafeScreen>
			<Header
				hideUnderline
				title={t('screen.reset_password')}
				leftCustomComponent={<BackButton />}
			/>
			<KeyboardAwareScrollView
				className="mx-8 pt-5"
				keyboardShouldPersistTaps={'handled'}
			>
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
				<Controller
					name="confirmPassword"
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								placeholder={t('login.confirm_password')}
								onChangeText={onChange}
								onBlur={onBlur}
								value={value}
								secureTextEntry={!pwVisibility.confirm_password}
								endIcon={
									<Pressable
										className="px-2 py-2 -mt-2 active:opacity-80"
										onPress={() =>
											setPwVissibility(prev => ({
												...prev,
												confirm_password: !prev.confirm_password,
											}))
										}
									>
										{pwVisibility.confirm_password ? (
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
							{errors.confirmPassword && (
								<ThemeText
									size="xs_12"
									variant={'textOrange'}
									className="-mt-2 mb-2"
								>
									{'*' + errors.confirmPassword.message}
								</ThemeText>
							)}
						</View>
					)}
				/>
				<Button onPress={handleSubmit(onSubmit)} className="h-[48] mt-3">
					{isPending ? (
						<Flow size={25} color={'#fff'} />
					) : (
						<ThemeText className="text-white dark:text-white">
							{t('common.update')}
						</ThemeText>
					)}
				</Button>
				<CustomAlert
					isVisible={alertState.isOpen}
					message={alertState.message}
					title={alertState.isSuccess ? t('common.success') : t('common.error')}
					extraTitleStyle="text-center text-white"
					extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
					handleCancel={() => {
						setAlert(prev => ({ ...prev, isOpen: false }));
					}}
					handleOk={() => {
						setAlert(prev => ({ ...prev, isOpen: false }));
					}}
					type={alertState.isSuccess ? 'success' : 'error'}
				/>
			</KeyboardAwareScrollView>
		</SafeScreen>
	);
};
export default ChangePassword;
