import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import { View } from 'react-native';

type Props = {
	composeType: 'create' | 'edit' | 'schedule' | 'repost' | 'quote';
};

export const SelectedAudience = ({ composeType }: Props) => {
	const { composeState } = useComposeStatus();
	const { selectedAudience } = useAudienceStore();

	const { selectedDraftId } = useDraftPostsStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = !!selectedDraftId;

	return (
		<View className="flex-row flex-wrap mx-5">
			{selectedAudience?.flat()?.map(selAud => {
				return selAud?.hashtags?.map(hashtagDetail => {
					return (
						<View
							key={hashtagDetail.id}
							className="flex-row items-center border border-slate-400 dark:border-white rounded-full px-3 py-[6] mr-3 my-1"
						>
							<ThemeText className="text-xs">
								#{hashtagDetail.hashtag}
							</ThemeText>
						</View>
					);
				});
			})}
		</View>
	);
};
