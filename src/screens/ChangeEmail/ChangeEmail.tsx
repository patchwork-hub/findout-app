import BackButton from '@/components/atoms/common/BackButton/BackButton';
import { Button } from '@/components/atoms/common/Button/Button';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import Header from '@/components/atoms/common/Header/Header';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import {
	useChangeEmailMutation,
	useChangeNewsmastEmailMutation,
} from '@/hooks/mutations/auth.mutation';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { SettingStackScreenProps } from '@/types/navigation';
import { NEWSMAST_INSTANCE_V1 } from '@/util/constant';
import { isTablet } from '@/util/helper/isTablet';
import { cn } from '@/util/helper/twutil';
import { getEmailUpdateSchema } from '@/util/schema/emailUpdateSchema';
import { PasswordEyeCloseIcon, PasswordEyeIcon } from '@/util/svg/icon.common';
import { yupResolver } from '@hookform/resolvers/yup';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import * as yup from 'yup';

const ChangeEmail: React.FC<SettingStackScreenProps<'ChangeEmail'>> = ({
	navigation,
	route,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { oldEmail } = route.params;
	const { userOriginInstance } = useAuthStore();
	const { domain_name } = useActiveDomainStore();
	const [pswVisibility, setPswVisibility] = useState({
		password: false,
	});
	const [alertState, setAlert] = useState({
		message: '',
		isOpen: false,
		isErrorAlert: false,
	});

	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({
		resolver: yupResolver(getEmailUpdateSchema(t)),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useChangeEmailMutation({
		onSuccess: async (response, variables) => {
			navigation.navigate('ChangeEmailVerification', {
				newAccessToken: response.message.access_token,
				oldEmail: oldEmail,
				newEmail: variables.email,
				currentPassword: variables.current_password,
			});
		},
		onError: error => {
			return setAlert({
				message: error?.message || 'Something went wrong.',
				isErrorAlert: true,
				isOpen: true,
			});
		},
	});

	const { mutateAsync: changeNewsmastEmail } = useChangeNewsmastEmailMutation({
		onSuccess: async (response, variables) => {
			navigation.navigate('ChangeEmailVerification', {
				newEmail: variables.email,
				oldEmail: oldEmail,
			});
		},
		onError: error => {
			return setAlert({
				message: error?.message || 'Something went wrong.',
				isErrorAlert: true,
				isOpen: true,
			});
		},
	});

	const onSubmit = (data: any) => {
		if (userOriginInstance === NEWSMAST_INSTANCE_V1) {
			changeNewsmastEmail({ email: data.email, domain_name: domain_name });
		} else {
			if (!isPending) {
				mutateAsync({ email: data.email, current_password: data.password });
			}
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('screen.change_email')}
				leftCustomComponent={<BackButton />}
			/>
			<View
				className={cn(
					'flex-1 px-5 mt-4',
					isTablet ? 'w-[50%] self-center' : '',
				)}
			>
				<ThemeText className="mb-2 ml-1.5">Current email address</ThemeText>
				<View className="mb-6 p-3 px-4 bg-patchwork-light-100 dark:bg-patchwork-dark-50 rounded-xl border border-gray-200 dark:border-gray-700">
					<ThemeText
						className="text-patchwork-grey-70 dark:text-patchwork-dark-50"
						size="md_16"
					>
						{oldEmail}
					</ThemeText>
				</View>

				<Controller
					name="email"
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								placeholder={t('login.new_email_address')}
								onChangeText={onChange}
								value={value}
								onBlur={onBlur}
								maxLength={40}
								inputMode="email"
								extraContainerStyle="mb-6"
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
								placeholder={t('login.current_password')}
								onChangeText={onChange}
								onBlur={onBlur}
								value={value}
								secureTextEntry={!pswVisibility.password}
								endIcon={
									<Pressable
										className="px-2 py-2 -mt-2 active:opacity-80"
										onPress={() =>
											setPswVisibility(prev => ({
												...prev,
												password: !prev.password,
											}))
										}
									>
										{pswVisibility.password ? (
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
				<Button
					// disabled={!isValid}
					onPress={handleSubmit(onSubmit)}
					className="h-[48] w-full my-3"
				>
					{isPending ? (
						<Flow size={25} color={'#fff'} />
					) : (
						<ThemeText className="text-white dark:text-white">
							{t('common.confirm')}
						</ThemeText>
					)}
				</Button>
			</View>
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
				type="error"
			/>
		</SafeScreen>
	);
};

export default ChangeEmail;
