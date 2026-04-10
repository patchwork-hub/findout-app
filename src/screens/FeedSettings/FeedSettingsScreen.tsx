import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingSection } from '@/components/molecules/settings/SettingSection/SettingSection';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { SettingStackScreenProps } from '@/types/navigation';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

const FeedSettingsScreen: React.FC<SettingStackScreenProps<'FeedSettings'>> = ({
	navigation,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	return (
		<SafeScreen>
			<Header
				title={t('setting.timeline_feed', 'Timeline & feed')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4 mt-2">
				<SettingSection
					sectionKey="bookmarks"
					colorScheme={colorScheme!}
					icon={AppIcons.bookmarkRegular}
					title={t('screen.bookmarks')}
					onPress={() => navigation.navigate('BookmarkList')}
				/>
				<SettingSection
					sectionKey="lists"
					colorScheme={colorScheme!}
					icon={AppIcons.list}
					title={t('screen.lists')}
					onPress={() => navigation.navigate('ListsStack', { screen: 'Lists' })}
				/>
				<SettingSection
					sectionKey="scheduled_posts"
					colorScheme={colorScheme!}
					icon={AppIcons.schedule}
					title={t('screen.scheduled_posts')}
					onPress={() => navigation.navigate('ScheduledPostList')}
				/>
				<SettingSection
					sectionKey="timeline"
					colorScheme={colorScheme!}
					icon={AppIcons.timeline}
					title={t('setting.timeline', 'Timeline')}
					onPress={() => navigation.navigate('Timeline')}
				/>
				<SettingSection
					sectionKey="layout"
					colorScheme={colorScheme!}
					icon={AppIcons.layout}
					title={t('setting.layout', 'Layout')}
					onPress={() => navigation.navigate('Layout')}
				/>
			</View>
		</SafeScreen>
	);
};

export default FeedSettingsScreen;
