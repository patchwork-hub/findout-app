import { View, Pressable } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { updateShowAllHashtagCache } from '@/util/cache/feed/feedCache';
import { useTranslation } from 'react-i18next';

type Props = {
	status: Patchwork.Status;
	continuedTagNames: string[];
	isFromQuoteCompose?: boolean;
};

const StatusTags = ({
	status,
	continuedTagNames,
	isFromQuoteCompose = false,
}: Props) => {
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const domain_name = useSelectedDomain();
	const MAX_VISIBLE_TAGS = 3;
	const showAllHashtag = !!status?.custom?.isHashtagExpanded;

	if (!continuedTagNames || continuedTagNames.length === 0) return null;

	const visibleTags = showAllHashtag
		? continuedTagNames
		: continuedTagNames.slice(0, MAX_VISIBLE_TAGS);
	const hiddenTagsCount = continuedTagNames.length - MAX_VISIBLE_TAGS;

	const handleHashTagPress = (tag: string) => {
		const specialTag = tag.replace(/#/g, '').toLowerCase();
		const routes = navigation.getState()?.routes || [];
		const currentRoute = routes[routes.length - 1];

		const params = currentRoute?.params as { hashtag?: string } | undefined;
		if (
			currentRoute?.name === 'HashTagDetail' &&
			params?.hashtag === specialTag
		) {
			return;
		}

		if (currentRoute?.name === 'HashTagDetail') {
			//if it is already on HashTagDetail screen
			navigation.push('HashTagDetail', {
				hashtag: specialTag,
				hashtagDomain: domain_name,
			});
		} else {
			// if it is from bottom tab or other route
			navigation.navigate('HashTagDetail', {
				hashtag: specialTag,
				hashtagDomain: domain_name,
			});
		}
	};

	return (
		<View className="flex-row flex-wrap">
			{visibleTags.map(tag => (
				<Pressable
					disabled={isFromQuoteCompose}
					onPress={() => handleHashTagPress(tag)}
					key={tag}
					className="bg-gray-100 dark:bg-gray-800 rounded-md px-1.5 py-0.5 mr-1 mb-1 active:opacity-80"
				>
					<ThemeText size={'xs_12'} className="text-gray-600 dark:text-white">
						#{tag}
					</ThemeText>
				</Pressable>
			))}
			{!showAllHashtag && hiddenTagsCount > 0 && (
				<Pressable
					disabled={isFromQuoteCompose}
					onPress={() => {
						updateShowAllHashtagCache(
							status.reblog ? status.reblog : status,
							!showAllHashtag,
						);
					}}
				>
					<ThemeText
						size={'xs_12'}
						className="text-gray-600 dark:text-patchwork-grey-400 ml-1 underline"
					>
						{t('hashtag_detail.more_count', { count: hiddenTagsCount })}
					</ThemeText>
				</Pressable>
			)}
		</View>
	);
};

export default StatusTags;
