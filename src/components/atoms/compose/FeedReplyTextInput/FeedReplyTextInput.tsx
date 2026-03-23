import TextInput from '../../common/TextInput/TextInput';
import { RefObject, useEffect, useRef, useState } from 'react';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { FormattedText } from '../FormattedText/FormattedText';
import {
	useStatusReplyAction,
	useStatusReplyStore,
} from '@/store/compose/statusReply/statusReplyStore';
import { Platform, TextInput as RNTextInput, View } from 'react-native';
import Graphemer from 'graphemer';
import { useMaxCount } from '@/hooks/custom/useMaxCount';
import { useCursorStore } from '@/store/compose/cursorStore/cursorStore';
import { extractMentionsFromHTML } from '@/util/helper/extractMessage';
import { useAuthStore } from '@/store/auth/authStore';
import { truncateStr } from '@/util/helper/helper';
import customColor from '@/util/constant/color';
import { debounce } from 'lodash';
import useDebounce from '@/hooks/custom/useDebounce';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { runOnJS } from 'react-native-worklets';

const splitter = new Graphemer();

type ReplyInputProps = {
	username: string;
	progress: SharedValue<number>;
	autoFocus: boolean;
	feedDetailStatus: Patchwork.Status;
};

const FeedReplyTextInput = ({
	username,
	progress,
	autoFocus,
	feedDetailStatus,
}: ReplyInputProps) => {
	const { t } = useTranslation();
	const [isKeyboardOpen, setKeyboardOpen] = useState(autoFocus);
	const { composeState, composeDispatch } = useComposeStatus();
	const { colorScheme } = useColorScheme();
	const { currentFocusStatus } = useStatusReplyStore();
	const { setTextInputRef } = useStatusReplyAction();
	const inputRef = useRef<RNTextInput>(null);
	const maxStatusLength = useMaxCount();
	const { setSelectionStart } = useCursorStore();
	const { userOriginInstance, userInfo } = useAuthStore();
	const selectionStartRef = useRef(0);
	const previousKeyboardState = useRef(autoFocus);
	const [baseMentionText, setBaseMentionText] = useState('');
	const debounce = useDebounce();

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

	const isMentionWord = (text: string, position: number) => {
		if (position === 0) return false;
		let start = position - 1;
		while (start >= 0 && !/\s/.test(text[start])) {
			start--;
		}
		start++;
		const word = text.substring(start, position);
		return word.startsWith('@') && word.length > 1;
	};

	useEffect(() => {
		setTextInputRef(inputRef as RefObject<RNTextInput>);
	}, [setTextInputRef]);

	useEffect(() => {
		if (!currentFocusStatus) {
			return;
		}
		const { account, content } = currentFocusStatus;
		const currentUserAcct = `@${userInfo?.acct}`;
		const focusedUserAcct = `@${account.acct}`;
		const allMentions = extractMentionsFromHTML(content, userOriginInstance);
		const extraMentions = allMentions
			.filter(
				mention => mention !== focusedUserAcct && mention !== currentUserAcct,
			)
			.join(' ');
		const replyToUser = account.acct === userInfo?.acct ? '' : focusedUserAcct;
		const newRawText = `${replyToUser} ${extraMentions}`.trim() + ' ';
		setBaseMentionText(newRawText);
		const initialText = autoFocus ? newRawText : '';
		composeDispatch({
			type: 'text',
			payload: {
				count: splitter.countGraphemes(initialText),
				raw: initialText,
			},
		});
		composeDispatch({
			type: 'disableUserSuggestionsModal',
			payload: true,
		});
	}, [
		currentFocusStatus,
		autoFocus,
		userInfo,
		userOriginInstance,
		composeDispatch,
	]);

	const handleFocusChange = (isFocused: boolean) => {
		setKeyboardOpen(isFocused);

		if (isFocused) {
			if (composeState.text.raw.trim() == '' && baseMentionText.trim()) {
				const charCount = splitter.countGraphemes(baseMentionText);
				debounce(() => {
					composeDispatch({
						type: 'text',
						payload: {
							count: charCount,
							raw: baseMentionText,
						},
					});
					composeDispatch({
						type: 'disableUserSuggestionsModal',
						payload: true,
					});
				}, 50);
			}
		} else {
			if (
				composeState.text.raw.trim() === baseMentionText.trim() ||
				composeState.text.raw.trim() === ''
			) {
				composeDispatch({
					type: 'text',
					payload: {
						count: 0,
						raw: '',
					},
				});
			}
		}
	};

	useAnimatedReaction(
		() => progress.value,
		(currentValue, previousValue) => {
			const isFocusedNow = currentValue > 0.7;

			if (previousKeyboardState.current === isFocusedNow) {
				return;
			}
			previousKeyboardState.current = isFocusedNow;

			runOnJS(handleFocusChange)(isFocusedNow);
		},
		[baseMentionText, composeState.text.raw],
	);

	return (
		<View className="bg-slate-100 dark:bg-[#121212] border border-white dark:border-[#121212]  rounded-lg">
			<RNTextInput
				ref={inputRef}
				multiline
				placeholder={
					isKeyboardOpen
						? t('timeline.type_your_reply')
						: `${t('timeline.reply_to')} ${truncateStr(
								currentFocusStatus?.account.acct ?? '',
								20,
						  )}`
				}
				placeholderTextColor="#A0A0A0"
				maxLength={maxStatusLength}
				onChangeText={text => {
					const cursorPos = selectionStartRef.current;
					const isMention = isMentionWord(text, cursorPos);
					composeDispatch({
						type: 'disableUserSuggestionsModal',
						payload: !isMention,
					});
					composeDispatch({
						type: 'text',
						payload: {
							count: splitter.countGraphemes(text),
							raw: text,
						},
					});
					if (!isMention) {
						composeDispatch({
							type: 'currentMention',
							payload: undefined,
						});
					}
				}}
				selectionColor={selectionColor}
				onSelectionChange={event => {
					const start = event.nativeEvent.selection.start;
					setSelectionStart(start);
					selectionStartRef.current = start;
				}}
				autoFocus={autoFocus}
				autoCapitalize="sentences"
				spellCheck
				autoCorrect={false}
				className="text-white  font-Inter_Regular opacity-80 text-base leading-6 p-3 min-h-[48px] max-h-44"
				textAlignVertical="top"
			>
				<FormattedText text={composeState.text.raw} />
			</RNTextInput>
		</View>
	);
};

export default FeedReplyTextInput;
