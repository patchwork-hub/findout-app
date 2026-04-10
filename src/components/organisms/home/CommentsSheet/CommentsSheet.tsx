import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { View, Keyboard, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRotateRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
	BottomSheetModal,
	BottomSheetFlatList,
	BottomSheetFooter,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useGetWordpressPostById } from '@/hooks/queries/wpFeed.queries';
import { useComposeMutation } from '@/hooks/mutations/feed.mutation';
import { useFeedRepliesQuery } from '@/hooks/queries/feed.queries';
import { useQuery } from '@tanstack/react-query';
import { searchAllFn } from '@/services/hashtag.service';
import customColor from '@/util/constant/color';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { CommentItem, ProcessedComment } from './CommentItem';
import { CommentFooter } from './CommentFooter';
import { useThreadedComments } from './hooks/useThreadedComments';
import { Flow } from 'react-native-animated-spinkit';
import { queryClient } from '@/App';
import { useAuthStore } from '@/store/auth/authStore';

export const CommentsSheet = () => {
	const { colorScheme } = useColorScheme();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const userInfo = useAuthStore(state => state.userInfo);
	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
	const snapPoints = useMemo(() => ['65%', '85%'], []);

	const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
	const [replyToName, setReplyToName] = useState<string | null>(null);
	const [statusSubmitLoading, setStatusSubmitLoading] = useState(false);

	const {
		isCommentSheetOpen: isOpen,
		closeComments,
		commentPostId: postId,
	} = useLiveVideoFeedStore();

	const { data: wpPost, isLoading: isWpPostLoading } = useGetWordpressPostById(
		postId || 0,
		isOpen && !!postId,
	);

	const { data: mastodonSearchResult, isLoading: isSearchingPost } = useQuery({
		queryKey: ['search-all', { q: wpPost?.link || '', resolve: true }] as any,
		queryFn: searchAllFn,
		enabled: !!wpPost?.link,
	});

	const mastodonStatus = mastodonSearchResult?.statuses?.[0];
	const mastodonStatusId = mastodonStatus?.id;

	const {
		data: commentsData,
		isFetching,
		isLoading: isRepliesLoading,
		refetch,
	} = useFeedRepliesQuery({
		id: mastodonStatusId || '',
		domain_name: process.env.API_URL || '',
		options: { enabled: !!mastodonStatusId },
	});

	const comments = useMemo(() => {
		if (!commentsData?.descendants) return [];
		return commentsData.descendants;
	}, [commentsData]);

	const replyTargetComment = useMemo(
		() => comments.find(c => c.id === replyToCommentId),
		[comments, replyToCommentId],
	);

	// Optimistic cache comments tracking replaced by direct cache update.
	const displayCommentCount = comments.length;

	const processedComments = useThreadedComments(comments);
	const isLoading = Boolean(
		isOpen &&
			(isWpPostLoading ||
				isSearchingPost ||
				isRepliesLoading ||
				(!wpPost && postId !== null) ||
				(!!wpPost?.link && !mastodonSearchResult) ||
				(!!mastodonStatusId && !commentsData)),
	);

	useEffect(() => {
		if (isOpen) {
			requestAnimationFrame(() => bottomSheetRef.current?.present());
		} else {
			requestAnimationFrame(() => bottomSheetRef.current?.dismiss());
			Keyboard.dismiss();
		}
	}, [isOpen]);

	const { mutate: postComment, isPending } = useComposeMutation({
		onMutate: async newCommentInput => {
			if (!mastodonStatusId) return;
			const queryKey = [
				'feed-replies',
				{ domain_name: process.env.API_URL || '', id: mastodonStatusId },
			];
			await queryClient.cancelQueries({ queryKey });
			const previousData = queryClient.getQueryData<{
				descendants: Patchwork.Status[];
				ancestors: Patchwork.Status[];
			}>(queryKey);

			const optimisticComment: Patchwork.Status = {
				id: `optimistic-${Date.now()}`,
				content: newCommentInput.status,
				created_at: new Date().toISOString(),
				account: userInfo as any,
				in_reply_to_id: replyToCommentId || mastodonStatusId,
				favourited: false,
				favourites_count: 0,
				reblogs_count: 0,
				replies_count: 0,
				// populate minimal fields
			} as any;

			if (previousData) {
				queryClient.setQueryData(queryKey, {
					...previousData,
					descendants: [...(previousData.descendants || []), optimisticComment],
				});
			}

			return { previousData, queryKey };
		},
		onError: (err, newCommentInput, context: any) => {
			if (context?.previousData) {
				queryClient.setQueryData(context.queryKey, context.previousData);
			}
		},
		onSettled: (data, error, variables, context: any) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	const handleSheetChanges = useCallback(
		(index: number) => {
			setCurrentSnapIndex(index);
			if (index === -1) {
				closeComments();
				setReplyToCommentId(null);
				setReplyToName(null);
				Keyboard.dismiss();
			}
		},
		[closeComments],
	);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
				pressBehavior="close"
			/>
		),
		[],
	);

	const handleSubmitComment = useCallback(
		async (text: string) => {
			setStatusSubmitLoading(true);
			try {
				let targetMastodonId = replyToCommentId || mastodonStatusId;

				if (targetMastodonId) {
					postComment({
						status: text,
						in_reply_to_id: targetMastodonId,
						visibility: 'public' as const,
						language: 'en',
						poll: null,
						media_ids: [],
					});
					setReplyToCommentId(null);
					setReplyToName(null);
				} else {
					console.log('Could not resolve Mastodon status ID to comment on.');
				}
			} catch (err) {
				console.error('Error finding parent comment to reply', err);
			} finally {
				setStatusSubmitLoading(false);
			}
		},
		[replyToCommentId, mastodonStatusId, postComment],
	);

	const renderFooter = useCallback(
		(props: any) => {
			const isSubmitting = isPending || statusSubmitLoading;

			return (
				<BottomSheetFooter {...props} bottomInset={0}>
					{replyTargetComment && (
						<View className="px-4 pt-2 pb-2 border-t-[0.5px] border-[#ccc] bg-[#fff] dark:bg-[#121212] flex-row justify-between items-center">
							<ThemeText className="text-xs text-patchwork-primary font-bold">
								Replying to{' '}
								{replyToName ||
									replyTargetComment.account?.display_name ||
									replyTargetComment.account?.username}
							</ThemeText>
							<ThemeText
								className="text-xs text-gray-500 px-2 py-1"
								onPress={() => {
									setReplyToCommentId(null);
									setReplyToName(null);
								}}
							>
								Cancel
							</ThemeText>
						</View>
					)}
					<CommentFooter
						onFocusInput={() => bottomSheetRef.current?.snapToIndex(1)}
						bottomInset={insets.bottom}
						isLoading={isSubmitting || isSearchingPost}
						replyingToName={
							replyToName ||
							(replyTargetComment
								? replyTargetComment.account?.display_name ||
								  replyTargetComment.account?.username
								: null)
						}
						onSubmit={handleSubmitComment}
					/>
				</BottomSheetFooter>
			);
		},
		[
			insets.bottom,
			isPending,
			isSearchingPost,
			replyToCommentId,
			replyToName,
			replyTargetComment,
			statusSubmitLoading,
			handleSubmitComment,
		],
	);

	const renderItem = useCallback(
		({ item, index }: { item: ProcessedComment; index: number }) => {
			const nextDepth = processedComments[index + 1]?.depth || 0;
			const isLastInThread = nextDepth === 0;

			return (
				<CommentItem
					item={item}
					isLastInThread={isLastInThread}
					onReply={mentionName => {
						setReplyToCommentId(item.id);
						setReplyToName(mentionName);
						bottomSheetRef.current?.snapToIndex(1);
					}}
				/>
			);
		},
		[processedComments],
	);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			enablePanDownToClose
			enableOverDrag={false}
			onChange={handleSheetChanges}
			onDismiss={closeComments}
			backgroundStyle={{
				backgroundColor: isDark ? customColor['patchwork-dark-100'] : 'white',
			}}
			handleIndicatorStyle={{
				backgroundColor:
					currentSnapIndex === 1
						? isDark
							? '#000'
							: '#fff'
						: isDark
						? '#555'
						: '#ccc',
			}}
			keyboardBehavior="extend"
			android_keyboardInputMode="adjustResize"
			keyboardBlurBehavior="restore"
			footerComponent={renderFooter}
			backdropComponent={renderBackdrop}
		>
			<View className="flex-row justify-between items-center px-4 py-3 relative">
				<Pressable
					onPress={closeComments}
					className="w-8 h-8 items-start justify-center active:opacity-50"
					hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
				>
					<FontAwesomeIcon
						icon={faXmark}
						color={isDark ? '#aaa' : '#555'}
						size={20}
					/>
				</Pressable>
				<ThemeText
					className="font-bold text-sm text-center"
					style={{ color: isDark ? 'white' : 'black' }}
				>
					{isLoading ? (
						'Loading...'
					) : (
						<>
							{mastodonStatus?.replies_count ?? comments.length} comment
							{(mastodonStatus?.replies_count ?? comments.length) !== 1
								? 's'
								: ''}
						</>
					)}
				</ThemeText>
				<Pressable
					onPress={() => refetch()}
					className="w-8 h-8 items-end justify-center active:opacity-50"
				>
					{isFetching ? (
						<ActivityIndicator size="small" color={isDark ? '#aaa' : '#555'} />
					) : (
						<FontAwesomeIcon
							icon={faRotateRight}
							color={isDark ? '#aaa' : '#555'}
							size={16}
						/>
					)}
				</Pressable>
			</View>

			<BottomSheetFlatList
				data={processedComments}
				showsVerticalScrollIndicator={false}
				keyExtractor={(item: ProcessedComment) => item.id.toString()}
				renderItem={renderItem}
				keyboardShouldPersistTaps="handled"
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={5}
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingBottom: Math.max(120, insets.bottom + 150),
				}}
				ListEmptyComponent={
					<View className="h-[500] w-full items-center justify-center">
						{isLoading ? (
							<Flow size={30} color={customColor['patchwork-primary']} />
						) : (
							<ListEmptyComponent title="No comments found" />
						)}
					</View>
				}
			/>
		</BottomSheetModal>
	);
};
