import { queryClient } from '@/App';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import ImageCard from '@/components/atoms/compose/ImageCard/ImageCard';
import AddMoreParticipantModal from '@/components/molecules/conversations/AddMoreParticipantModal/AddMoreParticipantModal';
import GroupConversationsHeader from '@/components/molecules/conversations/GroupConversationHeader/GroupConversationHeader';
import GroupProfileInfo from '@/components/molecules/conversations/GroupProfileInfo/GroupProfileInfo';
import ConversationsHeader from '@/components/molecules/conversations/Header/Header';
import InitialMessageActionsBar from '@/components/molecules/conversations/InitialMessageActionBar/InitialMessageActionBar';
import MessageItem from '@/components/molecules/conversations/MessageItem/MessageItem';
import ProfileInfo from '@/components/molecules/conversations/ProfileInfo/ProfileInfo';
import ChatParticipants from '@/components/organisms/conversations/ChatParticipants/ChatParticipants';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { ComposeStatusProvider } from '@/context/composeStatusContext/composeStatus.context';
import { useGradualAnimation } from '@/hooks/custom/useGradualAnimation';
import { ConversationsStackScreenProps } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { checkIsAccountVerified } from '@/util/helper/helper';
import { PlusIcon } from '@/util/svg/icon.conversations';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const InitiateNewConversation = ({
	navigation,
	route,
}: ConversationsStackScreenProps<'InitiateNewConversation'>) => {
	const { t } = useTranslation();
	const { account, allowAddMoreParticipant } = route.params;
	const { height, progress } = useGradualAnimation();
	const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
	const [totalMsgList, setTotalMsgList] = useState<Patchwork.Status[]>();
	const [receipantList, setReceipantList] = useState<Patchwork.Account[]>([
		account,
	]);
	const isGroupChat = receipantList && receipantList.length > 1;
	const [openRecipantModal, setRecipantModal] = useState(false);
	const [showChatParticipantList, setShowChatParticipantList] = useState(false);
	const insets = useSafeAreaInsets();
	const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

	useEffect(() => {
		return () => {
			queryClient.invalidateQueries({ queryKey: ['conversations'] });
			queryClient.invalidateQueries({
				queryKey: ['user-conversation', { id: account.id }],
			});
		};
	}, []);

	const imageCardWrapperStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		height: progress.value < 0.5 ? 0 : 'auto',
	}));

	const virtualKeyboardContainerStyle = useAnimatedStyle(() => {
		const keyboardHeight = Math.abs(height.value);
		const hasBottomTabBar = tabBarHeight > 0;

		let targetHeight = 0;
		if (keyboardHeight > 0) {
			targetHeight = hasBottomTabBar
				? Math.max(0, keyboardHeight - tabBarHeight)
				: Platform.OS === 'ios'
				? keyboardHeight
				: Math.max(0, keyboardHeight - insets.bottom);
		} else {
			targetHeight = 0;
		}

		return {
			height: targetHeight,
		};
	});

	const handleSetCurrentMessageId = useCallback((id: string | null) => {
		setCurrentMessageId(id);
	}, []);

	const isAccVerified = useMemo(
		() => checkIsAccountVerified(account?.fields),
		[account?.fields],
	);

	const onAddNewParticipant = (newParticipant: Patchwork.Account) => {
		setReceipantList(prev => [...prev, newParticipant]);
	};

	const onRemovePreviousParticipant = (perticipant: Patchwork.Account) => {
		setReceipantList(prevParticipantList =>
			prevParticipantList.filter(item => item.id !== perticipant.id),
		);
	};

	return (
		<SafeScreen>
			<ComposeStatusProvider type="chat">
				<View className="flex-1">
					{isGroupChat ? (
						<GroupConversationsHeader
							onPressBackButton={() => navigation.goBack()}
							chatParticipants={receipantList}
							onPress={() => setShowChatParticipantList(true)}
						/>
					) : (
						<ConversationsHeader
							onPressBackButton={() => {
								navigation.goBack();
							}}
							chatParticipant={account}
							isAccountVerified={isAccVerified}
						/>
					)}
					{!totalMsgList && allowAddMoreParticipant && (
						<View className="px-5 py-2 bg-patchwork-light-100 dark:bg-patchwork-dark-50 -mt-3 flex-row">
							<View className="flex-1 flex-row items-center">
								<ThemeText size={'xs_12'} className="dark:text-gray-300">
									{t('conversation.to')}::
								</ThemeText>
								<View className="flex-row flex-wrap">
									{receipantList.map((item, idx) => {
										return (
											<View key={idx} className="ml-2">
												<ThemeText emojis={item.emojis}>
													{item.display_name || item.username},
												</ThemeText>
											</View>
										);
									})}
								</View>
							</View>
							<View>
								<Pressable
									className="rounded-full bg-slate-50 p-1 active:opacity-80"
									onPress={() => {
										setRecipantModal(true);
									}}
								>
									<PlusIcon
										width={10}
										height={10}
										fill={customColor['patchwork-dark-100']}
									/>
								</Pressable>
							</View>
						</View>
					)}
					<View style={{ flex: 1 }}>
						<FlashList
							ListHeaderComponent={
								isGroupChat ? (
									<GroupProfileInfo
										userInfo={receipantList}
										onPress={() => setShowChatParticipantList(true)}
									></GroupProfileInfo>
								) : (
									<ProfileInfo
										userInfo={account}
										isAccountVerified={isAccVerified}
									/>
								)
							}
							maintainVisibleContentPosition={{
								autoscrollToBottomThreshold: 0.2,
								startRenderingFromBottom: true,
							}}
							data={totalMsgList}
							renderItem={({ item, index }) => {
								const previousMsg =
									index > 0 && totalMsgList
										? totalMsgList[index - 1]
										: undefined;
								const nextMsg =
									totalMsgList && index < totalMsgList.length - 1
										? totalMsgList[index + 1]
										: undefined;

								return (
									<MessageItem
										message={item}
										isGroupChat={!!isGroupChat}
										previousMsg={previousMsg}
										nextMsg={nextMsg}
										currentMessageId={currentMessageId}
										handlePress={handleSetCurrentMessageId}
									/>
								);
							}}
							showsVerticalScrollIndicator={false}
						/>
					</View>

					<Animated.View
						style={imageCardWrapperStyle}
						className="bg-slate-200 dark:bg-patchwork-grey-70"
					>
						<ImageCard composeType="chat" />
					</Animated.View>
					<InitialMessageActionsBar
						account={account}
						lastMsg={
							totalMsgList ? totalMsgList[totalMsgList.length - 1] : undefined
						}
						changeTotalMsgList={(status: Patchwork.Status) => {
							setTotalMsgList(prev => (prev ? [...prev, status] : [status]));
						}}
						totalMentionUserList={receipantList}
					/>
					<Animated.View style={virtualKeyboardContainerStyle} />
				</View>
				{openRecipantModal && (
					<AddMoreParticipantModal
						onCloseThemeModal={() => {
							setRecipantModal(false);
						}}
						onAddNewParticipant={onAddNewParticipant}
						previousSelectedUserList={receipantList}
						onRemovePreviousParticipant={onRemovePreviousParticipant}
					/>
				)}
				<ChatParticipants
					openThemeModal={showChatParticipantList}
					data={receipantList}
					onClose={() => setShowChatParticipantList(false)}
				/>
			</ComposeStatusProvider>
		</SafeScreen>
	);
};

export default InitiateNewConversation;
