import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useGetForYouChannelList } from '@/hooks/queries/channel.queries';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useAuthStore } from '@/store/auth/authStore';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';
import { useEditAudienceStore } from '@/store/compose/audienceStore/editAudienceStore';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import { CHANNEL_INSTANCE, DEFAULT_INSTANCE } from '@/util/constant';
import { PollDropperIcon } from '@/util/svg/icon.compose';
import { useColorScheme } from 'nativewind';
import { Pressable } from 'react-native';
import { useEffect, useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type Props = {
	composeType: 'create' | 'edit' | 'repost' | 'schedule' | 'quote';
	onPress: () => void;
	prefilledChannelType?: 'local' | 'public';
};

export const SelectAudienceBtn = ({
	composeType,
	onPress,
	prefilledChannelType,
}: Props) => {
	const { composeState } = useComposeStatus();
	const { userOriginInstance } = useAuthStore();
	const { selectedAudience } = useCreateAudienceStore();
	const { editSelectedAudience } = useEditAudienceStore();
	const { selectedDraftId } = useDraftPostsStore();
	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = !!selectedDraftId;
	const { colorScheme } = useColorScheme();

	const audienceSource =
		isDraft || isSchedule || composeType === 'edit'
			? editSelectedAudience
			: selectedAudience;

	const { data: newsmastChannels } = useGetForYouChannelList();

	const isMastodonScheduleActive =
		!!composeState.schedule?.schedule_detail_id &&
		userOriginInstance !== DEFAULT_INSTANCE;

	const [isInitializing, setIsInitializing] = useState(true);

	// noted: to change to public immediately when navigated from newsmast communities
	useFocusEffect(
		useCallback(() => {
			setIsInitializing(true);
			const timeout = setTimeout(() => setIsInitializing(false), 200);
			return () => clearTimeout(timeout);
		}, []),
	);

	const getAudienceName = () => {
		if (isInitializing && prefilledChannelType === 'public') return 'Public';

		if (composeState.visibility === 'public') return 'Public';

		if (audienceSource && audienceSource.length > 0) {
			const isValidAudience = newsmastChannels?.some(
				channel => channel.attributes?.id === audienceSource[0].id,
			);
			if (isValidAudience) {
				return `${audienceSource[0].name}${
					audienceSource.length > 1 ? ` +${audienceSource.length - 1} more` : ''
				}`;
			}
		}
		if (composeState.visibility === 'local') return 'Local';
		if (composeState.visibility) {
			return (
				composeState.visibility.charAt(0).toUpperCase() +
				composeState.visibility.slice(1)
			);
		}
		return 'Show name';
	};

	return (
		<Pressable
			className={`max-w-[65%] self-start flex-row items-center px-3 py-1 mx-4 my-1 border rounded-full ${
				isMastodonScheduleActive
					? 'border-patchwork-grey-70 opacity-40'
					: 'border-patchwork-grey-400 active:opacity-75'
			}`}
			onPress={onPress}
			disabled={isMastodonScheduleActive}
		>
			<ThemeText className="w-auto">{getAudienceName()}</ThemeText>
			<PollDropperIcon className="mt-0.5 ml-1" {...{ colorScheme }} />
		</Pressable>
	);
};
