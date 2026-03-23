import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, Pressable, View } from 'react-native';
import {
	BottomSheetModal,
	BottomSheetFlatList,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import colors from 'tailwindcss/colors';
import {
	addOrUpdateAccount,
	AuthState,
	removeAccount,
	switchActiveAccount,
} from '@/util/storage';
import {
	removeHttps,
	setThemeToStorage,
	ThemeValue,
} from '@/util/helper/helper';
import { queryClient } from '@/App';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';
import { verifyAuthToken } from '@/services/auth.service';
import { ILanguage, useLanguageStore } from '@/store/feed/languageStore';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import { Button } from '@/components/atoms/common/Button/Button';
import AccountSwitchingListItem from '@/components/molecules/switchingAccounts/AccountSwitchingListItem/AccountSwitchingListItem';
import AccountAvatarRow from '@/components/molecules/switchingAccounts/AccountAvatarRow/AccountAvatarRow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import Image from '@/components/atoms/common/Image/Image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import { usePushNotiRevokeTokenMutation } from '@/hooks/mutations/pushNoti.mutation';
import { DEFAULT_INSTANCE } from '@/util/constant';
import { useAccountsStore } from '@/store/auth/accountsStore';
import { useAccounts } from '@/hooks/custom/useAccounts';
import customColor from '@/util/constant/color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
	isWelcome?: boolean;
};

