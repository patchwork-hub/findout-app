import React, { useCallback, useMemo, useState } from 'react';
import { ConversationsStackScreenProps } from '@/types/navigation';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import ConversationsHeader from '@/components/molecules/conversations/Header/Header';
import MessageActionsBar from '@/components/molecules/conversations/MessageActionsBar/MessageActionsBar';
import { ComposeStatusProvider } from '@/context/composeStatusContext/composeStatus.context';
import { FlatList, RefreshControl } from 'react-native';
import customColor from '@/util/constant/color';
import MessageItem from '@/components/molecules/conversations/MessageItem/MessageItem';
import { Flow } from 'react-native-animated-spinkit';
import ProfileInfo from '@/components/molecules/conversations/ProfileInfo/ProfileInfo';
import ImageCard from '@/components/atoms/compose/ImageCard/ImageCard';
import { DownIcon } from '@/util/svg/icon.conversations';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import GroupConversationsHeader from '@/components/molecules/conversations/GroupConversationHeader/GroupConversationHeader';
import GroupProfileInfo from '@/components/molecules/conversations/GroupProfileInfo/GroupProfileInfo';
import ChatParticipants from '@/components/organisms/conversations/ChatParticipants/ChatParticipants';
import { cn } from '@/util/helper/twutil';
import { useConversationDetail } from '@/hooks/custom/useConversationDetail';

const ConversationDetail = ({
	navigation,
	route,
}: ConversationsStackScreenProps<'ConversationDetail'>) => {
	const {
		t,
		colorScheme,
		initialLastMsgId,
		isFromProfile,
		refresh,
		currentMessageId,
		showScrollToBottom,
		showChatParticipantList,
		setShowChatParticipantList,
		currentConversation,
		receiver,
		isGroupChat,
		totalMsgList,
		isUserAccDeactivated,
		isAccVerified,
		isLoading,
		listRef,
		handleRefresh,
		handleBackPress,
		handleSetCurrentMessageId,
		handleScrollToBottom,
		handleScroll,
		virtualKeyboardContainerStyle,
		imageCardWrapperStyle,
	} = useConversationDetail({ navigation, route });

	if (isLoading && !totalMsgList.length) {
		return (
			<SafeScreen isBottomSafe={false}>
				{isGroupChat ? (
					<GroupConversationsHeader
						onPressBackButton={handleBackPress}
						chatParticipants={currentConversation?.accounts || []}
						onPress={() => setShowChatParticipantList(true)}
					/>
				) : (
					<ConversationsHeader
						onPressBackButton={handleBackPress}
						chatParticipant={receiver}
						isAccountVerified={isAccVerified}
					/>
				)}
				<View className="flex-1 items-center justify-center">
					<Flow
						size={25}
						color={
							colorScheme === 'dark'
								? customColor['patchwork-primary-dark']
								: customColor['patchwork-primary']
						}
					/>
				</View>
			</SafeScreen>
		);
	}

	return (
		<SafeScreen>
			<ComposeStatusProvider type="chat">
				<View className="flex-1">
					{isGroupChat ? (
						<GroupConversationsHeader
							onPressBackButton={handleBackPress}
							chatParticipants={currentConversation?.accounts || []}
							onPress={() => setShowChatParticipantList(true)}
						/>
					) : (
						<ConversationsHeader
							onPressBackButton={handleBackPress}
							chatParticipant={receiver}
							isAccountVerified={isAccVerified}
						/>
					)}
					{isUserAccDeactivated && (
						<View
							className=" p-3 border-l-4 border-l-patchwork-red-50"
							style={{
								backgroundColor: customColor['patchwork-red-600'],
							}}
						>
							<ThemeText>{t('conversation.user_acc_deleted')}</ThemeText>
						</View>
					)}

					{initialLastMsgId ? (
						<View style={{ flex: 1 }}>
							{totalMsgList && !isLoading && receiver ? (
								<FlatList
									ListFooterComponent={
										isGroupChat ? (
											<GroupProfileInfo
												userInfo={currentConversation?.accounts || []}
												onPress={() => setShowChatParticipantList(true)}
											></GroupProfileInfo>
										) : (
											<ProfileInfo
												userInfo={receiver}
												isAccountVerified={isAccVerified}
											/>
										)
									}
									ref={listRef}
									inverted
									extraData={currentMessageId}
									data={totalMsgList}
									keyExtractor={item => item.id.toString()}
									renderItem={({ item, index }) => {
										const previousMsg =
											index > 0 ? totalMsgList[index - 1] : undefined;
										const nextMsg =
											index < totalMsgList.length - 1
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
									refreshControl={
										<RefreshControl
											refreshing={refresh}
											tintColor={
												colorScheme === 'dark'
													? customColor['patchwork-light-900']
													: customColor['patchwork-dark-100']
											}
											onRefresh={handleRefresh}
										/>
									}
									onScroll={handleScroll}
								/>
							) : (
								<View className="flex-1 items-center justify-center">
									<Flow
										size={25}
										color={
											colorScheme === 'dark'
												? customColor['patchwork-primary-dark']
												: customColor['patchwork-primary']
										}
									/>
								</View>
							)}
							{showScrollToBottom && (
								<Pressable
									onPress={handleScrollToBottom}
									className={cn(
										'w-10 h-10 items-center justify-center absolute z-10 bottom-5 right-5 p-3 rounded-full',
										colorScheme === 'dark'
											? 'bg-patchwork-grey-70'
											: 'bg-patchwork-light-900 border border-slate-200',
									)}
								>
									<DownIcon fill={colorScheme === 'dark' ? '#fff' : '#000'} />
								</Pressable>
							)}
						</View>
					) : (
						<View className="flex-1"></View>
					)}
					<Animated.View
						style={imageCardWrapperStyle}
						className="bg-white dark:bg-patchwork-grey-70 shadow-lg dark:shadow-none"
					>
						<ImageCard composeType="chat" />
					</Animated.View>
					{totalMsgList.length > 0 && !isUserAccDeactivated && (
						<MessageActionsBar
							currentConversation={currentConversation}
							handleScroll={() => {}}
							currentFocusMsgId={initialLastMsgId}
							lastMsg={totalMsgList[0]!}
							isFromProfile={!!isFromProfile}
						/>
					)}
					<Animated.View style={virtualKeyboardContainerStyle} />
				</View>
				<ChatParticipants
					openThemeModal={showChatParticipantList}
					data={currentConversation?.accounts!}
					onClose={() => setShowChatParticipantList(false)}
				/>
			</ComposeStatusProvider>
		</SafeScreen>
	);
};

export default ConversationDetail;
