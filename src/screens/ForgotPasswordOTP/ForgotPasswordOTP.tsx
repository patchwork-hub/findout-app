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
	useForgotPWMutation,
	useOTPVerificationMutation,
} from '@/hooks/mutations/auth.mutation';
import Toast from 'react-native-toast-message';
import { Trans, useTranslation } from 'react-i18next';
import colors from 'tailwindcss/colors';

const ForgotPasswordOTP: React.FC<
	GuestStackScreenProps<'ForgotPasswordOTP'>
> = ({ navigation, route }) => {
	const { t, i18n } = useTranslation();
	const [activeStep, setActiveStep] = useState(1);
	const { email, reset_password_token } = route.params;
	const [currentSecretToken, setCurrentSecretToken] =
		useState(reset_password_token);
	const [timer, setTimer] = useState(60);
	const [code, setCode] = useState('');
	const ref = useBlurOnFulfill({ value: code, cellCount: 4 });
	const { colorScheme } = useColorScheme();
	const lineHeightStyle = i18n.language === 'my' ? { lineHeight: 32 } : {};

	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value: code,
		setValue: setCode,
	});

	const { mutate } = useOTPVerificationMutation({
		onSuccess: response => {
			navigation.navigate('ChangePassword', {
				reset_password_token: currentSecretToken,
				access_token: response.message.access_token,
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

	const { mutate: resendCode, isPending } = useForgotPWMutation({
		onSuccess: async response => {
			setCurrentSecretToken(response.reset_password_token);
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
				is_reset_password: true,
			});
		}
	}, [code]);

	const handleResendCode = () => {
		resendCode({ email });
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
			<View className="flex items-center  h-full ">
				<ThemeText className=" mb-2">{t('login.send_otp')}</ThemeText>
				<ThemeText className=" mb-4">{email}</ThemeText>
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
					<ThemeText className="mx-5">
						{t('login.otp_not_receive_advice', { time: timer })}
					</ThemeText>
				)}
				{timer == 0 && (
					<View className="flex-row items-center justify-center">
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

export default ForgotPasswordOTP;
