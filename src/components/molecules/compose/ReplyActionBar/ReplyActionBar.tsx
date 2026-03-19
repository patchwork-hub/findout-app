import { Button } from '@/components/atoms/common/Button/Button';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import ManageAttachmentModal from '@/components/organisms/compose/modal/ManageAttachment/MakeAttachmentModal';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useComposeMutation } from '@/hooks/mutations/feed.mutation';
import { useAuthStore } from '@/store/auth/authStore';
import {
	useManageAttachmentActions,
	useManageAttachmentStore,
} from '@/store/compose/manageAttachments/manageAttachmentStore';
import {
	useStatusReplyAction,
	useStatusReplyStore,
} from '@/store/compose/statusReply/statusReplyStore';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { FeedRepliesQueryKey } from '@/types/queries/feed.type';
import { updateStatusReplyCache } from '@/util/cache/feed/feedCache';
import { updateReplyFeedCache } from '@/util/cache/reply/replyCache';
import { POLL_INITIAL } from '@/util/constant/pollOption';
import { prepareComposePayload } from '@/util/helper/compose';
import { generateAppopirateColor } from '@/util/helper/helper';
import { useColorScheme } from 'nativewind';
import { RefObject, useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, TextInput, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';
import GifPickerModal from '../GifPickerModal/GifPickerModal';
import EmojiModal from '@/components/organisms/compose/modal/Emoji/EmojiModal';
import colors from 'tailwindcss/colors';
import customColor from '@/util/constant/color';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { cn } from '@/util/helper/twutil';

type Props = {
	feedDetailStatus: Patchwork.Status;
	inputRef: RefObject<TextInput | null>;
	feedDetailId: string;
};

const ReplyActionBar = ({
	feedDetailStatus,
	inputRef,
	feedDetailId,
}: Props) => {
	const { colorScheme } = useColorScheme();
	const domain_name = useSelectedDomain();
	const { composeState, composeDispatch } = useComposeStatus();
	const { mediaModal, selectedMedia, progress } = useManageAttachmentStore();
	const { changeCurrentStatus } = useStatusReplyAction();
	const { currentFocusStatus, textInputRef } = useStatusReplyStore();
	const isMediaUploading = progress.currentIndex !== undefined;
	const { userInfo } = useAuthStore();
	const { onToggleMediaModal, resetAttachmentStore } =
		useManageAttachmentActions();
	const [showGifModal, setGifModal] = useState(false);

	const [isEmojiModalVisible, setEmojiModalVisible] = useState(false);

	const disabledMedia =
		selectedMedia.length == 4 || isMediaUploading || !!composeState.poll;

	const disabledPoll = selectedMedia.length > 0;

	const feedReplyQueryKey: FeedRepliesQueryKey = [
		'feed-replies',
		{ id: feedDetailId, domain_name },
	];

	useEffect(() => {
		if (composeState.in_reply_to_id === undefined) {
			composeDispatch({
				type: 'reply_id_change',
				payload: feedDetailStatus.id,
			});
			changeCurrentStatus(feedDetailStatus);
		}
	}, [composeState]);

	const { mutate, isPending } = useComposeMutation({
		onSuccess: (newStatus: Patchwork.Status, variables) => {
			textInputRef?.current?.blur();
			textInputRef?.current?.clear();
			composeDispatch({ type: 'clear' });
			resetAttachmentStore();

			updateStatusReplyCache(
				currentFocusStatus?.id == feedDetailId
					? feedDetailStatus.id
					: currentFocusStatus?.id!,
				'increase',
			);
			updateReplyFeedCache(feedReplyQueryKey, newStatus, feedDetailStatus.id);
			setTimeout(() => {
				Keyboard.dismiss();
			}, 0);
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const handlePublish = () => {
		if (
			composeState.text.count < composeState.maxCount ||
			composeState.in_reply_to_id !== undefined
		) {
			const payload = prepareComposePayload(composeState);
			const selectedStatus = currentFocusStatus ?? feedDetailStatus;

			payload.visibility =
				(feedDetailStatus?.visibility as Patchwork.ComposeVisibility) ||
				'public';

			mutate({ ...payload });
		}
	};

	const onPressPoll = () => {
		if (composeState.poll) {
			composeDispatch({ type: 'poll', payload: null });
		} else {
			composeDispatch({
				type: 'poll',
				payload: POLL_INITIAL,
			});
		}
	};

	const getStrokeColorForPoll = () => {
		if (composeState.poll)
			return colorScheme === 'dark'
				? customColor['patchwork-primary-dark']
				: customColor['patchwork-primary'];
		return generateAppopirateColor({
			light: disabledPoll ? colors.slate[300] : colors.slate[500],
			dark: disabledPoll ? '#6D7276' : '#fff',
		});
	};

	const getGifIcon = () => {
		return (
			<View
				className={cn(
					'border  py-[1] px-[2] rounded-md',
					colorScheme === 'dark' ? 'border-white' : 'border-patchwork-dark-100',
				)}
			>
				<ThemeText size={'xs_12'} className="font-NewsCycle_Bold">
					GIF
				</ThemeText>
			</View>
		);
	};

	return (
		<View className="flex-row items-center pt-2 ml-2">
			<View className="flex-row flex-1">
				<Pressable
					className={'mr-4'}
					disabled={disabledMedia}
					onPress={() => {
						onToggleMediaModal();
					}}
					children={
						<FontAwesomeIcon
							icon={AppIcons.images}
							size={21}
							color={generateAppopirateColor({
								light: disabledMedia ? colors.slate[300] : colors.slate[500],
								dark: disabledMedia ? '#6D7276' : '#fff',
							})}
						/>
					}
				/>
				<Pressable
					disabled={disabledMedia}
					onPress={() => setGifModal(showGifModal => !showGifModal)}
					className={'mr-4'}
					children={getGifIcon()}
				/>
				<Pressable
					className={'mr-4'}
					children={
						<FontAwesomeIcon
							icon={AppIcons.emoji}
							size={21}
							color={generateAppopirateColor({
								light: disabledMedia ? colors.slate[300] : colors.slate[500],
								dark: disabledMedia ? '#6D7276' : '#fff',
							})}
						/>
					}
					onPress={() => setEmojiModalVisible(true)}
				/>
				<Pressable
					disabled={disabledPoll}
					onPress={onPressPoll}
					className={'mr-3'}
					children={
						<FontAwesomeIcon
							icon={AppIcons.poll}
							size={21}
							color={getStrokeColorForPoll()}
						/>
					}
				/>
			</View>
			<Button
				variant="outline"
				disabled={
					(composeState.text.count == 0 || isPending) &&
					composeState.media_ids?.length === 0
				}
				onPress={handlePublish}
				className="rounded-2xl h-7"
				size="sm"
			>
				{isPending ? (
					<Flow size={20} color={'#fff'} className="my-2" />
				) : (
					<ThemeText className="m-0" size="xs_12">
						Publish
					</ThemeText>
				)}
			</Button>
			<GifPickerModal
				visibility={showGifModal}
				onClose={() => setGifModal(false)}
			/>
			{isEmojiModalVisible && (
				<EmojiModal
					isVisible={isEmojiModalVisible}
					onClose={() => setEmojiModalVisible(false)}
				/>
			)}
			<ThemeModal
				type="custom"
				position="bottom"
				visible={mediaModal}
				onClose={onToggleMediaModal}
				customModalContainterStyle={{
					bottom: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				<ManageAttachmentModal {...{ onToggleMediaModal }} />
			</ThemeModal>
		</View>
	);
};

export default ReplyActionBar;
