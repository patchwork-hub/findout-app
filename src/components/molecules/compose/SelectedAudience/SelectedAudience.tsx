import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useAuthStore } from '@/store/auth/authStore';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';
import { useEditAudienceStore } from '@/store/compose/audienceStore/editAudienceStore';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import { CHANNEL_INSTANCE, DEFAULT_INSTANCE } from '@/util/constant';
import customColor from '@/util/constant/color';
import { CloseIcon } from '@/util/svg/icon.common';
import { useColorScheme } from 'nativewind';
import { View, Pressable } from 'react-native';

type Props = {
	composeType: 'create' | 'edit' | 'schedule' | 'repost' | 'quote';
};

export const SelectedAudience = ({ composeType }: Props) => {
	const { colorScheme } = useColorScheme();
	const { composeState } = useComposeStatus();
	const { userOriginInstance } = useAuthStore();
	const { selectedAudience, removeHashtagFromAudience } =
		useCreateAudienceStore();
	const { editSelectedAudience, removeHashtagFromEditAudience } =
		useEditAudienceStore();

	const isMastodonScheduleActive =
		!!composeState.schedule?.schedule_detail_id &&
		userOriginInstance !== DEFAULT_INSTANCE;

	const { selectedDraftId } = useDraftPostsStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = !!selectedDraftId;

	const selAud =
		isDraft || isSchedule || composeType === 'edit'
			? editSelectedAudience
			: selectedAudience;

	const handlePressClose = (
		selAudId: string,
		communityHashtag: Patchwork.PatchworkCommunityHashtag,
	) => {
		if (isMastodonScheduleActive) {
			return;
		}

		if (isSchedule || isDraft || composeType === 'edit') {
			removeHashtagFromEditAudience(selAudId, communityHashtag.hashtag);
		} else {
			removeHashtagFromAudience(selAudId, communityHashtag.hashtag);
		}
	};

	return (
		<View className="flex-row flex-wrap mx-5">
			{selAud?.map(selAud =>
				selAud?.patchwork_community_hashtags?.map(communityHashtag => (
					<View
						key={communityHashtag.id}
						className="flex-row items-center  border border-slate-400 dark:border-white rounded-full px-3 py-1 mr-3 my-1"
					>
						<ThemeText className="text-xs">
							#{communityHashtag.hashtag}
						</ThemeText>
						{/* <Pressable
							onPress={() =>
								handlePressClose(selAud.id?.toString(), communityHashtag)
							}
							hitSlop={5}
						>
							<CloseIcon className="p-3" {...{ colorScheme }} />
						</Pressable> */}
					</View>
				)),
			)}
		</View>
	);
};
