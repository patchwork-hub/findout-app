import WpKnowledgeSection from '@/components/molecules/home/WpKnowledgeSection/WpKnowledgeSection';
import WpLinksSection from '@/components/molecules/home/WpLinksSection/WpLinksSection';
import WpNewsSection from '@/components/molecules/home/WpNewsSection/WpNewsSection';
import CiviPeopleSection from '@/components/molecules/home/CiviPeopleSection/CiviPeopleSection';
import { useQueryClient } from '@tanstack/react-query';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { RefreshControl } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';

const HomeResourcesTab = () => {
	const { colorScheme } = useColorScheme();
	const queryClient = useQueryClient();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = () => {
		setIsRefreshing(true);
		queryClient.invalidateQueries({ queryKey: ['wordpressPosts'] });
		queryClient.invalidateQueries({ queryKey: ['wpAuthors'] });
		queryClient.invalidateQueries({ queryKey: ['wpResources'] });
		queryClient.invalidateQueries({ queryKey: ['peoplePreview'] });
		queryClient.invalidateQueries({ queryKey: ['peopleDirectory'] });
		setTimeout(() => setIsRefreshing(false), 2000);
	};

	return (
		<Tabs.ScrollView
			refreshControl={
				<RefreshControl
					refreshing={isRefreshing}
					onRefresh={handleRefresh}
					tintColor={
						colorScheme === 'dark'
							? customColor['patchwork-light-900']
							: customColor['patchwork-dark-100']
					}
				/>
			}
			showsVerticalScrollIndicator={false}
		>
			<WpNewsSection />
			<CiviPeopleSection />
			<WpKnowledgeSection />
			<WpLinksSection />
		</Tabs.ScrollView>
	);
};

export default HomeResourcesTab;
