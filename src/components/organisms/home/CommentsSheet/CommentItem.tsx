import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import customColor from '@/util/constant/color';
import {
	defaultSystemFonts,
	MixedStyleDeclaration,
	RenderHTMLProps,
} from 'react-native-render-html';
import RenderHTML from 'react-native-render-html';
import { formatShortDate } from '@/util/helper/helper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { favouriteStatus } from '@/services/feed.service';
import { useAuthStore } from '@/store/auth/authStore';
import { statusDeleteFn } from '@/services/statusActions.service';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import { queryClient } from '@/App';
import navigationRef from '@/util/navigation/navigationRef';
import { CommonActions } from '@react-navigation/native';

export type ProcessedComment = Patchwork.Status & { depth?: number };

interface CommentItemProps {
	item: ProcessedComment;
	onReply?: (mentionName: string) => void;
	isLastInThread?: boolean;
}

export const CommentItem = ({
	item,
	onReply,
	isLastInThread,
}: CommentItemProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const userInfo = useAuthStore(state => state.userInfo);

	const baseTextColor = isDark ? '#fff' : '#000';
	const primaryColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const handleProfileNavigate = useCallback(
		(targetId?: string) => {
			useLiveVideoFeedStore.getState().closeComments();
			if (!targetId || !navigationRef.isReady()) return;

			if (targetId === userInfo?.id) {
				navigationRef.dispatch(
					CommonActions.navigate({ name: 'Profile', params: { id: targetId } }),
				);
			} else {
				navigationRef.dispatch(
					CommonActions.navigate({
						name: 'ProfileOther',
						params: { id: targetId },
					}),
				);
			}
		},
		[userInfo?.id],
	);

	const handleLinkPress = useCallback(
		(evt: any, href: string) => {
			useLiveVideoFeedStore.getState().closeComments();
			if (!navigationRef.isReady()) return;

			// Check if the link matches a Mention tag
			const mention = item.mentions?.find(
				m => m.url.toLowerCase() === href.toLowerCase(),
			);
			if (mention) {
				handleProfileNavigate(mention.id);
				return;
			}

			// Check if the link matches a Hashtag
			const tag = item.tags?.find(
				t => t.url.toLowerCase() === href.toLowerCase(),
			);
			if (tag) {
				navigationRef.dispatch(
					CommonActions.navigate({
						name: 'HashTagDetail',
						params: { hashtag: tag.name },
					}),
				);
				return;
			}

			// Fallback to WebViewer for normal links
			navigationRef.dispatch(
				CommonActions.navigate({ name: 'WebViewer', params: { url: href } }),
			);
		},
		[item.mentions, item.tags, handleProfileNavigate],
	);

	const tagsStyles = useMemo<Record<string, MixedStyleDeclaration>>(
		() => ({
			a: {
				textDecorationLine: 'none',
				color: primaryColor,
				fontWeight: '500',
			},
			span: {
				color: 'inherit',
			},
			p: {
				marginBottom: 0,
				marginTop: 0,
			},
		}),
		[primaryColor],
	);

	const classesStyles = useMemo<Record<string, MixedStyleDeclaration>>(
		() => ({
			mention: {
				color: primaryColor,
				textDecorationLine: 'none',
			},
			'u-url': {
				color: primaryColor,
				textDecorationLine: 'none',
			},
			'h-card': {
				color: primaryColor,
				textDecorationLine: 'none',
			},
		}),
		[primaryColor],
	);

	const processedHtml = useMemo(() => {
		let html = item.content || '';
		// Highlight plain text mentions for optimistically added cache
		if (!html.includes('class="mention"') && !html.includes('class="u-url"')) {
			html = html.replace(
				/(^|\s|>)(@[a-zA-Z0-9_.-]+(?:@[a-zA-Z0-9_.-]+)?)/g,
				'$1<span class="mention">$2</span>',
			);
		}
		return html;
	}, [item.content]);

	const renderersProps = useMemo<RenderHTMLProps['renderersProps']>(
		() => ({
			a: {
				onPress: handleLinkPress,
			},
		}),
		[handleLinkPress],
	);

	const depth = item.depth || 0;
	const isReply = depth > 0;

	const [isDeleting, setIsDeleting] = useState(false);

	const isOwnComment = item.account?.id && item.account.id === userInfo?.id;

	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	const [isLiking, setIsLiking] = useState(false);

	const isLiked =
		optimisticLiked !== null ? optimisticLiked : item.favourited || false;

	let displayedLikeCount = item.favourites_count || 0;
	if (optimisticLiked !== null) {
		if (optimisticLiked && !item.favourited) {
			displayedLikeCount += 1;
		} else if (!optimisticLiked && item.favourited) {
			displayedLikeCount = Math.max(0, displayedLikeCount - 1);
		}
	}

	const handleLike = async () => {
		if (isLiking || !item.id) return;
		setIsLiking(true);

		const previousState = isLiked;
		const nextState = !isLiked;

		setOptimisticLiked(nextState);

		try {
			await favouriteStatus({
				status: { id: item.id, favourited: previousState } as any,
			});
		} catch (err) {
			console.error('Error toggling like on comment:', err);
			setOptimisticLiked(previousState);
		} finally {
			setIsLiking(false);
		}
	};

	const handleDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);

		try {
			if (item.id) {
				await statusDeleteFn({ status_id: item.id });
			}

			// Optimistically remove from Mastodon replies cache (which is what we will be using)
			useLiveVideoFeedStore.getState().commentPostId &&
				queryClient.setQueriesData(
					{ queryKey: ['feed-replies'] },
					(oldData: any) => {
						if (!oldData) return oldData;
						return {
							...oldData,
							descendants:
								oldData.descendants?.filter((c: any) => c.id !== item.id) || [],
							ancestors:
								oldData.ancestors?.filter((c: any) => c.id !== item.id) || [],
						};
					},
				);
		} catch (err) {
			console.error('Error deleting comment:', err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<View className={`flex-row relative ${isReply ? 'mt-2 mb-3' : 'my-3'}`}>
				{isReply && (
					<View
						className="absolute w-[2px] bg-gray-300 dark:bg-[#444]"
						style={{
							left: 15,
							top: -65,
							bottom: 0,
							zIndex: 0,
						}}
					/>
				)}

				<Pressable
					style={{ zIndex: 1, elevation: 1 }}
					onPress={() => handleProfileNavigate(item.account?.id)}
				>
					<Image
						source={{ uri: item.account?.avatar || '' }}
						className="w-8 h-8 rounded-full mr-3 bg-[#eee] dark:bg-[#444]"
					/>
				</Pressable>
				<View className="flex-1">
					<View className="flex-row items-baseline mb-1">
						<Pressable onPress={() => handleProfileNavigate(item.account?.id)}>
							<ThemeText className="font-semibold font-NewsCycle_Bold text-[13px] text-[#333] dark:text-white mr-2">
								{item.account?.display_name ||
									item.account?.username ||
									'Unknown'}
							</ThemeText>
						</Pressable>
						<ThemeText className="text-[11px] text-[#888]">
							{formatShortDate(item.created_at)}
						</ThemeText>
					</View>
					<RenderHTML
						source={{ html: processedHtml }}
						renderersProps={renderersProps}
						tagsStyles={tagsStyles}
						classesStyles={classesStyles}
						systemFonts={[...defaultSystemFonts, 'Inter_Regular']}
						baseStyle={{
							fontSize: 14,
							color: baseTextColor,
							lineHeight: 22,
						}}
					/>
					<View className="flex-row mt-1 items-center justify-between">
						<View className="flex-row items-center">
							<Pressable
								onPress={() => {
									const mentionName = item.account?.acct || '';
									onReply?.(mentionName);
								}}
								className="active:opacity-60 py-1 mr-4"
							>
								<ThemeText className="text-[13px] text-[#888] font-Inter_SemiBold">
									Reply
								</ThemeText>
							</Pressable>

							{isOwnComment && (
								<Pressable
									onPress={handleDelete}
									className="active:opacity-60 py-1 mr-4"
								>
									{isDeleting ? (
										<ActivityIndicator
											size="small"
											color={isDark ? '#aaa' : '#555'}
										/>
									) : (
										<ThemeText className="text-[13px] text-red-500 font-Inter_SemiBold">
											Delete
										</ThemeText>
									)}
								</Pressable>
							)}

							{displayedLikeCount > 0 && (
								<View className="flex-row items-center pointer-events-none">
									<FontAwesomeIcon
										icon={faHeartSolid}
										color={customColor['patchwork-primary']}
										size={12}
									/>
									<ThemeText className="text-[12px] text-[#888] ml-1.5 font-Inter_Regular">
										{displayedLikeCount}
									</ThemeText>
								</View>
							)}
						</View>

						<Pressable
							onPress={handleLike}
							className="active:opacity-60 p-2 -mr-2"
						>
							{isLiking ? (
								<ActivityIndicator
									size="small"
									color={isLiked ? customColor['patchwork-primary'] : '#888'}
								/>
							) : (
								<FontAwesomeIcon
									icon={isLiked ? faHeartSolid : faHeartRegular}
									color={isLiked ? customColor['patchwork-primary'] : '#888'}
									size={16}
								/>
							)}
						</Pressable>
					</View>
				</View>
			</View>
			{isLastInThread && (
				<View className="h-[1px] w-full bg-gray-200 dark:bg-[#333]" />
			)}
		</>
	);
};
