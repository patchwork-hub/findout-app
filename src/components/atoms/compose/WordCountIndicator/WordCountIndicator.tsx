import Graphemer from 'graphemer';
const splitter = new Graphemer();
import { Pressable, View } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import * as Progress from 'react-native-progress';
import customColor from '@/util/constant/color';
import { cn } from '@/util/helper/twutil';
import { useAuthStore } from '@/store/auth/authStore';
import { useMaxCount } from '@/hooks/custom/useMaxCount';
import { CHANNEL_INSTANCE } from '@/util/constant';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import { useColorScheme } from 'nativewind';
import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';

type Props = {
	composeType: 'create' | 'edit' | 'repost' | 'schedule' | 'quote';
};

const WordCountIndicator = ({ composeType }: Props) => {
	const { composeState, composeDispatch } = useComposeStatus();
	const { selectedAudience } = useAudienceStore();
	const { colorScheme } = useColorScheme();

	const maxStatusLength = useMaxCount();
	const isLong = composeState.maxCount === maxStatusLength;
	const { userOriginInstance } = useAuthStore();
	const { selectedDraftId } = useDraftPostsStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = !!selectedDraftId;

	const audHashtags = selectedAudience
		?.flat()
		?.flatMap(audience => audience.hashtags?.map(h => `#${h.hashtag}`) ?? [])
		.join(' ');

	const combinedText = `${composeState.text.raw} ${audHashtags}`.trim();
	const combinedCount = splitter.countGraphemes(combinedText);

	return (
		<View className="flex-1 items-end mr-1">
			<Pressable
				className="flex-row items-center"
				onPress={() => {
					if (isLong && combinedCount > 500) {
						composeDispatch({
							type: 'text',
							payload: {
								count: combinedCount,
								raw: composeState.text.raw.slice(0, maxStatusLength),
							},
						});
					}
					composeDispatch({
						type: 'maxCount',
						payload: isLong ? 500 : maxStatusLength,
					});
				}}
			>
				<ThemeText
					className={cn(
						composeState.maxCount - combinedCount <= 0
							? 'text-patchwork-primary dark:text-patchwork-parimary-dark'
							: '',
						'mx-3 ',
					)}
				>
					{composeState.maxCount - combinedCount < 0
						? 'Too long'
						: composeState.maxCount - combinedCount}
				</ThemeText>
				<View>
					<Progress.Circle
						progress={combinedCount / composeState.maxCount}
						size={22}
						color={
							colorScheme === 'dark'
								? customColor['patchwork-primary-dark']
								: customColor['patchwork-primary']
						}
						unfilledColor={customColor['patchwork-dark-50']}
						thickness={2}
						borderWidth={0}
					/>
					{userOriginInstance == CHANNEL_INSTANCE && (
						<View className="absolute top-1 left-[7]">
							<ThemeText size={'xs_12'}>
								{composeState.maxCount === maxStatusLength ? 'L' : 'S'}
							</ThemeText>
						</View>
					)}
				</View>
			</Pressable>
		</View>
	);
};

export default WordCountIndicator;
