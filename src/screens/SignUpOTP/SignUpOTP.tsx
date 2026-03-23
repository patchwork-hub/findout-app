import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { GuestStackScreenProps } from '@/types/navigation';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {
	useOTPVerificationMutation,
	useRequestResendSignUpOTP,
} from '@/hooks/mutations/auth.mutation';
import Toast from 'react-native-toast-message';
import { saveAuthState } from '@/util/helper/helper';
import { verifyAuthToken } from '@/services/auth.service';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { DEFAULT_API_URL } from '@/util/constant';
import { Trans, useTranslation } from 'react-i18next';
import colors from 'tailwindcss/colors';
import { getUserSetting } from '@/services/profile.service';
import { addOrUpdateAccount, AuthState } from '@/util/storage';
import { useUpdateAltTextSetting } from '@/hooks/mutations/feed.mutation';

const SignUpOTP: React.FC<GuestStackScreenProps<'SignUpOTP'>> = ({
	navigation,
	route,
}) => {
	const { t } = useTranslation();
	const [activeStep, setActiveStep] = useState(1);
	const { email, signup_token } = route.params;
	const [currentSecretToken, setCurrentSecretToken] = useState(signup_token);
	const [timer, setTimer] = useState(60);
	const [code, setCode] = useState('');
	const ref = useBlurOnFulfill({ value: code, cellCount: 4 });
	const { colorScheme } = useColorScheme();
	const { setAuthState, setUserInfo, setSelectedTimeline } =
		useAuthStoreAction();

	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value: code,
		setValue: setCode,
	});

	const { mutate: updateAltTextSetting } = useUpdateAltTextSetting({});

	const { mutate } = useOTPVerificationMutation({
		onSuccess: async ({ message: response }) => {
			// await saveAuthState(
			// 	'AUTH_STATE',
			// 	JSON.stringify({
			// 		wordpress: {
			// 			token: '',
			// 			domain: process.env.WORDPRESS_API_URL,
			// 		},
			// 		mastodon: {
			// 			token: response.access_token,
			// 			domain: process.env.API_URL ?? DEFAULT_API_URL,
			// 		},
			// 	}),
			// );
			// const userInfo = await verifyAuthToken();
			const userInfo = await verifyAuthToken(
				response.access_token,
				process.env.API_URL ?? DEFAULT_API_URL,
			);
			setUserInfo(userInfo);

			// noted: for account switching flow
			const newAuthState: AuthState = {
				access_token: response.access_token,
				domain: process.env.API_URL ?? DEFAULT_API_URL,
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
			}

			setUserInfo(userInfo);

			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: response.access_token },
			});
			updateAltTextSetting({ enabled: true });
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e?.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { mutate: resendCode } = useRequestResendSignUpOTP({
		onSuccess: async response => {
			Toast.show({
				type: 'successToast',
				text1: t('toast.resend_otp'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e?.message || t('common.error'),
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

	useEffect(() => {
		if (code.length === 4) {
			mutate({
				id: currentSecretToken,
				otp_secret: code,
				is_reset_password: false,
			});
		}
	}, [code]);

	const handleResendCode = () => {
		setTimer(60);
		resendCode({ token: currentSecretToken });
	};

	const handleCodeChange = (text: string) => {
		const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
		setCode(cleaned);
	};

	return (
		<SafeScreen>
			<Header
				title={t('screen.email_verification')}
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
			<View className="flex items-center  h-full mx-4">
				<ThemeText className=" mb-2">{t('login.send_otp')}</ThemeText>
				<ThemeText className=" mb-4">{email}</ThemeText>
				<CodeField
					ref={ref}
					{...props}
					value={code}
					onChangeText={handleCodeChange}
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
					<ThemeText className="mx-3">
						{t('login.otp_not_receive_advice', { time: timer })}
					</ThemeText>
				)}
				{timer == 0 && (
					<View className="flex-row items-center justify-center">
						<ThemeText>
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
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	otpRoot: {
		display: 'flex',
		justifyContent: 'center',
		marginBottom: 20,
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

export default SignUpOTP;
