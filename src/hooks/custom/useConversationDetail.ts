import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { BackHandler, Platform } from 'react-native';
import { FlatList } from 'react-native';
import {
	useMessageListQuery,
	useSearchUsers,
} from '@/hooks/queries/conversations.queries';
import {
	markAsReadInConversationCache,
	removeOldMsgListCacheAndCreateNewOne,
} from '@/util/cache/conversation/conversationCahce';
import { useActiveConversationActions } from '@/store/conversation/activeConversationStore';
import { useMarkAsReadMutation } from '@/hooks/mutations/conversations.mutation';
import { checkIsAccountVerified } from '@/util/helper/helper';
import {
	BottomTabBarHeightContext,
	useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { ConversationsStackScreenProps } from '@/types/navigation';
import useGetCurrentConversation from './useGetCurrentConversation';
import { BottomBarHeight, useGradualAnimation } from './useGradualAnimation';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useConversationDetail = ({
	navigation,
	route,
}: ConversationsStackScreenProps<'ConversationDetail'>) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();
	const {
		id: initialLastMsgId,
		isFromExternalNotiAlert,
		isFromProfile,
	} = route.params;

	// Animations
	const { height, progress } = useGradualAnimation();

	// Local State
	const [refresh, setRefresh] = useState(false);
	const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);
	const [showChatParticipantList, setShowChatParticipantList] = useState(false);

	// Refs
	const listRef = useRef<FlatList<any>>(null);
	const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;

	// Fetch Data
	const { currentConversation, isLoading: isConversationLoading } =
		useGetCurrentConversation(initialLastMsgId, isFromExternalNotiAlert);

	const { removeActiveConversation } = useActiveConversationActions();

	const receiver = currentConversation?.accounts[0];
	const isGroupChat =
		currentConversation && currentConversation?.accounts?.length > 1;

	const {
		data: messageList,
		isLoading: isMessageLoading,
		refetch: refetchMessageList,
	} = useMessageListQuery({
		id: initialLastMsgId,
		options: {
			enabled: !!initialLastMsgId,
		},
	});

	const { data: participantInfo } = useSearchUsers({
		q: receiver?.acct || '',
		resolve: true,
		limit: 1,
		options: { enabled: !!messageList && !isGroupChat && !!receiver },
	});

	const { mutate: markConversationAsRead } = useMarkAsReadMutation({
		onSuccess: data => markAsReadInConversationCache(data.id),
	});

	// Handlers
	const handleRefresh = useCallback(async () => {
		setRefresh(true);
		try {
			await refetchMessageList();
		} catch (err) {
			console.error('Failed to refresh conversation:', err);
		} finally {
			setRefresh(false);
		}
	}, [refetchMessageList]);

	const handleBackPress = useCallback(() => {
		if (currentConversation?.id) {
			markConversationAsRead({ id: currentConversation.id });
		}
		navigation.goBack();
		return true;
	}, [navigation, currentConversation, markConversationAsRead]);

	const handleSetCurrentMessageId = useCallback((id: string | null) => {
		setCurrentMessageId(id);
	}, []);

	const handleScrollToBottom = () => {
		listRef.current?.scrollToOffset({ offset: 0, animated: true });
		setShowScrollToBottom(false);
	};

	const handleScroll = useCallback(
		(event: { nativeEvent: { contentOffset: { y: any } } }) => {
			const offsetY = event.nativeEvent.contentOffset.y;
			const showButtonThreshold = 200;

			setShowScrollToBottom(offsetY > showButtonThreshold);
		},
		[],
	);

	useEffect(() => {
		return () => {
			removeOldMsgListCacheAndCreateNewOne(initialLastMsgId);
			removeActiveConversation();
		};
	}, [initialLastMsgId]);

	useEffect(() => {
		if (currentConversation && currentConversation.unread) {
			markConversationAsRead({ id: currentConversation.id });
		}
	}, [currentConversation]);

	useEffect(() => {
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			handleBackPress,
		);
		return () => {
			backHandler.remove();
		};
	}, [navigation, currentConversation, isFromProfile, isFromExternalNotiAlert]);

	const totalMsgList = useMemo(() => {
		if (!messageList) {
			if (currentConversation?.last_status) {
				return [currentConversation.last_status];
			}
			return [];
		}
		const baseList = [...messageList.descendants, ...messageList.ancestors];
		const relevantMessage = currentConversation?.last_status;

		const isMessageMissing =
			relevantMessage && !baseList.some(msg => msg.id === relevantMessage.id);

		if (isMessageMissing) {
			const combinedList = [...baseList, relevantMessage];
			combinedList.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
			return combinedList;
		}

		return [relevantMessage, ...baseList];
	}, [messageList, currentConversation]);

	const isUserAccDeactivated =
		totalMsgList && participantInfo?.data && participantInfo?.data.length < 1;

	const isAccVerified = useMemo(
		() => checkIsAccountVerified(receiver?.fields),
		[receiver?.fields],
	);

	const virtualKeyboardContainerStyle = useAnimatedStyle(() => {
		const keyboardHeight = Math.abs(height.value);
		const hasBottomTabBar = tabBarHeight > 0;

		let targetHeight = 0;
		if (keyboardHeight > 0) {
			targetHeight = hasBottomTabBar
				? Math.max(0, keyboardHeight - tabBarHeight)
				: Math.max(0, keyboardHeight - insets.bottom);
		} else {
			targetHeight = 0;
		}

		return {
			height: targetHeight,
		};
	});

	const imageCardWrapperStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		height: progress.value < 0.5 ? 0 : 'auto',
	}));

	const isLoading = isConversationLoading || isMessageLoading;

	return {
		t,
		colorScheme,
		initialLastMsgId,
		isFromProfile,

		// State
		refresh,
		currentMessageId,
		showScrollToBottom,
		showChatParticipantList,
		setShowChatParticipantList,
		setShowScrollToBottom,

		// Data
		currentConversation,
		participantInfo,
		receiver,
		isGroupChat,
		totalMsgList,
		isUserAccDeactivated,
		isAccVerified,
		isLoading,

		// Refs
		listRef,

		// Handlers
		handleRefresh,
		handleBackPress,
		handleSetCurrentMessageId,
		handleScrollToBottom,
		handleScroll,

		// Styles
		virtualKeyboardContainerStyle,
		imageCardWrapperStyle,
	};
};