const AccountSwitchingModal = ({ isWelcome = false }: Props) => {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ['75%'], []);
	const { bottom } = useSafeAreaInsets();
	const { i18n, t } = useTranslation();
	const { colorScheme, setColorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const fcmToken = usePushNoticationStore(state => state.fcmToken);

	const [alertState, setAlert] = useState({
		message: '',
		isOpen: false,
		accId: '',
	});
	const [isEditMode, setIsEditMode] = useState(false);

	const { setLanguage } = useLanguageStore();
	const { accounts, activeAccId, fetchAccounts } = useAccounts();

	const {
		setAuthState,
		setUserInfo,
		setUserOriginInstance,
		clearAuthState,
		setIsHydrating,
		setUserTheme,
	} = useAuthStoreAction();
	const {
		userInfo: currentUserInfo,
		userOriginInstance: currentUserInstance,
		userTheme: currentUserTheme,
		mastodon,
		isHydrating,
	} = useAuthStore();

	const { setOpenAccSwitcher } = useAccountsStore();

	const currentAccessToken = mastodon.token;

	const { mutateAsync: revokePushNotiToken } = usePushNotiRevokeTokenMutation(
		{},
	);

	useEffect(() => {
		fetchAccounts();
	}, []);

	// to update the active account info in case user changes its info by editing
	useEffect(() => {
		if (!currentUserInfo || !currentUserInstance) return;

		const prevAccount = accounts.find(
			acc =>
				acc.userInfo.username === currentUserInfo.username &&
				acc.domain === currentUserInstance,
		);
		if (!prevAccount) return;

		if (
			prevAccount.userInfo.displayName !== currentUserInfo.display_name ||
			prevAccount.userInfo.avatar !== currentUserInfo.avatar
		) {
			const updatedAuthState: AuthState = {
				access_token: currentAccessToken!,
				domain: currentUserInstance,
				userInfo: {
					username: currentUserInfo.username,
					displayName: currentUserInfo.display_name,
					avatar: currentUserInfo.avatar,
				},
				theme: currentUserTheme,
				locale: i18n.language as ILanguage,
			};
			addOrUpdateAccount(updatedAuthState, true).then(() => fetchAccounts());
		}
	}, [currentUserInfo, currentUserInstance, currentUserTheme, accounts]);

	useEffect(() => {
		const openModalFn = () => {
			if (bottomSheetModalRef.current) {
				bottomSheetModalRef.current.present();
			}
		};

		setOpenAccSwitcher(openModalFn);

		return () => {
			setOpenAccSwitcher(null);
		};
	}, [setOpenAccSwitcher]);

	const retrieveToken = async (newAcc: AuthState) => {
		const { access_token, domain } = newAcc;

		try {
			const userInfo = await verifyAuthToken(access_token, domain);
			setUserInfo(userInfo);
			setUserOriginInstance(domain);

			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: userInfo ? access_token : '' },
			});

			setLanguage(newAcc.locale ?? 'fr');
			i18n.changeLanguage(newAcc.locale ?? 'fr');

			const savedTheme = newAcc.theme ?? 'light';
			if (savedTheme) {
				setColorScheme(savedTheme);
				setThemeToStorage(savedTheme);
				setUserTheme(savedTheme);
			} else {
				const systemTheme = Appearance.getColorScheme() as ThemeValue;
				setColorScheme(systemTheme);
				setThemeToStorage(systemTheme);
				setUserTheme(systemTheme);
			}
		} catch {
			Toast.show({
				type: 'error',
				text1: 'Account Switch Failed',
				text2: isWelcome
					? 'Session expired. Please sign in again.'
					: 'Session expired. Switched back to your previous account.',
				visibilityTime: 5000,
			});

			if (!isWelcome) {
				handleFallback();
			}
		} finally {
			setIsHydrating(false);
		}
	};

	const handleFallback = async () => {
		if (currentUserInfo && currentAccessToken) {
			const updatedAuthState: AuthState = {
				access_token: currentAccessToken,
				domain: currentUserInstance,
				userInfo: {
					username: currentUserInfo.username,
					displayName: currentUserInfo.display_name,
					avatar: currentUserInfo.avatar,
				},
				theme: currentUserTheme,
				locale: i18n.language as ILanguage,
			};
			await addOrUpdateAccount(updatedAuthState);

			const userInfo = await verifyAuthToken(
				currentAccessToken,
				currentUserInstance,
			);

			setUserInfo(userInfo);
			setUserOriginInstance(currentUserInstance);

			setAuthState({
				wordpress: { token: '' },
				mastodon: { token: currentAccessToken },
			});

			setLanguage((i18n.language as ILanguage) ?? 'fr');
			i18n.changeLanguage((i18n.language as ILanguage) ?? 'fr');

			const savedTheme = currentUserTheme ?? 'light';
			if (savedTheme) {
				setColorScheme(savedTheme);
				setThemeToStorage(savedTheme);
				setUserTheme(savedTheme);
			} else {
				const systemTheme = Appearance.getColorScheme() as ThemeValue;
				setColorScheme(systemTheme);
				setThemeToStorage(systemTheme);
				setUserTheme(systemTheme);
			}
		}
	};

	const handleAccountSwitch = async (acc: AuthState) => {
		try {
			setIsHydrating(true);
			bottomSheetModalRef.current?.dismiss();

			// noted: revoke the old acc's noti token
			if (
				fcmToken &&
				currentAccessToken &&
				currentUserInstance == DEFAULT_INSTANCE
			) {
				await revokePushNotiToken({
					notification_token: fcmToken,
				});
			}

			// noted: update the current user theme and language before switching
			if (currentUserInfo && currentAccessToken) {
				const updatedAuthState: AuthState = {
					access_token: currentAccessToken,
					domain: currentUserInstance,
					userInfo: {
						username: currentUserInfo.username,
						displayName: currentUserInfo.display_name,
						avatar: currentUserInfo.avatar,
					},
					theme: currentUserTheme,
					locale: i18n.language as ILanguage,
				};
				await addOrUpdateAccount(updatedAuthState);
			}

			// noted: clearing the current auth state and query cache
			// clearAuthState();
			queryClient.clear();

			// noted: switching to new account
			const accId = `${acc.userInfo.username}@${removeHttps(acc.domain)}`;
			await switchActiveAccount(accId);
			await fetchAccounts();
			await retrieveToken(acc);
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: 'Account Switch Failed',
				text2: err.message ?? 'Failed to switch account. Please try again.',
			});
		} finally {
			setIsHydrating(false);
		}
	};

	const onPressRemoveBtn = async (accId: string) => {
		setAlert({
			isOpen: true,
			message: t('setting.switch_account.remove_account_confirmation', {
				accId,
			}),
			accId,
		});
	};

	const handleRemoveAccount = async (accId: string) => {
		try {
			await removeAccount(accId);
			await fetchAccounts();
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: t('setting.switch_account.remove_account_failed'),
				text2:
					err.message ??
					t('setting.switch_account.remove_account_failed_message'),
			});
		}
	};

	const handlePresentModalPress = useCallback(() => {
		setIsEditMode(false);
		setTimeout(() => {
			if (bottomSheetModalRef.current) {
				bottomSheetModalRef.current.present();
			}
		}, 200);
	}, []);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
			/>
		),
		[],
	);

	return (
		<View>
			{isWelcome ? (
				<AccountAvatarRow
					accounts={accounts}
					onPressAdd={handlePresentModalPress}
				/>
			) : (
				<Pressable
					className="py-2.5 pt-3 px-2 pl-3 my-1 flex-row items-center justify-between active:opacity-80"
					onPress={handlePresentModalPress}
				>
					<View className="flex-row items-center">
						<View className="w-8 items-center mr-1.5">
							<FontAwesomeIcon
								icon={AppIcons.users}
								size={20}
								color={
									colorScheme === 'dark'
										? customColor['patchwork-light-50']
										: customColor['patchwork-dark-50']
								}
							/>
						</View>
						<ThemeText size={'sm_14'}>
							{t('setting.switch_account.title')}
						</ThemeText>
					</View>

					<Image
						uri={currentUserInfo?.avatar}
						resizeMode={'cover'}
						className="w-[30] h-[30] bg-patchwork-dark-50 rounded-full mr-1"
						iconSize={30}
					/>
				</Pressable>
			)}
			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={0}
				snapPoints={snapPoints}
				handleIndicatorStyle={{
					backgroundColor: colors.zinc[200],
				}}
				backgroundStyle={{
					backgroundColor: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
				}}
				backdropComponent={renderBackdrop}
			>
				<BottomSheetFlatList
					data={accounts}
					keyExtractor={(i: AuthState) => `@${i.userInfo.username}@${i.domain}`}
					renderItem={({ item }: { item: AuthState }) => (
						<AccountSwitchingListItem
							account={item}
							activeAccId={activeAccId}
							isEditMode={isEditMode}
							isHydrating={isHydrating}
							onSwitch={handleAccountSwitch}
							onRemove={accId => {
								if (isWelcome) {
									return;
								}
								onPressRemoveBtn(accId);
							}}
						/>
					)}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: (bottom || 20) + 80,
					}}
					ListHeaderComponent={
						<View className="flex-row justify-between items-center my-2 pb-3 mx-3">
							<ThemeText size="xl_20" className="font-NewsCycle_Bold">
								{t('setting.switch_account.accounts')}
							</ThemeText>
							{!isWelcome && (
								<Button
									variant="outline"
									size={'sm'}
									className="rounded-full"
									onPress={() => setIsEditMode(prev => !prev)}
								>
									<ThemeText size="fs_13">
										{isEditMode ? t('common.done') : t('common.remove')}
									</ThemeText>
								</Button>
							)}
						</View>
					}
					ListFooterComponent={
						<View className="">
							{!isWelcome && (
								<Pressable
									className="flex-row items-center mx-2  px-4 py-3 rounded-lg active:bg-slate-200 dark:active:bg-gray-600/50"
									onPress={() => {
										bottomSheetModalRef.current?.dismiss();
										navigation.navigate('SettingStack', {
											screen: 'LoginAnotherAccount',
										});
									}}
								>
									<FontAwesomeIcon
										icon={AppIcons.addUser}
										size={40}
										color={colorScheme == 'dark' ? '#fff' : '#000'}
									/>
									<ThemeText className="ml-3">
										{t('setting.switch_account.add_another_account')}
									</ThemeText>
								</Pressable>
							)}
						</View>
					}
					ListEmptyComponent={
						<View className="h-40 items-center justify-center py-10">
							<FontAwesomeIcon
								icon={AppIcons.users}
								size={35}
								color={colorScheme == 'dark' ? '#fff' : '#000'}
							/>
							<ThemeText className="text-gray-400 text-center mt-2">
								{t('setting.switch_account.no_accounts_yet')}
							</ThemeText>
						</View>
					}
				/>
			</BottomSheetModal>
			{alertState.isOpen && (
				<CustomAlert
					isVisible={true}
					hasCancel
					extraTitleStyle="text-white text-center -ml-2"
					extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
					message={alertState.message}
					title={t('setting.switch_account.remove_account_title')}
					handleCancel={() =>
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}))
					}
					handleOk={() => {
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}));
						handleRemoveAccount(alertState.accId);
					}}
					type="error"
				/>
			)}
		</View>
	);
};

export default AccountSwitchingModal;
