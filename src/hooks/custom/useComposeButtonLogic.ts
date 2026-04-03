import { Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import {
	useComposeMutation,
	useUpdateScheduleMutation,
	usePublishDraftMutation,
} from '@/hooks/mutations/feed.mutation';
import {
	prepareComposePayload,
	prepareDraftPayload,
} from '@/util/helper/compose';
import {
	editStatusCache,
	addStatusToFeedCacheHelper,
} from '@/util/cache/feed/feedCache';
import {
	useActiveFeedAction,
	useCurrentActiveFeed,
} from '@/store/feed/activeFeed';
import {
	useManageAttachmentActions,
	useManageAttachmentStore,
} from '@/store/compose/manageAttachments/manageAttachmentStore';
import { queryClient } from '@/App';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { useAuthStore } from '@/store/auth/authStore';
import {
	useDraftPostsActions,
	useDraftPostsStore,
} from '@/store/compose/draftPosts/draftPostsStore';
import { useEditPhotoMetaActions } from '@/store/compose/editPhotoMeta/editPhotoMeta';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { POLL_LIMITS } from '@/util/constant/pollOption';
import Graphemer from 'graphemer';
import { StatusCurrentPage } from '@/context/statusItemContext/statusItemContext.type';
import { SaveDraftPayload } from '@/types/queries/feed.type';
import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';

const splitter = new Graphemer();

type ComposeType = 'edit' | 'repost' | 'create' | 'schedule';

export const useComposeLogic = (
	statusId: string,
	statusCurrentPage: StatusCurrentPage | undefined,
	composeType: ComposeType,
) => {
	const { t } = useTranslation();
	const { composeState, composeDispatch } = useComposeStatus();
	const navigation = useNavigation();
	const route =
		useRoute<RouteProp<Record<string, { channelId?: string }>, string>>();
	const domain_name = useSelectedDomain();
	const { userInfo, userOriginInstance } = useAuthStore();

	const currentFeed = useCurrentActiveFeed();
	const { setActiveFeed } = useActiveFeedAction();
	const { resetAttachmentStore } = useManageAttachmentActions();
	const { progress } = useManageAttachmentStore();
	const isMediaUploading = progress.currentIndex !== undefined;
	const { resetEditPhotoMeta } = useEditPhotoMetaActions();
	const { selectedDraftId } = useDraftPostsStore();
	const { setDraftType, setSelectedDraftId } = useDraftPostsActions();
	const { selectedAudience, clearAudience } = useAudienceStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = !!selectedDraftId;

	const audHashtags = selectedAudience
		?.flat()
		?.flatMap(audience => audience.hashtags?.map(h => `#${h.hashtag}`) ?? [])
		.join(' ');

	const accountDetailFeedQueryKey = [
		'account-detail-feed',
		{
			domain_name: userOriginInstance,
			account_id: userInfo?.id!,
			exclude_replies: true,
			exclude_reblogs: true,
			exclude_original_statuses: false,
		},
	];

	const channelFeedQueryKey = [
		'channel-feed',
		{ domain_name, remote: false, only_media: false },
	];

	const homeFeedQueryKey = ['for-you-timeline'];

	const channelPostsQueryKey = route.params?.channelId
		? [
				'account-detail-feed',
				{
					account_id: route.params.channelId,
					exclude_reblogs: false,
					exclude_replies: true,
					exclude_original_statuses: false,
				},
		  ]
		: null;

	const { mutate, isPending } = useComposeMutation({
		onSuccess: async (status: Patchwork.Status) => {
			const isScheduledStatus = 'scheduled_at' in status;

			if (statusId) {
				editStatusCache(status);
			} else if (!isScheduledStatus) {
				const queryKeysToUpdate: any[] = [
					homeFeedQueryKey,
					accountDetailFeedQueryKey,
				];
				if (channelPostsQueryKey) {
					queryKeysToUpdate.push(channelPostsQueryKey);
				}
				addStatusToFeedCacheHelper(queryKeysToUpdate, status);
			}

			Toast.show({
				type: 'successToast',
				text1: composeState.schedule
					? t('toast.schedule_create_success')
					: statusId
					? t('toast.update_success')
					: t('toast.success'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});

			composeDispatch({ type: 'clear' });
			resetAttachmentStore();
			resetEditPhotoMeta();
			clearAudience();

			if (composeType === 'schedule') {
				await queryClient.invalidateQueries({ queryKey: ['schedule-list'] });
				navigation.navigate('SettingStack', {
					screen: 'ScheduledPostList',
				});
			} else {
				navigation.goBack();
			}
		},
		onError: e => {
			resetEditPhotoMeta();
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { mutate: publishDraft, isPending: isPublishingDraft } =
		usePublishDraftMutation({
			onMutate: async deletedDraft => {
				await queryClient.cancelQueries({ queryKey: ['view-multi-draft'] });
				const previousDrafts = queryClient.getQueryData<
					Patchwork.MultiDraftStatusData[]
				>(['view-multi-draft']);
				const updatedDrafts =
					previousDrafts
						?.map(item => ({
							...item,
							datas: item.datas.filter(draft => draft.id !== deletedDraft.id),
						}))
						.filter(item => item.datas.length > 0) || [];

				queryClient.setQueryData(['view-multi-draft'], updatedDrafts);

				return { previousDrafts };
			},
			onSettled: () => {
				setDraftType('create');
				setSelectedDraftId(null);
			},
			onSuccess: (status: Patchwork.Status) => {
				if (
					statusCurrentPage == 'FeedDetail' &&
					currentFeed?.id === status.id
				) {
					setActiveFeed(status);
				}

				if (statusId) {
					editStatusCache(status);
				} else {
					queryClient.invalidateQueries({
						queryKey: accountDetailFeedQueryKey,
					});
					queryClient.invalidateQueries({ queryKey: channelFeedQueryKey });
					queryClient.invalidateQueries({ queryKey: homeFeedQueryKey });
					if (channelPostsQueryKey) {
						queryClient.invalidateQueries({ queryKey: channelPostsQueryKey });
					}
				}
				composeDispatch({ type: 'clear' });
				resetAttachmentStore();
				resetEditPhotoMeta();
				clearAudience();
				navigation.goBack();
			},
			onError: (e: Error) => {
				resetEditPhotoMeta();
				Toast.show({
					type: 'errorToast',
					text1: e.message,
					position: 'top',
					topOffset: Platform.OS == 'android' ? 25 : 50,
				});
			},
		});

	const { mutate: updateSchedule, isPending: isUpdatingSchedule } =
		useUpdateScheduleMutation({
			onSuccess: () => {
				Toast.show({
					type: 'successToast',
					text1: t('toast.schedule_update_success'),
					position: 'top',
					visibilityTime: 1500,
					topOffset: Platform.OS === 'android' ? 25 : 50,
				});

				queryClient.invalidateQueries({ queryKey: ['schedule-list'] });
				composeDispatch({ type: 'clear' });
				clearAudience();
				resetAttachmentStore();
				resetEditPhotoMeta();

				if (composeType === 'schedule') {
					navigation.navigate('SettingStack', {
						screen: 'ScheduledPostList',
					});
				} else {
					navigation.goBack();
				}
			},
		});

	const handleComposeStatus = () => {
		if (composeState.text.count > composeState.maxCount) {
			return Toast.show({
				type: 'errorToast',
				text1: t('toast.maximum_length_exceeded'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		}
		const payload = prepareComposePayload(composeState);

		if (audHashtags?.length) {
			payload.status = `${
				payload.status ? payload.status + ' ' : ''
			}${'\n'}${'\n'}${audHashtags}`.trim();
		}

		const publishDraftPayload: SaveDraftPayload = prepareDraftPayload(
			composeState,
			false,
		);

		if (!payload.scheduled_at && selectedDraftId && audHashtags?.length) {
			publishDraftPayload.status = `${
				publishDraftPayload.status ? publishDraftPayload.status + ' ' : ''
			}${'\n'}${'\n'}${audHashtags}`.trim();
		}

		!payload.scheduled_at && selectedDraftId
			? publishDraft({ id: selectedDraftId, payload: publishDraftPayload })
			: statusId
			? mutate({ statusId, ...payload })
			: mutate(payload);
	};

	const handleUpdateSchedule = () => {
		const payload = prepareComposePayload(composeState);
		if (audHashtags?.length) {
			payload.status = `${
				payload.status ? payload.status + ' ' : ''
			}${audHashtags}`.trim();
		}
		updateSchedule(payload);
	};

	const disabledComposeButton = () => {
		const { text, poll, maxCount, media_ids } = composeState;
		const hasEmptyPollOptions = poll?.options?.some(
			option => option.trim() === '',
		);
		const insufficientPollOptions =
			poll && poll.options?.length < POLL_LIMITS.MIN_OPTIONS;

		const combinedText = `${composeState.text.raw} ${audHashtags}`.trim();
		const combinedCount = splitter.countGraphemes(combinedText);

		return (
			isPending ||
			isUpdatingSchedule ||
			isPublishingDraft ||
			(!text.raw && media_ids.length === 0) ||
			isMediaUploading ||
			insufficientPollOptions ||
			hasEmptyPollOptions ||
			combinedCount > maxCount
		);
	};

	return {
		composeState,
		isPending,
		isPublishingDraft,
		isUpdatingSchedule,
		handleComposeStatus,
		handleUpdateSchedule,
		disabledComposeButton,
		t,
	};
};
