import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { SettingStackScreenProps } from '@/types/navigation';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useAuthStore } from '@/store/auth/authStore';
import { useColorScheme } from 'nativewind';

const AccountSettingsScreen: React.FC<
	SettingStackScreenProps<'AccountSettings'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const { userInfo } = useAuthStore();
	const { colorScheme } = useColorScheme();

	const email = userInfo?.source?.email;

	return (
		<SafeScreen>
			<Header
				title={t('setting.account_settings')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4 mt-2">
				<SettingSection
					sectionKey="change_email"
					colorScheme={colorScheme!}
					icon={AppIcons.email}
					title={t('screen.change_email')}
					onPress={() =>
						navigation.navigate('ChangeEmail', { oldEmail: email! })
					}
				/>
				<SettingSection
					sectionKey="change_password"
					colorScheme={colorScheme!}
					icon={AppIcons.lock}
					title={t('setting.change_password')}
					onPress={() => navigation.navigate('UpdatePassword')}
				/>
			</View>
		</SafeScreen>
	);
};

export default AccountSettingsScreen;
