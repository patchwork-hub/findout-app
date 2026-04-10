import React, { useMemo, useState } from 'react';
import { View, useWindowDimensions, ScrollView, Platform } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { useColorScheme } from 'nativewind';
import he from 'he';
import moment from 'moment';
import FastImage from '@d11/react-native-fast-image';

import {
	useGetWordpressPostById,
	useGetWordpressPostStatusFromMastodon,
	useGetWordpressPostLikesFromMastodon,
} from '@/hooks/queries/wpFeed.queries';
import { useFavouriteMutation } from '@/hooks/mutations/feed.mutation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth/authStore';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import Share from 'react-native-share';
import Toast from 'react-native-toast-message';

import customColor from '@/util/constant/color';
import { HomeStackScreenProps } from '@/types/navigation';
import WpStoryDetailSkeleton from '@/components/atoms/loading/WpStoryDetailLoading';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import WpImageRenderer from '@/components/molecules/blog/WpImageRenderer/WpImageRenderer';
import { useWpStoryStore } from '@/store/feed/wpStoryStore';
import {
	extractMuxPlaybackId,
	extractYoutubeId,
	getAuthorList,
	cleanHtmlContent,
	handleError,
} from '@/util/helper/helper';
import { isTablet } from '@/util/helper/isTablet';
import { WpPlayer } from '@/components/atoms/feed/WpPlayer/WpPlayer';
import WpPodcastRenderer from '@/components/molecules/blog/WpPodcastRenderer/WpPodcastRenderer';

// Refactored imports
import WpStoryHeader from '@/components/molecules/blog/WpStoryHeader/WpStoryHeader';
import WpStoryAuthorList from '@/components/molecules/blog/WpStoryAuthorList/WpStoryAuthorList';
import { LiveVideoFeedActionBar } from '@/components/atoms/feed/LiveVideoFeedActionBar/LiveVideoFeedActionBar';
import { appIcon } from '@/util/constant/appIcon';
import { FALLBACK_PREVIEW_IMAGE_URL } from '@/util/constant';
import { useSharePost } from '@/hooks/useSharePost';
import {
	getBaseStyle,
	getTagsStyles,
	customHTMLElementModels,
} from '@/util/constant/wpStory';

