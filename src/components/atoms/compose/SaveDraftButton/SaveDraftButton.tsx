import { Pressable, Platform } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { memo, useMemo } from 'react';
import { SaveDraftPayload } from '@/types/queries/feed.type';
import { prepareDraftPayload } from '@/util/helper/compose';
import {
	useSaveDraftMutation,
	useUpdateSpecificDraftMutation,
} from '@/hooks/mutations/feed.mutation';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import { queryClient } from '@/App';
import Toast from 'react-native-toast-message';
import {
	useDraftPostsActions,
	useDraftPostsStore,
} from '@/store/compose/draftPosts/draftPostsStore';
import { Flow } from 'react-native-animated-spinkit';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';

const SaveDraftButton = () => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { composeState, composeDispatch } = useComposeStatus();
	const { resetAttachmentStore } = useManageAttachmentActions();
	const { draftType, selectedDraftId } = useDraftPostsStore();
	const { setSelectedDraftId, setDraftType } = useDraftPostsActions();
	const { selectedAudience, clearAudience } = useAudienceStore();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();

	const audHashtags = selectedAudience
		?.flat()
		?.flatMap(audience => audience.hashtags?.map(h => `#${h.hashtag}`) ?? [])
		.join(' ');

	const isSaveDraftVisible = useMemo(() => {
		return composeState.text?.count > 0 && !composeState.schedule?.scheduled_at;
	}, [composeState.text?.count]);

	const { mutate: saveDraft, isPending: isSavingDraft } = useSaveDraftMutation({
		onSettled(data, error) {
			setDraftType('create');
			Toast.show({
				type: !data && error ? 'errorToast' : 'successToast',
				text1: !data && error ? error.message : t('compose.draft.saveSuccess'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			if (!error && data) {
				resetAttachmentStore();
				composeDispatch({ type: 'clear' });
				queryClient.invalidateQueries({ queryKey: ['view-multi-draft'] });
			}
			clearAudience();
			navigation.goBack();
		},
	});

	const { mutate: updateDraft, isPending: isUpdatingDraft } =
		useUpdateSpecificDraftMutation({
			onSettled(data, error) {
				clearAudience();
				setDraftType('create');
				setSelectedDraftId(null);
				Toast.show({
					type: !data && error ? 'errorToast' : 'successToast',
					text1:
						!data && error ? error.message : t('compose.draft.updateSuccess'),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
				});
				if (!error && data) {
					resetAttachmentStore();
					composeDispatch({ type: 'clear' });
					queryClient.invalidateQueries({ queryKey: ['view-multi-draft'] });
				}
				navigation.goBack();
			},
		});

	const handleDraftPost = () => {
		const payload: SaveDraftPayload = prepareDraftPayload(composeState, true);

		if (audHashtags?.length) {
			payload.status = `${
				payload.status ? payload.status + ' ' : ''
			}${audHashtags}`.trim();
		}

		draftType === 'update' && selectedDraftId
			? updateDraft({ id: selectedDraftId, payload })
			: saveDraft(payload);
	};

	return (
		<Pressable
			className={`flex-row items-center px-3 py-1 mx-4 my-1 border rounded-full active:opacity-75 border-patchwork-grey-400 `}
			disabled={isUpdatingDraft || isSavingDraft || !isSaveDraftVisible}
			onPress={handleDraftPost}
		>
			{isUpdatingDraft || isSavingDraft ? (
				<Flow
					size={20}
					color={
						colorScheme === 'dark' ? '#fff' : customColor['patchwork-dark-100']
					}
					className="my-2"
				/>
			) : (
				<ThemeText
					size={'fs_13'}
					className={`leading-5 ${
						!isSaveDraftVisible ? 'text-patchwork-grey-400' : ''
					}`}
				>
					{draftType === 'update'
						? t('compose.draft.update')
						: t('compose.draft.save')}
				</ThemeText>
			)}
		</Pressable>
	);
};

export default memo(SaveDraftButton);
