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
import { useAuthStore } from '@/store/auth/authStore';
import {
	useGetWordpressCommentsByPostId,
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
import { queryClient } from '@/App';

export const CommentsSheet = () => {
	const { colorScheme } = useColorScheme();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const { userInfo } = useAuthStore();

	const {
		isCommentSheetOpen: isOpen,
		closeComments,
		commentPostId: postId,
		optimisticComments: allOptimisticComments,
		addOptimisticComment,
		removeOptimisticComment,
	} = useLiveVideoFeedStore();

	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
	const snapPoints = useMemo(() => ['65%', '90%'], []);

	const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
	const [statusSubmitLoading, setStatusSubmitLoading] = useState(false);
	const [isPullRefreshing, setIsPullRefreshing] = useState(false);

	const {
		data: comments = [],
		isFetching,
		refetch,
	} = useGetWordpressCommentsByPostId(postId || 0, isOpen && !!postId);

	const onPullToRefresh = useCallback(async () => {
		setIsPullRefreshing(true);
		await refetch();
		setIsPullRefreshing(false);
	}, [refetch]);

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

	const mergedComments = useMemo(() => {
		const opComments = allOptimisticComments[postId || 0] || [];
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

	const processedComments = useThreadedComments(mergedComments);

	useEffect(() => {
		if (isOpen) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
			Keyboard.dismiss();
		}
	}, [isOpen]);

	const { mutate: postComment, isPending } = useComposeMutation({
		onMutate: async newCommentInput => {
			return await handleOptimisticWPCommentAdd(
				newCommentInput,
				postId,
				replyToCommentId,
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

	const renderFooter = useCallback(
		(props: any) => {
			const replyTargetComment = comments.find(c => c.id === replyToCommentId);
			const isSubmitting = isPending || statusSubmitLoading;

			return (
				<BottomSheetFooter {...props} bottomInset={0}>
					{replyTargetComment && (
						<View className="px-4 pt-2 -mb-2 bg-[#fff] dark:bg-[#121212] flex-row justify-between items-center">
							<ThemeText className="text-xs text-patchwork-primary font-bold">
								Replying to {replyTargetComment.author_name}
							</ThemeText>
							<ThemeText
								className="text-xs text-gray-500 px-2 py-1"
								onPress={() => setReplyToCommentId(null)}
							>
								Cancel
							</ThemeText>
						</View>
					)}
					<CommentFooter
						onFocusInput={() => bottomSheetRef.current?.snapToIndex(1)}
						bottomInset={insets.bottom}
						isLoading={isSubmitting || isSearchingPost}
						onSubmit={async text => {
							setStatusSubmitLoading(true);
							try {
								// Find the mastodon ID to reply to. Defaults to post's mastodon ID.
								let targetMastodonId = mastodonStatusId;

								// If we are replying to a specific sub-comment
								if (replyTargetComment?.link) {
									const searchResult = await queryClient.fetchQuery({
										queryKey: [
											'search-all',
											{ q: replyTargetComment.link, resolve: true },
										] as any,
										queryFn: searchAllFn,
									});
									if (searchResult?.statuses?.[0]?.id) {
										targetMastodonId = searchResult.statuses[0].id;
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
								} else {
									console.log(
										'Could not resolve Mastodon status ID to comment on.',
									);
								}
							} catch (err) {
								console.error('Error finding parent comment to reply', err);
							} finally {
								setStatusSubmitLoading(false);
							}
						}}
					/>
				</BottomSheetFooter>
			);
		},
		[
			insets.bottom,
			isPending,
			postComment,
			mastodonStatusId,
			isSearchingPost,
			wpPost?.link,
			replyToCommentId,
			comments,
			statusSubmitLoading,
		],
	);

	const renderItem = useCallback(
		({ item }: { item: ProcessedComment }) => (
			<CommentItem
				item={item}
				onReply={() => {
					setReplyToCommentId(item.id);
					bottomSheetRef.current?.snapToIndex(1);
				}}
			/>
		),
		[],
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
			footerComponent={renderFooter}
			backdropComponent={renderBackdrop}
		>
			<View className="flex-row justify-between items-center px-4 py-3 relative">
				<View className="w-8" />
				<ThemeText
					className="font-bold text-sm text-center"
					style={{ color: isDark ? 'white' : 'black' }}
				>
					{mergedComments.length} comment
					{mergedComments.length !== 1 ? 's' : ''}
				</ThemeText>
				<Pressable
					onPress={() => refetch()}
					className="w-8 h-8 items-end justify-center active:opacity-50"
				>
					{isFetching && !isPullRefreshing ? (
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
				contentContainerStyle={{
					paddingHorizontal: 16,
					paddingBottom: Math.max(120, insets.bottom + 150),
				}}
				ListEmptyComponent={
					<View className="h-[500] w-full items-center justify-center">
						<ListEmptyComponent title="No comments found" />
					</View>
				}
			/>
		</BottomSheetModal>
	);
};