const WpStoryDetail: React.FC<HomeStackScreenProps<'WpStoryDetail'>> = ({
	route,
}) => {
	const { colorScheme } = useColorScheme();
	const { selectedPost } = useWpStoryStore();
	const { width } = useWindowDimensions();
	const { postId, title } = route.params;
	const isDark = colorScheme === 'dark';
	const solidHeaderBg = isDark ? customColor['patchwork-dark-100'] : 'white';
	const textColor = isDark ? 'white' : 'black';
	const [isMuted, setIsMuted] = useState(false);
	const { handleSharePress } = useSharePost();

	const isPostAvailableInStore = selectedPost && selectedPost.id === postId;

	const {
		data: postFromApi,
		isLoading,
		isError,
	} = useGetWordpressPostById(postId, !!postId && !isPostAvailableInStore);

	const post = isPostAvailableInStore ? selectedPost : postFromApi;

	const userInfo = useAuthStore(state => state.userInfo);
	const { openComments, openLikeSheet } = useLiveVideoFeedStore();
	const queryClient = useQueryClient();
	const { mutate: toggleMastodonLike } = useFavouriteMutation({});

	const { data: mastodonStatus } = useGetWordpressPostStatusFromMastodon(
		post?.link || '',
	);

	const { data: mastodonLikesData } = useGetWordpressPostLikesFromMastodon(
		mastodonStatus?.id,
	);

	const isLiked = useMemo(() => {
		if (mastodonStatus?.favourited) return true;
		if (mastodonLikesData && userInfo?.url) {
			return mastodonLikesData.some(acc => acc.url === userInfo.url);
		}
		return false;
	}, [mastodonStatus?.favourited, mastodonLikesData, userInfo?.url]);

	const displayedLikeCount =
		mastodonLikesData?.length ?? mastodonStatus?.favourites_count ?? 0;
	const commentCount = mastodonStatus?.replies_count || 0;

	const handleShare = async () => {
		if (!post?.link) return;
		const SHARE_LINK_URL = post.link;

		const options: any = Platform.select({
			ios: {
				activityItemSources: [
					{
						placeholderItem: {
							type: 'url',
							content: appIcon,
						},
						item: {
							default: {
								type: 'url',
								content: SHARE_LINK_URL,
							},
						},
						linkMetadata: {
							title: 'Find Out Media',
							icon: FALLBACK_PREVIEW_IMAGE_URL,
						},
					},
				],
			},
			default: {
				title: 'Find Out Media',
				subject: 'Find Out Media',
				message: SHARE_LINK_URL,
			},
		});

		try {
			await Share.open(options);
		} catch (error) {
			handleError(error);
		}
	};

	const handleLikeToggle = () => {
		if (!userInfo || !mastodonStatus || !post) return;

		queryClient.cancelQueries({
			queryKey: ['wordpressPostStatusFromMastodon', post.link],
		});
		if (mastodonStatus?.id) {
			queryClient.cancelQueries({
				queryKey: ['wordpressPostLikesFromMastodon', mastodonStatus.id],
			});
		}

		const previousStatus = queryClient.getQueryData<Patchwork.Status>([
			'wordpressPostStatusFromMastodon',
			post.link,
		]);
		const previousLikes = mastodonStatus?.id
			? queryClient.getQueryData<Patchwork.Account[]>([
					'wordpressPostLikesFromMastodon',
					mastodonStatus.id,
			  ])
			: undefined;

		let currentIsLiked = false;
		if (previousStatus?.favourited) {
			currentIsLiked = true;
		} else if (previousLikes && userInfo?.url) {
			currentIsLiked = previousLikes.some(acc => acc.url === userInfo.url);
		}

		const newIsLiked = !currentIsLiked;
		const activeStatus = previousStatus || mastodonStatus;

		if (activeStatus) {
			queryClient.setQueryData(['wordpressPostStatusFromMastodon', post.link], {
				...activeStatus,
				favourited: newIsLiked,
				favourites_count: newIsLiked
					? (activeStatus.favourites_count || 0) + 1
					: Math.max((activeStatus.favourites_count || 0) - 1, 0),
			});
		}

		const activeLikes = previousLikes || mastodonLikesData;
		if (mastodonStatus?.id) {
			queryClient.setQueryData(
				['wordpressPostLikesFromMastodon', mastodonStatus.id],
				(old: any) => {
					const oldArray = Array.isArray(old) ? old : activeLikes || [];
					if (newIsLiked) {
						if (!oldArray.some(acc => acc.url === userInfo.url)) {
							return [...oldArray, { ...userInfo, url: userInfo.url }];
						}
						return oldArray;
					} else {
						return oldArray.filter(acc => acc.url !== userInfo.url);
					}
				},
			);
		}

		toggleMastodonLike(
			{
				status: {
					...mastodonStatus,
					favourited: currentIsLiked,
				} as Patchwork.Status,
			},
			{
				onError: () => {
					if (previousStatus) {
						queryClient.setQueryData(
							['wordpressPostStatusFromMastodon', post.link],
							previousStatus,
						);
					}
					if (previousLikes && mastodonStatus?.id) {
						queryClient.setQueryData(
							['wordpressPostLikesFromMastodon', mastodonStatus.id],
							previousLikes,
						);
					}
					Toast.show({
						type: 'error',
						text1: 'Error',
						text2: 'Failed to like the post. Please try again.',
					});
				},
				onSettled: () => {
					queryClient.invalidateQueries({
						queryKey: ['wordpressPostStatusFromMastodon', post.link],
					});
					if (mastodonStatus?.id) {
						queryClient.invalidateQueries({
							queryKey: ['wordpressPostLikesFromMastodon', mastodonStatus.id],
						});
					}
				},
			},
		);
	};

	// Use useMemo for renderers to avoid re-creation on every render
	const renderers = useMemo(
		() => ({
			iframe: (props: any) => {
				const src = props.tnode.attributes.src as string | undefined;
				const isYoutube =
					src && (src.includes('youtube.com') || src.includes('youtu.be'));

				if (isYoutube) return <></>;

				return <WpPodcastRenderer {...props} />;
			},
			img: WpImageRenderer,
		}),
		[],
	);

	if (isLoading) {
		return <WpStoryDetailSkeleton />;
	}

	if (isError || !post) {
		return (
			<View className="flex-1 items-center justify-center">
				<ThemeText>Failed to load article.</ThemeText>
			</View>
		);
	}

	const featuredImageUrl =
		post?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
	const allTerms = post._embedded?.['wp:term'];
	const authors = getAuthorList(allTerms);
	const hasMuxVideo = extractMuxPlaybackId(post.content?.rendered || '');
	const youtubeId = extractYoutubeId(post.content?.rendered || '');
	const hasVideo = hasMuxVideo || youtubeId;

	const cleanedContent = cleanHtmlContent(post.content.rendered);

	return (
		<View className="flex-1" style={{ backgroundColor: solidHeaderBg }}>
			<WpStoryHeader
				title={title}
				onShare={() => handleSharePress(post.link)}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 50 }}
				bounces={false}
			>
				{hasVideo ? (
					<WpPlayer
						post={post}
						isActive={true}
						isMuted={isMuted}
						toggleMute={() => setIsMuted(prev => !prev)}
					/>
				) : (
					featuredImageUrl && (
						<FastImage
							source={{ uri: featuredImageUrl }}
							className="w-full bg-slate-200 dark:bg-patchwork-dark-50"
							style={{ height: isTablet ? 450 : 300 }}
						/>
					)
				)}

				<View className="px-4 pt-6">
					<ThemeText
						className={
							isTablet
								? 'text-3xl font-NewsCycle_Bold leading-[40px] mb-6'
								: 'text-2xl font-NewsCycle_Bold leading-9 mb-4'
						}
					>
						{he.decode(post.title.rendered || '')}
					</ThemeText>

					<ThemeText
						className={
							isTablet
								? 'text-lg mb-6 text-gray-500'
								: 'text-base mb-4 text-gray-500'
						}
					>
						{moment(post.date).format('MMMM DD, YYYY')}
					</ThemeText>

					<WpStoryAuthorList authors={authors} />

					<RenderHTML
						contentWidth={width - 32}
						source={{ html: cleanedContent }}
						baseStyle={getBaseStyle({ isTablet, textColor })}
						tagsStyles={getTagsStyles({ isDark, isTablet, textColor }) as any}
						customHTMLElementModels={customHTMLElementModels}
						renderers={renderers}
						defaultTextProps={{ style: { fontFamily: 'Inter-Regular' } }}
						ignoredStyles={['backgroundColor', 'color']}
						systemFonts={['Inter-Regular', 'Inter-Bold', 'NewsCycle-Bold']}
					/>
					<View className="-mx-4 mb-2">
						<LiveVideoFeedActionBar
							onLike={handleLikeToggle}
							onLikeCountPress={() => post && openLikeSheet(post.id)}
							onComment={() => post && openComments(post.id)}
							onShare={handleShare}
							onMore={() => post && openLikeSheet(post.id)}
							color={textColor}
							commentCount={commentCount}
							likeCount={displayedLikeCount}
							isLiked={isLiked}
						/>
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

export default WpStoryDetail;
