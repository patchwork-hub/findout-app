import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { SettingStackScreenProps } from '@/types/navigation';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

const PrivacySettingsScreen: React.FC<
	SettingStackScreenProps<'PrivacySettings'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

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
			</View>
		</SafeScreen>
	);
};

export default PrivacySettingsScreen;
