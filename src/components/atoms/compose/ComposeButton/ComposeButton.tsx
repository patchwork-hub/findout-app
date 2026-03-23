import { Pressable } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { Flow } from 'react-native-animated-spinkit';
import { StatusCurrentPage } from '@/context/statusItemContext/statusItemContext.type';
import { useCallback } from 'react';
import { useComposeLogic } from '../../../../hooks/custom/useComposeButtonLogic';

const ComposeButton = ({
	statusId,
	statusCurrentPage,
	composeType,
}: {
	statusId: string;
	statusCurrentPage?: StatusCurrentPage;
	composeType: 'edit' | 'repost' | 'create' | 'schedule';
}) => {
	const {
		composeState,
		isPending,
		isPublishingDraft,
		isUpdatingSchedule,
		handleComposeStatus,
		handleUpdateSchedule,
		disabledComposeButton,
		t,
	} = useComposeLogic(statusId, statusCurrentPage, composeType);

	const textForSchedule = composeState?.schedule?.is_edting_previous_schedule
		? t('common.update')
		: t('schedule');

	const renderComposeHeaderTitle = useCallback(() => {
		switch (composeType) {
			case 'edit':
				return t('common.update');
			case 'repost':
				return t('screen.repost');
			default:
				return t('timeline.post');
		}
	}, [composeType, t]);

	return (
		<Pressable
			testID="compose-button"
			className="bg-patchwork-primary py-[6] px-3 rounded-full"
			disabled={disabledComposeButton()}
			onPress={() =>
				composeState?.schedule?.is_edting_previous_schedule
					? handleUpdateSchedule()
					: handleComposeStatus()
			}
		>
			{isPending || isPublishingDraft || isUpdatingSchedule ? (
				<Flow size={20} color={'#fff'} className="my-2" />
			) : (
				<ThemeText
					size={'fs_13'}
					className={`leading-5 text-white dark:text-white`}
				>
					{composeState.schedule ? textForSchedule : renderComposeHeaderTitle()}
				</ThemeText>
			)}
		</Pressable>
	);
};

export default ComposeButton;
