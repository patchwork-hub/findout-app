import React, { useState } from 'react';
import {
	View,
	Pressable,
	Platform,
	TextInput as RNTextInput,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useComposeMutation } from '@/hooks/mutations/feed.mutation';
import Toast from 'react-native-toast-message';
import { prepareComposePayload } from '@/util/helper/compose';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import { FormattedText } from '@/components/atoms/compose/FormattedText/FormattedText';
import {
	useManageAttachmentActions,
	useManageAttachmentStore,
} from '@/store/compose/manageAttachments/manageAttachmentStore';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import ManageAttachmentModal from '@/components/organisms/compose/modal/ManageAttachment/MakeAttachmentModal';
import { cn } from '@/util/helper/twutil';
import { Flow } from 'react-native-animated-spinkit';
import { addAllUserAcctFromConversation } from '@/util/helper/helper';
import Graphemer from 'graphemer';
import EmojiModal from '@/components/organisms/compose/modal/Emoji/EmojiModal';
import GifPickerModal from '../../compose/GifPickerModal/GifPickerModal';
import customColor from '@/util/constant/color';
import { useCursorStore } from '@/store/compose/cursorStore/cursorStore';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

const splitter = new Graphemer();

type Props = {
	account: Patchwork.Account;
	lastMsg?: Patchwork.Status;
	changeTotalMsgList: (status: Patchwork.Status) => void;
	totalMentionUserList: Patchwork.Account[];
};

const InitialMessageActionsBar = ({
	lastMsg,
	account,
	changeTotalMsgList,
	totalMentionUserList,
}: Props) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const inputColor = useAppropiateColorHash(
		'patchwork-light-900',
		'patchwork-dark-100',
	);
	const iosTextColor =
		colorScheme === 'dark'
			? customColor['patchwork-soft-primary']
			: customColor['patchwork-primary'];
	const androidTextColor =
		colorScheme === 'dark'
			? 'rgba(242, 237, 232, 0.3)'
			: 'rgba(48, 56, 61, 0.3)';
	const selectionColor =
		Platform.OS === 'android' ? androidTextColor : iosTextColor;
	const { composeState, composeDispatch } = useComposeStatus();
	const { mediaModal, selectedMedia, progress } = useManageAttachmentStore();
	const { onToggleMediaModal, resetAttachmentStore } =
		useManageAttachmentActions();
	const [isEmojiModalVisible, setEmojiModalVisible] = useState(false);
	const isMediaUploading = progress.currentIndex !== undefined;
	const [showGifModal, setGifModal] = useState(false);
	const { setSelectionStart } = useCursorStore();

	const { mutate, isPending } = useComposeMutation({
		onSuccess: (response: Patchwork.Status) => {
			// changeLastMsgInConversationChache(response, currentConversation?.id);
			composeDispatch({ type: 'clear' });
			resetAttachmentStore();
			// playSound('send');
			changeTotalMsgList(response);
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const sendMessage = () => {
		if (
			(composeState.text.count <= composeState.maxCount &&
				composeState.text.raw.trim() !== '' &&
				composeState.text.raw &&
				!isPending) ||
			composeState.media_ids?.length !== 0
		) {
			let payload;
			payload = prepareComposePayload(composeState);
			payload.visibility = 'direct';
			payload.local_only = false;
			payload.in_reply_to_id = lastMsg?.id;
			payload.status = addAllUserAcctFromConversation(
				totalMentionUserList,
				payload.status,
			);
			mutate(payload);
		}
	};

	const handleChangeText = (text: string) => {
		composeDispatch({
			type: 'text',
			payload: {
				count: splitter.countGraphemes(text),
				raw: text,
			},
		});

		if (composeState.disableUserSuggestionsModal) {
			composeDispatch({
				type: 'disableUserSuggestionsModal',
				payload: false,
			});
		}
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
		<View>
			<View className="flex-row items-center p-2 pl-3 bg-white dark:bg-patchwork-dark-400 shadow-sm shadow-slate-500  min-h-[48px] max-h-48">
				<Pressable
					className={'mr-3'}
					onPress={() => {
						onToggleMediaModal();
					}}
					children={
						<FontAwesomeIcon
							icon={AppIcons.images}
							size={20}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
					}
				/>
				<Pressable
					disabled={
						selectedMedia.length == 4 || isMediaUploading || !!composeState.poll
					}
					className={`mr-3 ${
						selectedMedia.length === 4 ||
						isMediaUploading ||
						!!composeState.poll
							? 'opacity-50'
							: ''
					}`}
					onPress={() => setGifModal(showGifModal => !showGifModal)}
					children={getGifIcon()}
				/>
				<View className="flex-1 flex-row items-center bg-slate-100 dark:bg-patchwork-dark-100 border border-white dark:border-patchwork-dark-50  rounded-lg">
					<RNTextInput
						multiline
						textAlignVertical="top"
						placeholder={t('conversation.your_message')}
						maxLength={4000}
						placeholderTextColor={inputColor}
						selectionColor={selectionColor}
						onChangeText={handleChangeText}
						onSelectionChange={event => {
							setSelectionStart(event.nativeEvent.selection.start);
						}}
						autoCapitalize="sentences"
						autoComplete="off"
						autoCorrect={false}
						className="flex-1 text-white font-Inter_Regular opacity-80 text-base leading-6 p-3 min-h-[48px] max-h-48"
					>
						<FormattedText text={composeState.text.raw} />
					</RNTextInput>
					<Pressable
						onPress={() => setEmojiModalVisible(true)}
						className="px-1.5 right-1 z-10"
					>
						<FontAwesomeIcon
							icon={AppIcons.emoji}
							size={20}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
					</Pressable>
				</View>
				<Pressable
					hitSlop={10}
					disabled={
						!composeState.text.raw &&
						composeState.text.raw.trim() === '' &&
						composeState.media_ids?.length === 0
					}
					onPress={sendMessage}
					className={cn(
						'rounded-full ml-2 p-1.5 w-10 h-10 flex items-center justify-center',
						(composeState.text.raw && composeState.text.raw.trim() !== '') ||
							composeState.media_ids?.length !== 0
							? ' border-white'
							: 'border-patchwork-grey-100 ',
					)}
				>
					{isPending ? (
						<Flow
							size={15}
							color={colorScheme === 'dark' ? '#fff' : '#000'}
							className="my-3 mx-5"
						/>
					) : (
						<FontAwesomeIcon
							icon={AppIcons.sendMessage}
							size={19}
							color={
								composeState.text.raw?.trim() ||
								composeState.media_ids?.length !== 0
									? colorScheme === 'dark'
										? '#fff'
										: '#000'
									: customColor['patchwork-grey-100']
							}
							style={{ transform: [{ rotate: '45deg' }], marginRight: 5 }}
						/>
					)}
				</Pressable>
			</View>
			{isEmojiModalVisible && (
				<EmojiModal
					isVisible={isEmojiModalVisible}
					onClose={() => setEmojiModalVisible(false)}
				/>
			)}
			<GifPickerModal
				visibility={showGifModal}
				onClose={() => setGifModal(false)}
			/>
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
				<ManageAttachmentModal {...{ onToggleMediaModal }} hideVideoUpload />
			</ThemeModal>
		</View>
	);
};

export default InitialMessageActionsBar;
