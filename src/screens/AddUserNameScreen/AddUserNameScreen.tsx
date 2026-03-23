import { View, Pressable, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Trans, useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { Flow } from 'react-native-animated-spinkit';

import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { Button } from '@/components/atoms/common/Button/Button';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import { GuestStackParamList } from '@/types/navigation';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';

import { useBristolCableSignInMutation } from '@/hooks/mutations/auth.mutation';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { generateSuggestions, saveAuthState } from '@/util/helper/helper';
import { verifyAuthToken } from '@/services/auth.service';
import { getUserSetting, getUserLocale } from '@/services/profile.service';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import { PasswordEyeCloseIcon, PasswordEyeIcon } from '@/util/svg/icon.common';
import Checkbox from '@/components/atoms/common/Checkbox/Checkbox';
import i18n from '@/i18n';
import { StackNavigationProp } from '@react-navigation/stack';
import {
	addOrUpdateAccount,
	AuthState,
	getAccountId,
	switchActiveAccount,
} from '@/util/storage';

const getUsernameSchema = (t: any) =>
	yup.object().shape({
		username: yup
			.string()
			.required(t('validation.username_required'))
			.min(3, t('validation.username_min'))
			.max(20, t('validation.username_max'))
			.matches(/^[a-zA-Z0-9_]+$/, t('validation.username_pattern')),
	});

const AddUserNameScreen = () => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const route = useRoute<RouteProp<GuestStackParamList, 'AddUserNameScreen'>>();
	const { email, password, firstName, lastName } = route.params;

	const { setAuthState, setUserInfo, setSelectedTimeline } =
		useAuthStoreAction();
	const { setLanguage } = useLanguageStore();

	const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
		null,
	);
	const [alertState, setAlert] = useState({ message: '', isOpen: false });

	const [isAgreeToTerms, setIsAgreeToTerms] = useState(false);
	const [shouldShake, setShouldShake] = useState(false);
	const navigation = useNavigation<StackNavigationProp<GuestStackParamList>>();

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(getUsernameSchema(t)),
		defaultValues: { username: '' },
	});

	const suggestions = useMemo(
		() => generateSuggestions(firstName, lastName),
		[firstName, lastName],
	);

	const { mutate: bristolCableSignIn, isPending } =
		useBristolCableSignInMutation({
			onSuccess: async response => {
				const userInfo = await verifyAuthToken(
					response.access_token,
					process.env.API_URL ?? '',
				);
				const newAuthState: AuthState = {
					access_token: response.access_token,
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

				const userSetting = await getUserSetting();
				if (userSetting) {
					setSelectedTimeline(userSetting.settings?.user_timeline[0]);
				}

				const userPrefs = await getUserLocale();
				if (userPrefs?.['posting:default:language']) {
					setLanguage(userPrefs['posting:default:language'] as ILanguage);
				}
				setAuthState({
					wordpress: { token: '' },
					mastodon: { token: response.access_token },
				});
				setUserInfo(userInfo);
			},
			onError: (error: any) => {
				setAlert({
					message:
						error?.message || 'That username is taken. Please try another.',
					isOpen: true,
				});
			},
		});

	const handleSuggestionPress = (suggestion: string) => {
		setValue('username', suggestion, { shouldValidate: true });
		setSelectedSuggestion(suggestion);
	};

	const onSubmit = (data: { username: string }) => {
		if (!isAgreeToTerms) {
			setShouldShake(true);
			setTimeout(() => setShouldShake(false), 500);
			return;
		}
		if (!isPending) {
			bristolCableSignIn({
				username: data.username,
				email,
				password,
			});
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('screen.add_user_name')}
				leftCustomComponent={<BackButton />}
			/>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
				className="px-4 pt-6"
			>
				<View className={cn(isTablet ? 'w-[60%] self-center' : '')}>
					<ThemeText size="lg_18" className="text-center mb-2">
						Welcome, Bristol Cable member!
					</ThemeText>
					<ThemeText className="text-center text-gray-600 dark:text-gray-400 mb-8">
						Please choose desired username to create your account.
					</ThemeText>

					{firstName && lastName && (
						<ThemeText className="mb-3">Here are some suggestions:</ThemeText>
					)}
					<View
						className={cn(
							'flex flex-row flex-wrap gap-3',
							firstName && lastName ? 'mb-8' : 'mb-2',
						)}
					>
						{suggestions.map((suggestion, index) => (
							<Pressable
								key={index}
								onPress={() => handleSuggestionPress(suggestion)}
								className={cn(
									'px-4 py-2 rounded-full border',
									selectedSuggestion === suggestion
										? 'bg-patchwork-primary border-patchwork-primary'
										: 'bg-gray-100 dark:bg-patchwork-dark-50 border-gray-300 dark:border-patchwork-dark-50',
								)}
							>
								<ThemeText
									className={cn(
										selectedSuggestion === suggestion
											? 'text-white'
											: 'text-primary',
									)}
								>
									{suggestion}
								</ThemeText>
							</Pressable>
						))}
					</View>

					<Controller
						name="username"
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<View className="mb-4">
								<TextInput
									placeholder="Username"
									onChangeText={text => {
										onChange(text);
										if (selectedSuggestion) setSelectedSuggestion(null);
									}}
									onBlur={onBlur}
									maxLength={20}
									endIcon={
										<ThemeText className="text-xs text-gray-400">
											@thebristolcable.social
										</ThemeText>
									}
									extraInputStyle={'text-md'}
									value={value}
									autoCapitalize="none"
									autoCorrect={false}
								/>
								{errors.username && (
									<ThemeText
										size="xs_12"
										variant={'textOrange'}
										className="mt-1"
									>
										{'*' + errors.username.message}
									</ThemeText>
								)}
							</View>
						)}
					/>

					<Checkbox
						isChecked={isAgreeToTerms}
						handleOnCheck={() => {
							setIsAgreeToTerms(!isAgreeToTerms);
						}}
						shouldShake={shouldShake}
					>
						<ThemeText className="ml-2">
							<Trans
								i18nKey="login.agree_text"
								components={{
									tc: (
										<ThemeText
											key={'tc'}
											onPress={() => {
												navigation.navigate('WebViewer', {
													url: 'https://thebristolcable.org/terms/',
													customTitle: 'Terms & Conditions',
												});
											}}
											className="active:opacity-80 underline"
										/>
									),
								}}
							/>
						</ThemeText>
					</Checkbox>

					<Button onPress={handleSubmit(onSubmit)} className="my-8 h-[48] ">
						{isPending ? (
							<Flow size={25} color={colorScheme == 'dark' ? '#000' : '#fff'} />
						) : (
							<ThemeText className="text-white dark:text-white">
								{t('common.continue')}
							</ThemeText>
						)}
					</Button>
				</View>
			</ScrollView>
			<CustomAlert
				isVisible={alertState.isOpen}
				message={alertState.message}
				title={t('common.error')}
				handleOk={() => setAlert({ isOpen: false, message: '' })}
				type="error"
			/>
		</SafeScreen>
	);
};

export default AddUserNameScreen;
