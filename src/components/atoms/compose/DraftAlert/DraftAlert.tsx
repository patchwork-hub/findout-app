import { View, Platform, BackHandler } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomAlert from '../../common/CustomAlert/CustomAlert';
import {
	useDraftPostsActions,
	useDraftPostsStore,
} from '@/store/compose/draftPosts/draftPostsStore';
import {
	useSaveDraftMutation,
	useUpdateSpecificDraftMutation,
} from '@/hooks/mutations/feed.mutation';
import Toast from 'react-native-toast-message';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { queryClient } from '@/App';
import { prepareDraftPayload } from '@/util/helper/compose';
import { SaveDraftPayload } from '@/types/queries/feed.type';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import { useAuthStore } from '@/store/auth/authStore';
import {
	CHANNEL_INSTANCE,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';
import { useEditAudienceStore } from '@/store/compose/audienceStore/editAudienceStore';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

type Props = {
	showDraftAlert: boolean;
	setShowDraftAlert: React.Dispatch<React.SetStateAction<boolean>>;
	totalText: string;
	isFromScheduledPostList?: boolean;
};

const DraftAlert = ({
	showDraftAlert,
	setShowDraftAlert,
	totalText,
	isFromScheduledPostList = false,
}: Props) => {
	const { t } = useTranslation();
	const { draftType, selectedDraftId } = useDraftPostsStore();
	const { setDraftType, setSelectedDraftId } = useDraftPostsActions();
	const { composeState, composeDispatch } = useComposeStatus();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { resetAttachmentStore } = useManageAttachmentActions();
	const [_, setTotalText] = useState(totalText);
	const { userOriginInstance } = useAuthStore();
	const { selectedAudience, clearAudience } = useCreateAudienceStore();
	const { editSelectedAudience, clearEditSelectedAudience } =
		useEditAudienceStore();
	const { colorScheme } = useColorScheme();

	useEffect(() => {
		setTotalText(totalText);
	}, [totalText]);

	useEffect(() => {
		if (isFromScheduledPostList) {
			return;
		}
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			handleExit,
		);
		return () => {
			backHandler.remove();
		};
	}, [navigation, isFromScheduledPostList]);

	useEffect(() => {
		if (isFromScheduledPostList) {
			return;
		}
		const beforeRemoveListener = navigation.addListener('beforeRemove', e => {
			e.preventDefault();
			handleExit();
		});
		return () => {
			navigation.removeListener('beforeRemove', beforeRemoveListener);
		};
	}, [navigation, isFromScheduledPostList]);

	const { mutate: saveDraft, isPending: isSavingDraft } = useSaveDraftMutation({
		onSettled(data, error) {
			setDraftType('create');
			clearEditSelectedAudience();
			clearAudience();
			Toast.show({
				type: !data && error ? 'errorToast' : 'successToast',
				text1: !data && error ? error.message : t('compose.draft.saveSuccess'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			if (!error && data) {
				onCloseDiscardPostAlert();
				resetAttachmentStore();
				composeDispatch({ type: 'clear' });
				queryClient.invalidateQueries({ queryKey: ['view-multi-draft'] });
			}
		},
	});

	const { mutate: updateDraft, isPending: isUpdatingDraft } =
		useUpdateSpecificDraftMutation({
			onSettled(data, error) {
				setDraftType('create');
				setSelectedDraftId(null);
				clearEditSelectedAudience();
				clearAudience();
				Toast.show({
					type: !data && error ? 'errorToast' : 'successToast',
					text1:
						!data && error ? error.message : t('compose.draft.updateSuccess'),
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
				});
				if (!error && data) {
					onCloseDiscardPostAlert();
					resetAttachmentStore();
					composeDispatch({ type: 'clear' });
					queryClient.invalidateQueries({ queryKey: ['view-multi-draft'] });
				}
			},
		});

	const handleDraftPost = () => {
		const payload: SaveDraftPayload = prepareDraftPayload(composeState, true);
		const audienceSource =
			draftType === 'update' ? editSelectedAudience : selectedAudience;
		if (audienceSource.length > 0) {
			const audienceTags = audienceSource.map(aud => `#${aud.slug}`).join(' ');
			payload.status = `${
				payload.status ? payload.status + ' ' : ''
			}${audienceTags}`.trim();
		}
		draftType === 'update' && selectedDraftId
			? updateDraft({ id: selectedDraftId, payload })
			: saveDraft(payload);
	};

	const onCloseDiscardPostAlert = () => {
		setDraftType('create');
		setShowDraftAlert(false);
		clearEditSelectedAudience();
		clearAudience();
		setSelectedDraftId(null);
		navigation.goBack();
	};

	const handleExit = () => {
		if (isFromScheduledPostList) {
			navigation.navigate('SettingStack', { screen: 'ScheduledPostList' });
			return true;
		}
		let updatedTotalText = '';
		setTotalText(prev => {
			updatedTotalText = prev;
			return prev;
		});
		if (
			updatedTotalText.trim() &&
			[
				DEFAULT_INSTANCE,
				MO_ME_INSTANCE,
				NEWSMAST_INSTANCE_V1,
				CHANNEL_INSTANCE,
			].includes(userOriginInstance)
		) {
			setShowDraftAlert(true);
			return true;
		} else {
			setSelectedDraftId(null);
			clearEditSelectedAudience();
			clearAudience();
			navigation.goBack();
			return false;
		}
	};

	return (
		<View>
			<CustomAlert
				isVisible={showDraftAlert}
				type="success"
				title={t('compose.draft.title')}
				message={t('compose.draft.message')}
				confirmBtnText={
					draftType === 'update'
						? t('compose.draft.update')
						: t('compose.draft.create')
				}
				extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
				extraCancelBtnStyle={'text-patchwork-red-50'}
				cancelBtnText={t('compose.draft.discard')}
				hasCancel
				handleOk={handleDraftPost}
				handleCancel={onCloseDiscardPostAlert}
				onPressBackdrop={() => setShowDraftAlert(false)}
				isPendingConfirm={isSavingDraft || isUpdatingDraft}
			/>
		</View>
	);
};

export default DraftAlert;
