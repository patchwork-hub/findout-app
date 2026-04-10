import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { searchAllFn } from '@/services/hashtag.service';
import { favouriteStatus } from '@/services/feed.service';
import { useSearchAllQueries } from '@/hooks/queries/hashtag.queries';

export type ProcessedComment = Patchwork.WPComment & { depth?: number };

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

	const baseTextColor = isDark ? '#fff' : '#000';
	const primaryColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const handleLinkPress = useCallback((evt: any, href: string) => {
		console.log('Link pressed:', href);
	}, []);

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
		let html = item.content.rendered || '';
		// Highlight plain text mentions for optimistically added cache
		if (!html.includes('class="mention"') && !html.includes('class="u-url"')) {
			// Regex wraps `@username` or `@username@domain.com` in a span
			html = html.replace(
				/(^|\s|>)(@[a-zA-Z0-9_.-]+(?:@[a-zA-Z0-9_.-]+)?)/g,
				'$1<span class="mention">$2</span>',
			);
		}
		return html;
	}, [item.content.rendered]);

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

	const { data: mastodonSearchResult, refetch: refetchMastodonStatus } =
		useSearchAllQueries({
			q: item.link,
			resolve: true,
			options: {
				enabled: !!item.link,
				staleTime: Infinity,
				retry: false,
			},
		});

	const mastodonStatus = mastodonSearchResult?.statuses?.[0] || null;

	// Local state to track like UI immediately
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	const [isLiking, setIsLiking] = useState(false);

	const isLiked =
		optimisticLiked !== null
			? optimisticLiked
			: mastodonStatus?.favourited || false;

	let displayedLikeCount = mastodonStatus?.favourites_count || 0;
	if (optimisticLiked !== null && mastodonStatus) {
		if (optimisticLiked && !mastodonStatus.favourited) {
			displayedLikeCount += 1;
		} else if (!optimisticLiked && mastodonStatus.favourited) {
			displayedLikeCount = Math.max(0, displayedLikeCount - 1);
		}
	} else if (optimisticLiked && !mastodonStatus) {
		displayedLikeCount = 1;
	}

	const handleLike = async () => {
		if (isLiking || !item.link) return;
		setIsLiking(true);

		const previousState = isLiked;
		const nextState = !isLiked;

		setOptimisticLiked(nextState);

		try {
			// Resolve status if not done yet
			let targetMastodonId = mastodonStatus?.id;
			if (!targetMastodonId) {
				const { data: result } = await refetchMastodonStatus();
				targetMastodonId = result?.statuses?.[0]?.id;
			}

			if (targetMastodonId) {
				await favouriteStatus({
					status: { id: targetMastodonId, favourited: previousState } as any,
				});
			} else {
				setOptimisticLiked(previousState);
			}
		} catch (err) {
			console.error('Error toggling like on comment:', err);
			setOptimisticLiked(previousState);
		} finally {
			setIsLiking(false);
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
							top: -50,
							bottom: 0,
							zIndex: 0,
						}}
					/>
				)}

				<View style={{ zIndex: 1, elevation: 1 }}>
					<Image
						source={{ uri: item.author_avatar_urls['48'] }}
						className="w-8 h-8 rounded-full mr-3 bg-[#eee] dark:bg-[#444]"
					/>
				</View>
				<View className="flex-1">
					<View className="flex-row items-baseline mb-1">
						<ThemeText className="font-semibold font-NewsCycle_Bold text-[13px] text-[#333] dark:text-white mr-2">
							{item.author_name}
						</ThemeText>
						<ThemeText className="text-[11px] text-[#888]">
							{formatShortDate(item.date_gmt)}
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
									const mentionName = mastodonStatus?.account?.acct || '';
									onReply?.(mentionName);
								}}
								className="active:opacity-60 py-1 mr-4"
							>
								<ThemeText className="text-[13px] text-[#888] font-Inter_SemiBold">
									Reply
								</ThemeText>
							</Pressable>

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
