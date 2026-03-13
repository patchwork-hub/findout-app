import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import ComposeActionsBar from '@/components/molecules/compose/ComposeActionsBar/ComposeActionsBar';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { HomeStackParamList } from '@/types/navigation';
import QuotePostButton from '@/components/atoms/compose/QuotePostButton/QuotePostButton';
import RepostStatus from '@/components/organisms/compose/RepostStatus/RepostStatus';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import UserSuggestionModal from '@/components/atoms/compose/UserSuggestionModal/UserSuggestionModal';
import { useGradualAnimation } from '@/hooks/custom/useGradualAnimation';
import ComposeButton from '@/components/atoms/compose/ComposeButton/ComposeButton';
import EditComposeStatus from '@/components/organisms/compose/EditComposeStatus/EditComposeStatus';
import CreateComposeStatus from '@/components/organisms/compose/CreateComposeStatus/CreateComposeStatus';
import EditPhotoModal from '@/components/atoms/compose/EditPhotoModal/EditPhotoModal';
import {
	useEditPhotoMeta,
	useEditPhotoMetaActions,
} from '@/store/compose/editPhotoMeta/editPhotoMeta';
import { StatusCurrentPage } from '@/context/statusItemContext/statusItemContext.type';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScheduleListButton from '@/components/atoms/compose/ScheduleListButton/ScheduleListButton';
import ScheduleListModal from '@/components/molecules/compose/ScheduleListModal/ScheduleListModal';
import DraftAlert from '@/components/atoms/compose/DraftAlert/DraftAlert';
import { useAuthStore } from '@/store/auth/authStore';
import {
	CHANNEL_INSTANCE,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import SaveDraftButton from '@/components/atoms/compose/SaveDraftButton/SaveDraftButton';
import WordCountIndicator from '@/components/atoms/compose/WordCountIndicator/WordCountIndicator';
import { useDraftPostsActions } from '@/store/compose/draftPosts/draftPostsStore';
import { useEditAudienceStore } from '@/store/compose/audienceStore/editAudienceStore';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';
import { getComposeUpdatePayload } from '@/util/helper/compose';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import { useTranslation } from 'react-i18next';
import { useQuoteStore } from '@/store/feed/quoteStore';
import QuotePostContent from '@/components/molecules/compose/QuotePostContent/QuotePostContent';
import { SelectAudienceBtn } from '@/components/molecules/compose/SelectAudienceBtn/SelectAudienceBtn';
import { AudienceListModal } from '../AudienceListModal/AudienceListModal';
import { SelectedAudience } from '@/components/molecules/compose/SelectedAudience/SelectedAudience';

type Props = {
	composeParams:
		| {
				type: 'create';
				prefilledHashtags?: Patchwork.PatchworkCommunityHashtag[]; // allow this
				prefilledAudience?: Patchwork.ChannelAttributes;
		  }
		| {
				type: 'repost' | 'edit';
				incomingStatus: Patchwork.Status;
				statusCurrentPage?: StatusCurrentPage;
				extraPayload?: Record<string, any>;
		  }
		| {
				type: 'schedule';
				scheduledStatus: Patchwork.Schedule | null;
		  }
		| {
				type: 'quote';
				statusId: string;
		  };
};

const ComposeContent = ({ composeParams }: Props) => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const isQuotePost = composeParams?.type === 'quote';
	const isEdit = composeParams?.type === 'edit';
	const { closeEditPhotoModal } = useEditPhotoMetaActions();
	const { editPhotoModal } = useEditPhotoMeta();
	const { composeState, composeDispatch } = useComposeStatus();
	const { userOriginInstance } = useAuthStore();
	const { clearEditSelectedAudience } = useEditAudienceStore();
	const { setSelectedDraftId } = useDraftPostsActions();
	const [showDraftAlert, setShowDraftAlert] = useState(false);
	const { height } = useGradualAnimation();
	const [openScheduleList, setOpenScheduleList] = useState(false);
	const [showAudienceModal, setShowAudienceModal] = useState(false);
	const { onAddMedia } = useManageAttachmentActions();
	const { t } = useTranslation();
	const { clearQuotedStatus } = useQuoteStore();

	const { setSelectedAudience } = useCreateAudienceStore();

	useEffect(() => {
		if (composeParams.type === 'create') {
			if (composeParams.prefilledAudience) {
				console.log(
					'composeParams.prefilledAudience::',
					composeParams.prefilledAudience,
				);
				setSelectedAudience([composeParams.prefilledAudience]);
				composeDispatch({ type: 'visibility_change', payload: 'local' });
			}
		}

		if (composeParams.type === 'schedule' && composeParams.scheduledStatus) {
			const updateComposePayload = getComposeUpdatePayload({
				type: 'schedule',
				item: composeParams.scheduledStatus,
				composeState,
			});
			composeDispatch(updateComposePayload);

			setTimeout(() => {
				onAddMedia(
					(composeParams.scheduledStatus?.media_attachments ?? []).map(
						item => ({
							...item,
							sensitive: !!composeParams.scheduledStatus?.params?.sensitive,
						}),
					),
				);
			}, 0);
		}
	}, [
		composeParams?.type,
		composeParams.type === 'create'
			? composeParams.prefilledAudience
			: undefined,
	]);

	const toolbarAnimatedViewStyle = useAnimatedStyle(() => {
		return {
			height: Math.abs(height.value),
		};
	});

	const renderComposeHeaderTitle = useCallback(() => {
		switch (composeParams?.type) {
			case 'edit':
				return t('screen.edit_post');
			case 'repost':
				return t('screen.repost');
			case 'quote':
				return t('screen.quote_post');
			default:
				return t('screen.new_post');
		}
	}, [composeParams?.type]);

	const handleExit = useCallback(() => {
		if (composeParams.type === 'quote') {
			clearQuotedStatus();
		}
		if (composeParams.type === 'schedule') {
			setShowDraftAlert(false);
			composeDispatch({ type: 'clear' });
			navigation.goBack();
			return true;
		}
		if (
			composeState?.text?.raw?.trim() &&
			!composeState.schedule &&
			[
				DEFAULT_INSTANCE,
				MO_ME_INSTANCE,
				NEWSMAST_INSTANCE_V1,
				CHANNEL_INSTANCE,
			].includes(userOriginInstance)
		) {
			setShowDraftAlert(true);
		} else {
			setSelectedDraftId(null);
			clearEditSelectedAudience();
			navigation.goBack();
		}
		return true;
	}, [navigation, composeState?.text]);

	return (
		<View style={{ flex: 1 }}>
			<Header
				title={renderComposeHeaderTitle()}
				leftCustomComponent={<BackButton customOnPress={handleExit} />}
				rightCustomComponent={
					isQuotePost ? (
						<QuotePostButton quotedStatusid={composeParams.statusId} />
					) : (
						<ComposeButton
							{...{
								statusId: isEdit ? composeParams.incomingStatus.id : '',
								statusCurrentPage: isEdit
									? composeParams.statusCurrentPage
									: undefined,
								composeType: composeParams.type,
							}}
						/>
					)
				}
				className="pt-3"
			/>
			<ScrollView
				keyboardShouldPersistTaps="always"
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				<View className="flex-row justify-between items-center py-2">
					{composeParams.type !== 'quote' && (
						<SelectAudienceBtn
							composeType={composeParams.type}
							onPress={() => setShowAudienceModal(true)}
						/>
					)}
					{[
						DEFAULT_INSTANCE,
						MO_ME_INSTANCE,
						NEWSMAST_INSTANCE_V1,
						CHANNEL_INSTANCE,
					].includes(userOriginInstance) &&
						composeParams.type !== 'quote' && <SaveDraftButton />}
				</View>
				{composeParams.type === 'edit' && (
					<EditComposeStatus status={composeParams.incomingStatus} />
				)}

				{composeParams.type === 'repost' && (
					<RepostStatus status={composeParams.incomingStatus} />
				)}

				{composeParams.type === 'quote' && (
					<QuotePostContent statusId={composeParams.statusId} />
				)}

				{(composeParams.type === 'create' ||
					composeParams.type === 'schedule') && (
					<CreateComposeStatus composeType={composeParams?.type} />
				)}
				{!['repost', 'quote'].includes(composeParams.type) && (
					<SelectedAudience composeType={composeParams.type} />
				)}
			</ScrollView>
			{composeParams.type !== 'quote' && (
				<View className="flex-row items-center justify-between px-2 py-2">
					{(composeParams.type === 'create' ||
						composeParams.type === 'schedule') && (
						<ScheduleListButton
							onPressScheduleListBtn={() => setOpenScheduleList(true)}
						/>
					)}
					<WordCountIndicator composeType={composeParams.type} />
				</View>
			)}
			<ComposeActionsBar
				composeType={composeParams?.type}
				comesFromNewSchedule={
					composeParams?.type === 'schedule' &&
					composeParams?.scheduledStatus === null
				}
			/>
			<Animated.View style={toolbarAnimatedViewStyle} />

			<UserSuggestionModal />

			{showAudienceModal && (
				<AudienceListModal
					composeType={composeParams.type}
					onClose={() => setShowAudienceModal(false)}
				/>
			)}

			{openScheduleList && (
				<ScheduleListModal onClose={() => setOpenScheduleList(false)} />
			)}
			{editPhotoModal && (
				<EditPhotoModal
					onClose={closeEditPhotoModal}
					composeType={composeParams.type}
					incomingStatus={
						composeParams.type === 'edit' ? composeParams.incomingStatus : null
					}
				/>
			)}
			{composeParams.type !== 'quote' && (
				<DraftAlert
					{...{
						isFromScheduledPostList: composeParams.type === 'schedule',
						showDraftAlert,
						setShowDraftAlert,
						totalText: composeState?.text?.raw,
					}}
				/>
			)}
		</View>
	);
};

export default ComposeContent;
