import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import { SettingToggleItem } from '@/components/molecules/settings/SettingToggleItem/SettingToggleItem';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useUpdateAltTextSetting } from '@/hooks/mutations/feed.mutation';
import { useGetAltTextSetting } from '@/hooks/queries/feed.queries';
import { useAuthStore } from '@/store/auth/authStore';
import { updateAltTextSettingCache } from '@/util/cache/channel/channelCache';
import { DEFAULT_INSTANCE } from '@/util/constant';
import { SettingStackScreenProps } from '@/types/navigation';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

const PersonalizationSettingsScreen: React.FC<
	SettingStackScreenProps<'PersonalizationSettings'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const { userOriginInstance } = useAuthStore();
	const { colorScheme } = useColorScheme();

	const { data: altTextSetting } = useGetAltTextSetting(
		DEFAULT_INSTANCE === userOriginInstance,
	);

	const { mutate: updateAltTextSetting } = useUpdateAltTextSetting({
		onMutate: ({ enabled }) => {
			updateAltTextSettingCache(enabled);
		},
	});

	return (
		<SafeScreen>
			<Header
				title={t('setting.personalization', 'Personalization')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4 mt-2">
				<SettingSection
					sectionKey="appearance"
					colorScheme={colorScheme!}
					icon={AppIcons.personalization}
					title={t('setting.appearance_title')}
					onPress={() => navigation.navigate('Appearance')}
				/>
				<SettingSection
					sectionKey="language"
					colorScheme={colorScheme!}
					icon={AppIcons.globe}
					title={t('setting.appearance.language')}
					onPress={() => navigation.navigate('Language')}
				/>
				{[DEFAULT_INSTANCE].includes(userOriginInstance) && (
					<View className="mt-1">
						<SettingToggleItem
							icon={AppIcons.images}
							text={t('setting.enable_alt_text')}
							isEnabled={altTextSetting?.data}
							onToggle={value => updateAltTextSetting({ enabled: value })}
							isLoading={!altTextSetting}
						/>
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

export default PersonalizationSettingsScreen;
