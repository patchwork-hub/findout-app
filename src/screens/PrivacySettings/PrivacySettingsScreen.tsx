import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { SettingStackScreenProps } from '@/types/navigation';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { SettingToggleItem } from '@/components/molecules/settings/SettingToggleItem/SettingToggleItem';
import { handleError } from '@/util/helper/helper';
import { useProfileMutation } from '@/hooks/mutations/profile.mutation';
import { useState } from 'react';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';

const PrivacySettingsScreen: React.FC<
	SettingStackScreenProps<'PrivacySettings'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	const { userInfo } = useAuthStore();
	const { setUserInfo } = useAuthStoreAction();

	const [isUpdatingLock, setIsUpdatingLock] = useState(false);

	const { mutateAsync: updateProfileMutation } = useProfileMutation({
		onError: error => {
			handleError(error);
		},
	});

	const handleToggleAccountLock = async (value: boolean) => {
		setIsUpdatingLock(true);
		try {
			const updatedAccount = await updateProfileMutation({ locked: value });
			setUserInfo(updatedAccount);
		} catch (error) {
			handleError(error);
		} finally {
			setIsUpdatingLock(false);
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('setting.privacy_safety', 'Privacy & safety')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4 mt-2">
				<SettingSection
					sectionKey="mute_and_block"
					colorScheme={colorScheme!}
					icon={AppIcons.block}
					title={t('setting.mute_and_block')}
					onPress={() => navigation.navigate('MuteAndBlockList')}
				/>
				<SettingToggleItem
					icon={AppIcons.userClock}
					text={t('setting.require_follow_approval')}
					isEnabled={userInfo?.locked ?? false}
					onToggle={handleToggleAccountLock}
					isLoading={isUpdatingLock}
				/>
			</View>
		</SafeScreen>
	);
};

export default PrivacySettingsScreen;
