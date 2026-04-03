import { queryClient } from '@/App';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import Header from '@/components/atoms/common/Header/Header';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useAccounts } from '@/hooks/custom/useAccounts';
import useAuthRevalidationOnAppReturn from '@/hooks/custom/useAuthRevalidationOnAppReturn';
import { usePushNotiRevokeTokenMutation } from '@/hooks/mutations/pushNoti.mutation';
import { useShowMastodonInstance } from '@/hooks/queries/auth.queries';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { ILanguage } from '@/store/feed/languageStore';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import { SettingStackScreenProps } from '@/types/navigation';
import { CHANNEL_INSTANCE, DEFAULT_INSTANCE } from '@/util/constant';
import { handleError } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { AppIcons } from '@/util/icons/icon.common';
import { Logout } from '@/util/svg/icon.common';
import { Pressable, View, ScrollView } from 'react-native';
import VersionInfo from 'react-native-version-info';
import { useFocusEffect } from '@react-navigation/native';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import { SettingTCLinkKeys } from '@/util/constant/setting';
import {
	addOrUpdateAccount,
	AuthState,
	removeAccount,
	switchActiveAccount,
} from '@/util/storage';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
const ENABLED_INSTANCES = [DEFAULT_INSTANCE, CHANNEL_INSTANCE];

const Settings: React.FC<SettingStackScreenProps<'Settings'>> = ({
	navigation,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const [alertState, setAlert] = useState({
		message: '',
		isOpen: false,
		alertType: 'logout',
	});

	const { mutateAsync } = usePushNotiRevokeTokenMutation({});
	const { clearAuthState } = useAuthStoreAction();
	const fcmToken = usePushNoticationStore(state => state.fcmToken);
	const { mastodon, userOriginInstance, userInfo, userTheme } = useAuthStore();
	const { actions, domain_name } = useActiveDomainStore();
	const { fetchAccounts, activeAccId } = useAccounts();
	const isEnabledInstance = ENABLED_INSTANCES.includes(userOriginInstance);

	const { refetch: refetchCustomMenuDisplay } = useShowMastodonInstance();

	useAuthRevalidationOnAppReturn(
		useCallback(() => {
			clearAuthState();
			queryClient.clear();
		}, [clearAuthState]),
	);

	useFocusEffect(
		useCallback(() => {
			if (domain_name !== userOriginInstance) {
				actions.setDomain(process.env.API_URL!);
			}
		}, [domain_name, userOriginInstance, actions]),
	);

	const handleOpenPolicy = (pathUrl: string, customTitle: string) => {
		navigation.navigate('WebViewer', {
			url: pathUrl,
			customTitle,
		});
	};

	const handleClearAuthonLogout = async () => {
		if (activeAccId) {
			await removeAccount(activeAccId);
		}
		await switchActiveAccount(null);
		fetchAccounts();
		clearAuthState();
		queryClient.clear();
	};

	const handleClearAuth = async () => {
		clearAuthState();
		queryClient.clear();
	};

	const handleLogout = async () => {
		setAlert(prev => ({ ...prev, isOpen: false }));
		try {
			if (fcmToken) {
				await mutateAsync({
					notification_token: fcmToken,
				});
			}
			// noted: update the current user theme and language before logout
			if (userInfo && mastodon.token) {
				const updatedAuthState: AuthState = {
					access_token: mastodon.token,
					domain: userOriginInstance,
					userInfo: {
						username: userInfo.username,
						displayName: userInfo.display_name,
						avatar: userInfo.avatar,
					},
					theme: userTheme,
					locale: i18n.language as ILanguage,
				};
				await addOrUpdateAccount(updatedAuthState);
			}
		} catch (error) {
			handleError(error);
		} finally {
			if (mastodon.token) {
				await handleClearAuthonLogout();
			}
		}
	};

	useAuthRevalidationOnAppReturn(handleClearAuth);

	return (
		<SafeScreen>
			<Header
				title={t('screen.profile_setting')}
				leftCustomComponent={<BackButton />}
			/>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, marginVertical: 10 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="flex-1 mx-4 mt-2">
					{isEnabledInstance && (
						<SettingSection
							title={t('setting.account_settings')}
							icon={AppIcons.profileSettings}
							colorScheme={colorScheme}
							sectionKey="account"
							onPress={() => navigation.navigate('AccountSettings')}
							mt="0"
						/>
					)}
					<SettingSection
						title={t('setting.notification_settings', 'Notification settings')}
						icon={AppIcons.notiSolid}
						colorScheme={colorScheme}
						sectionKey="notifications"
						onPress={() => navigation.navigate('NotificationSettings')}
					/>
					<SettingSection
						title={t('setting.timeline_feed', 'Timeline & Feed')}
						icon={AppIcons.timeline}
						colorScheme={colorScheme}
						sectionKey="feed"
						onPress={() => navigation.navigate('FeedSettings')}
					/>
					<SettingSection
						title={t('setting.privacy_safety', 'Privacy & safety')}
						icon={AppIcons.privacy}
						colorScheme={colorScheme}
						sectionKey="privacy"
						onPress={() => navigation.navigate('PrivacySettings')}
					/>
					<SettingSection
						title={t('setting.personalization', 'Personalization')}
						icon={AppIcons.personalization}
						colorScheme={colorScheme}
						sectionKey="personalization"
						onPress={() => navigation.navigate('PersonalizationSettings')}
					/>
					{[DEFAULT_INSTANCE].includes(userOriginInstance) && (
						<SettingSection
							title={t('setting.account_management', 'Account management')}
							icon={AppIcons.accountManagement}
							iconSize={22}
							colorScheme={colorScheme}
							sectionKey="management"
							onPress={() => navigation.navigate('AccountManagement')}
						/>
					)}
				</View>

				<View className="justify-center items-center mt-10 mb-8 mx-8 bottom-0">
					<View className={cn('flex-row flex-wrap justify-center my-4')}>
						{SettingTCLinkKeys.map((item, index, arr) => (
							<ThemeText
								key={index}
								className={cn(
									'my-1 active:opacity-80 text-patchwork-primary dark:text-white',
									index < arr.length - 1 && 'mr-1',
								)}
								size={'xs_12'}
								numberOfLines={1}
								ellipsizeMode="tail"
								onPress={() => handleOpenPolicy(item.path, t(item.titleKey))}
							>
								{t(item.textKey)}
								{index < arr.length - 1 && ','}{' '}
							</ThemeText>
						))}
					</View>

					<ThemeText className="mb-4" size={'xs_12'}>
						v.
						{VersionInfo.appVersion || '1.0.0'}
					</ThemeText>

					<Pressable
						onPress={() => {
							setAlert({
								isOpen: true,
								message: t('setting.logout_confirmation'),
								alertType: 'logout',
							});
							refetchCustomMenuDisplay();
						}}
						className="flex-row w- border w-full md:w-[300] border-gray-500 rounded-md py-4 justify-center items-center active:opacity-80"
					>
						<Logout
							width={25}
							height={25}
							className="mr-3"
							{...{ colorScheme }}
						/>
						<ThemeText className="text-center">
							{t('setting.log_out')}
						</ThemeText>
					</Pressable>
				</View>
			</ScrollView>
			<CustomAlert
				isVisible={alertState.isOpen}
				message={alertState.message}
				hasCancel
				handleCancel={() => {
					setAlert(prev => ({ ...prev, isOpen: false }));
				}}
				confirmBtnText={t('common.confirm')}
				handleOk={handleLogout}
				extraOkBtnStyle="text-patchwork-red-50"
				type="error"
			/>
		</SafeScreen>
	);
};

export default Settings;
