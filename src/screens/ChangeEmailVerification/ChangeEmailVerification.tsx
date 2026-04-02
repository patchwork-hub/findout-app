import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { SettingStackScreenProps } from '@/types/navigation';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {
	useChangeEmailMutation,
	useChangeEmailVerificationMutation,
	useChangeNewsmastEmailMutation,
	useChangeNewsmastEmailVerificationMutation,
} from '@/hooks/mutations/auth.mutation';
import Toast from 'react-native-toast-message';
import { handleError } from '@/util/helper/helper';
import { verifyAuthToken } from '@/services/auth.service';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';
import { NEWSMAST_INSTANCE_V1 } from '@/util/constant';
import { usePushNotiRevokeTokenMutation } from '@/hooks/mutations/pushNoti.mutation';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import { queryClient } from '@/App';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { Trans, useTranslation } from 'react-i18next';
import colors from 'tailwindcss/colors';
import {
	addOrUpdateAccount,
	AuthState,
	switchActiveAccount,
} from '@/util/storage';
import { ILanguage } from '@/store/feed/languageStore';

const ChangeEmailVerification: React.FC<
	SettingStackScreenProps<'ChangeEmailVerification'>
> = ({ navigation, route }) => {
	const { t, i18n } = useTranslation();
	const [activeStep, setActiveStep] = useState(1);
	const { userOriginInstance, userTheme } = useAuthStore();
	const { domain_name } = useActiveDomainStore();
	const { newAccessToken, oldEmail, currentPassword, newEmail } = route.params;
	const [currentSecretToken, setCurrentSecretToken] = useState(newAccessToken);
	const [timer, setTimer] = useState(60);
	const [code, setCode] = useState('');
	const ref = useBlurOnFulfill({ value: code, cellCount: 4 });
	const { colorScheme } = useColorScheme();
	const { setAuthState, setUserInfo, clearAuthState } = useAuthStoreAction();
	const { mutateAsync } = usePushNotiRevokeTokenMutation({});
	const fcmToken = usePushNoticationStore(state => state.fcmToken);
	const lineHeightStyle = i18n.language === 'my' ? { lineHeight: 32 } : {};

	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value: code,
		setValue: setCode,
	});

	const handleLogout = async () => {
		try {
			if (fcmToken) {
				await mutateAsync({
					notification_token: fcmToken,
				});
			}
		} catch (error) {
			handleError(error);
		} finally {
			await switchActiveAccount(null);
			clearAuthState();
			queryClient.clear();
			navigation.navigate('Welcome');
		}
	};

	// Noted by sev: to refactor later

	const { mutate } = useChangeEmailVerificationMutation({
		onSuccess: async response => {
			const userInfo = await verifyAuthToken(
				response.message.access_token,
				process.env.API_URL ?? '',
			);

			setUserInfo(userInfo);
			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: response.message.access_token },
			});

			// noted: for account switching flow
			const newAuthState: AuthState = {
				access_token: response.message.access_token,
				domain: process.env.API_URL ?? '',
				userInfo: {
					username: userInfo.username,
					displayName: userInfo.display_name,
					avatar: userInfo.avatar,
				},
				theme: userTheme,
				locale: i18n.language as ILanguage,
			};
			await addOrUpdateAccount(newAuthState);

			Toast.show({
				type: 'successToast',
				text1: t('toast.email_update_success'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			await handleLogout();
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { mutate: changeNewsmastEmailVerification } =
		useChangeNewsmastEmailVerificationMutation({
			onSuccess: () => {
				Toast.show({
					type: 'successToast',
					text1: t('toast.email_update_success'),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
					visibilityTime: 2000,
					onHide: async () => {
						await handleLogout();
					},
				});
			},
			onError: e => {
				Toast.show({
					type: 'errorToast',
					text1: e.message || t('common.error'),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
				});
			},
		});

	const { mutateAsync: resendCode } = useChangeEmailMutation({
		onSuccess: async response => {
			setCurrentSecretToken(response.message.access_token);
			Toast.show({
				type: 'successToast',
				text1: t('toast.resend_otp'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
		onError: () => {
			Toast.show({
				type: 'errorToast',
				text1: t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { mutateAsync: changeNewsmastEmail } = useChangeNewsmastEmailMutation({
		onSuccess: async (response, variables) => {
			Toast.show({
				type: 'successToast',
				text1: t('toast.send_verifcation_code'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
		onError: error => {
			Toast.show({
				type: 'errorToast',
				text1: error?.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer(timer - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const handleResendCode = () => {
		if (userOriginInstance === NEWSMAST_INSTANCE_V1) {
			changeNewsmastEmail({ email: newEmail!, domain_name: domain_name });
		} else {
			resendCode({ email: newEmail!, current_password: currentPassword! });
		}
	};

	useEffect(() => {
		if (userOriginInstance === NEWSMAST_INSTANCE_V1 && code.length === 4) {
			changeNewsmastEmailVerification({
				user_id: '',
				confirmed_otp_code: code,
			});
		} else if (userOriginInstance !== NEWSMAST_INSTANCE_V1) {
			if (code.length === 4 && currentSecretToken) {
				mutate({ id: currentSecretToken, otp_secret: code });
			}
		}
	}, [code, newAccessToken, userOriginInstance, NEWSMAST_INSTANCE_V1]);

	return (
		<SafeScreen>
			<Header
				title={t('screen.change_email_verification')}
				leftCustomComponent={
					<BackButton
						customOnPress={() => {
							if (activeStep > 1) {
								setActiveStep(activeStep - 1);
							} else navigation.goBack();
						}}
					/>
				}
			/>
			<View className="flex-1 mx-10 mt-3">
				<ThemeText variant={'textBold'} size={'md_16'}>
					{t('login.verify_your_email')}
				</ThemeText>
				<ThemeText className="my-2">
					{t('login.verification_otp_explanation')}
				</ThemeText>
				<ThemeText variant={'textPrimary'}>{oldEmail}</ThemeText>
				<CodeField
					ref={ref}
					{...props}
					value={code}
					onChangeText={setCode}
					cellCount={4}
					rootStyle={styles.otpRoot}
					keyboardType="number-pad"
					textContentType="oneTimeCode"
					renderCell={({ index, symbol, isFocused }) => (
						<View
							onLayout={getCellOnLayoutHandler(index)}
							key={index}
							style={[
								styles.otpCell,
								isFocused && styles.cellFocus,
								{
									backgroundColor:
										colorScheme === 'dark' ? '#828689' : '#F2F7FC',
									borderBottomColor:
										colorScheme === 'dark'
											? colors['gray'][50]
											: colors['gray'][600],
								},
							]}
						>
							<ThemeText>{symbol || (isFocused ? <Cursor /> : null)}</ThemeText>
						</View>
					)}
				/>
				{timer > 0 && (
					<ThemeText
						className="text-patchwork-primary dark:text-patchwork-primary-dark mx-5"
						size={'xs_12'}
					>
						{t('login.otp_not_receive_advice', { time: timer })}
					</ThemeText>
				)}
				{timer == 0 && (
					<ThemeText style={lineHeightStyle} className="mx-5">
						<Trans
							i18nKey="login.resend_code_prompt"
							components={{
								resend: (
									<ThemeText
										key={'resend'}
										onPress={handleResendCode}
										className="active:opacity-80 underline"
									/>
								),
							}}
						/>
					</ThemeText>
				)}
			</View>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	otpRoot: {
		display: 'flex',
		justifyContent: 'center',
		marginVertical: 30,
	},
	otpCell: {
		width: 60,
		height: 60,
		borderRadius: 5,
		marginHorizontal: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cellFocus: {
		borderBottomWidth: 2,
	},
});

export default ChangeEmailVerification;
