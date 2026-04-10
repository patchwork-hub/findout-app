import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { View, Keyboard, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
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
import {
	useGetWordpressCommentsByPostIdPaginated,
	useGetWordpressPostById,
} from '@/hooks/queries/wpFeed.queries';
import { useComposeMutation } from '@/hooks/mutations/feed.mutation';
import { useQuery } from '@tanstack/react-query';
import { searchAllFn } from '@/services/hashtag.service';
import {
	handleOptimisticWPCommentAdd,
	handleOptimisticWPCommentError,
} from '@/util/cache/wpFeed/wpCommentCache';
import customColor from '@/util/constant/color';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { CommentItem, ProcessedComment } from './CommentItem';
import { CommentFooter } from './CommentFooter';
import { useThreadedComments } from './hooks/useThreadedComments';
import { Flow } from 'react-native-animated-spinkit';

export const CommentsSheet = () => {
	const { colorScheme } = useColorScheme();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
	const snapPoints = useMemo(() => ['65%', '90%'], []);

	const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
	const [replyToName, setReplyToName] = useState<string | null>(null);
	const [statusSubmitLoading, setStatusSubmitLoading] = useState(false);

	const submitContextRef = useRef<{ replyToId: number | null }>({
		replyToId: null,
	});

	const {
		isCommentSheetOpen: isOpen,
		closeComments,
		commentPostId: postId,
		optimisticComments: allOptimisticComments,
	} = useLiveVideoFeedStore();

	const {
		data: commentsData,
		isFetching,
		isLoading,
		refetch,
		fetchNextPage,
		hasNextPage,
	} = useGetWordpressCommentsByPostIdPaginated(postId || 0, isOpen && !!postId);

	const comments = useMemo(() => {
		if (!commentsData) return [];
		return commentsData.pages.flatMap(page => page.comments);
	}, [commentsData]);

	const { data: wpPost } = useGetWordpressPostById(
		postId || 0,
		isOpen && !!postId,
	);

	const { data: mastodonSearchResult, isLoading: isSearchingPost } = useQuery({
		queryKey: ['search-all', { q: wpPost?.link || '', resolve: true }] as any,
		queryFn: searchAllFn,
		enabled: !!wpPost?.link,
	});

	const mastodonStatusId = mastodonSearchResult?.statuses?.[0]?.id;

	// for recently made comment cache,
	const mergedComments = useMemo(() => {
		const opComments = allOptimisticComments[postId || 0] || [];

		// filter out recently made comments (cache) to avaoid duplicates
		const activeOpComments = opComments.filter(
			oc =>
				!comments.some(c => {
					const cText = c.content.rendered
						.replace(/<[^>]*>?/gm, '')
						.replace(/\s+/g, ' ')
						.trim();
					const ocText = oc.content.rendered
						.replace(/<[^>]*>?/gm, '')
						.replace(/\s+/g, ' ')
						.trim();
					return (
						(c.author === oc.author || c.author_name === oc.author_name) &&
						cText === ocText
					);
				}),
		);
		return [...comments, ...activeOpComments];
	}, [comments, allOptimisticComments, postId]);

	const replyTargetComment = useMemo(
		() => mergedComments.find(c => c.id === replyToCommentId),
		[mergedComments, replyToCommentId],
	);

	const { data: replyTargetMastodonSearchResult, isLoading: isSearchingReply } =
		useQuery({
			queryKey: [
				'search-all',
				{ q: replyTargetComment?.link || '', resolve: true },
			] as any,
			queryFn: searchAllFn,
			enabled: !!replyTargetComment?.link,
		});

	const baseTotalCount = commentsData?.pages?.[0]?.totalComments || 0;
	const activeOpCommentsCount = mergedComments.length - comments.length;
	const displayCommentCount = Math.max(
		mergedComments.length,
		baseTotalCount + activeOpCommentsCount,
	);

	const processedComments = useThreadedComments(mergedComments);

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
			return await handleOptimisticWPCommentAdd(
				newCommentInput,
				postId,
				submitContextRef.current.replyToId,
			);
		},
		onError: (err, newCommentInput, context: any) => {
			handleOptimisticWPCommentError(postId, context);
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
			submitContextRef.current.replyToId = replyTargetComment?.id || null;
			setStatusSubmitLoading(true);
			try {
				let targetMastodonId = mastodonStatusId;

				// for sub-comments
				if (replyTargetComment?.link) {
					if (replyTargetMastodonSearchResult?.statuses?.[0]?.id) {
						targetMastodonId = replyTargetMastodonSearchResult.statuses[0].id;
					}
				}

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
		[
			replyTargetComment,
			replyTargetMastodonSearchResult,
			mastodonStatusId,
			postComment,
		],
	);

	const renderFooter = useCallback(
		(props: any) => {
			const isSubmitting = isPending || statusSubmitLoading;

			return (
				<BottomSheetFooter {...props} bottomInset={0}>
					{replyTargetComment && (
						<View className="px-4 pt-2 pb-2 border-t-[0.5px] border-[#ccc] bg-[#fff] dark:bg-[#121212] flex-row justify-between items-center">
							<ThemeText className="text-xs text-patchwork-primary font-bold">
								Replying to {replyToName || replyTargetComment.author_name}
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
						isLoading={isSubmitting || isSearchingPost || isSearchingReply}
						replyingToName={
							replyToName ||
							(replyTargetComment ? replyTargetComment.author_name : null)
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
			isSearchingReply,
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
				<View className="w-8" />
				<ThemeText
					className="font-bold text-sm text-center"
					style={{ color: isDark ? 'white' : 'black' }}
				>
					{isLoading ? (
						'Loading...'
					) : (
						<>
							{displayCommentCount} comment
							{displayCommentCount !== 1 ? 's' : ''}
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
				onEndReached={() => {
					if (hasNextPage) fetchNextPage();
				}}
				onEndReachedThreshold={0.5}
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
