import BackButton from '@/components/atoms/common/BackButton/BackButton';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import AccountSwitchingModal from '@/components/organisms/switchingAccounts/AccountSwitchingModal/AccountSwitchingModal';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { SettingStackScreenProps } from '@/types/navigation';
import { DEFAULT_INSTANCE } from '@/util/constant';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';

const AccountManagementScreen: React.FC<
	SettingStackScreenProps<'AccountManagement'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const [alertOpen, setAlertOpen] = useState(false);
	const { colorScheme } = useColorScheme();

	const handleOpenAdvancedSettings = () => {
		Linking.openURL(`${DEFAULT_INSTANCE}/settings/profile`).catch(err =>
			console.error('Failed to open URL:', err),
		);
	};

	const handleDeleteAccount = () => {
		navigation.navigate('DeleteAccount');
	};

	return (
		<SafeScreen>
			<Header
				title={t('setting.account_management', 'Account management')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4">
				<AccountSwitchingModal />
				<SettingSection
					sectionKey="advanced_settings"
					colorScheme={colorScheme!}
					icon={AppIcons.setting}
					title={t('setting.advanced_settings')}
					onPress={handleOpenAdvancedSettings}
				/>
				<SettingSection
					sectionKey="delete_account"
					colorScheme={colorScheme!}
					icon={AppIcons.delete}
					title={t('setting.delete_account')}
					onPress={handleDeleteAccount}
				/>
			</View>
			<CustomAlert
				isVisible={alertOpen}
				message={t('setting.delete_confirmation')}
				hasCancel
				handleCancel={() => setAlertOpen(false)}
				confirmBtnText={t('common.confirm')}
				handleOk={() => {
					Linking.openURL(`${DEFAULT_INSTANCE}/settings/delete`).catch(err =>
						console.error('Failed to open URL:', err),
					);
					setAlertOpen(false);
				}}
				extraOkBtnStyle="text-patchwork-red-50"
				type="error"
			/>
		</SafeScreen>
	);
};

export default AccountManagementScreen;
