import { Platform, TextInput, TextInputProps } from 'react-native';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { FormattedText } from '../FormattedText/FormattedText';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import Graphemer from 'graphemer';
import { useAuthStore } from '@/store/auth/authStore';
import { CHANNEL_INSTANCE, DEFAULT_INSTANCE } from '@/util/constant';
import { useCursorStore } from '@/store/compose/cursorStore/cursorStore';
import customColor from '@/util/constant/color';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { cn } from '@/util/helper/twutil';
import { View } from 'react-native';

const splitter = new Graphemer();

const ComposeTextInput = ({ ...textInputProps }: TextInputProps) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const iosTextColor =
		colorScheme === 'dark'
			? customColor['patchwork-soft-primary']
			: customColor['patchwork-primary'];
	const androidTextColor =
		colorScheme === 'dark'
			? 'rgba(242, 237, 232, 0.3)'
			: 'rgba(48, 56, 61, 0.3)';

	const inputColor = useAppropiateColorHash(
		'patchwork-light-900',
		'patchwork-dark-100',
	);
	const selectionColor =
		Platform.OS === 'android' ? androidTextColor : iosTextColor;
	const { composeState, composeDispatch } = useComposeStatus();
	const inputRef = useRef<TextInput>(null);
	const spoilerRef = useRef<TextInput>(null);
	const { setSelectionStart } = useCursorStore();
	const { userOriginInstance } = useAuthStore();
	const isMastodonScheduleActive =
		!!composeState.schedule?.schedule_detail_id &&
		userOriginInstance !== DEFAULT_INSTANCE;

	const handleChangeText = (text: string) => {
		const textLength = splitter.countGraphemes(text);
		composeDispatch({
			type: 'text',
			payload: { count: textLength, raw: text },
		});

		if (composeState.disableUserSuggestionsModal) {
			composeDispatch({
				type: 'disableUserSuggestionsModal',
				payload: false,
			});
		}

		if (composeState.schedule?.forceCloseUserModalOnScheduleUpdate) {
			composeDispatch({
				type: 'schedule',
				payload: {
					...composeState.schedule,
					forceCloseUserModalOnScheduleUpdate: false,
				},
			});
		}

		if (composeState.forceCloseUserModalOnDraft) {
			composeDispatch({
				type: 'draft',
				payload: {
					...composeState,
					forceCloseUserModalOnDraft: false,
				},
			});
		}
	};

	const handleChangeSpoiler = (text: string) => {
		composeDispatch({
			type: 'spoilerText',
			payload: text,
		});
	};

	useFocusEffect(
		useCallback(() => {
			inputRef.current?.focus();
		}, []),
	);

	useEffect(() => {
		if (composeState.sensitive) {
			spoilerRef.current?.focus();
		}
	}, [composeState.sensitive]);

	return (
		<View
			className={cn(
				'flex-col w-full',
				composeState.sensitive &&
					'border border-gray-200 dark:border-neutral-700 rounded-xl px-2 py-2',
			)}
		>
			{composeState.sensitive && (
				<View className="mb-2 border-b border-gray-200 dark:border-neutral-700 pb-1">
					<TextInput
						ref={spoilerRef}
						placeholder={t('compose.spoiler_placeholder')}
						placeholderTextColor={inputColor}
						selectionColor={selectionColor}
						onChangeText={handleChangeSpoiler}
						value={composeState.spoilerText}
						editable={!isMastodonScheduleActive}
						maxLength={80}
						className="text-base text-black dark:text-white opacity-70 py-2 px-2"
						returnKeyType="next"
						onSubmitEditing={() => inputRef.current?.focus()}
					/>
				</View>
			)}
			<TextInput
				placeholder={t('compose.placeholder')}
				ref={inputRef}
				multiline
				placeholderTextColor={inputColor}
				selectionColor={selectionColor}
				onChangeText={handleChangeText}
				onSelectionChange={event => {
					setSelectionStart(event.nativeEvent.selection.start);
				}}
				editable={!isMastodonScheduleActive}
				autoFocus
				autoCapitalize="sentences"
				autoCorrect={true}
				spellCheck={true}
				keyboardType="default"
				{...textInputProps}
				className="text-white font-Inter_Regular text-base opacity-80 py-3 px-2"
			>
				<FormattedText text={composeState.text.raw} />
			</TextInput>
		</View>
	);
};

export default ComposeTextInput;
