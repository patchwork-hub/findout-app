import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Dimensions, Pressable, Platform, Linking } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import Share from 'react-native-share';
const { width } = Dimensions.get('window');
import he from 'he';
import { cn } from '@/util/helper/twutil';
import { useWpStoryStore } from '@/store/feed/wpStoryStore';
import {
	extractMuxPlaybackId,
	extractYouTubeId,
	formatAuthorName,
	getAuthorList,
	stripTags,
	truncateStr,
} from '@/util/helper/helper';
import { StatusShareIcon } from '@/util/svg/icon.status_actions';
import { isTablet } from '@/util/helper/isTablet';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import moment from 'moment';

export const WpstoryCard = ({
	post,
	isFullWidth = false,
	variant = 'default',
}: {
	post: Patchwork.WPStory;
	isFullWidth?: boolean;
	variant?: 'default' | 'video-grid';
}) => {
	const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
	const muxPlaybackId = extractMuxPlaybackId(post.content?.rendered || '');
	const muxThumbnailUrl = muxPlaybackId
		? `https://image.mux.com/${muxPlaybackId}/thumbnail.png?width=400`
		: null;

	const youtubeVideoId = extractYouTubeId(post.content.rendered);
	const youtubeThumbnailUrl = youtubeVideoId
		? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
		: null;

	const displayImageUrl =
		variant === 'video-grid'
			? muxThumbnailUrl || youtubeThumbnailUrl || imageUrl
			: imageUrl;

	const allTerms = post._embedded?.['wp:term'];
	const authors = getAuthorList(allTerms);
	const category = allTerms?.[0]?.[0];
	const categoryName = category?.name;
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const setSelectedPost = useWpStoryStore(state => state.setSelectedPost);

	const handleCardPress = async () => {
		const isAndroid = Platform.OS === 'android';
		const hasTransistorPodcast = post.content?.rendered?.includes(
			'share.transistor.fm',
		);
		const postLink = post.link;

		if (isAndroid && hasTransistorPodcast && postLink) {
			try {
				if (await InAppBrowser.isAvailable()) {
					await InAppBrowser.open(postLink, {
						animated: true,
						showTitle: true,
						enableUrlBarHiding: true,
						enableDefaultShare: true,
						forceCloseOnRedirection: false,
					});
				} else {
					Linking.openURL(postLink);
				}
			} catch (error) {
				console.error('InAppBrowser error:', error);
				Linking.openURL(postLink);
			}
		} else {
			setSelectedPost(post);
			navigation.navigate('WpStoryDetail', {
				postId: post.id,
				title: post.title.rendered,
			});
		}
	};

	return (
		<Pressable
			className="mr-4 active:opacity-90"
			style={{
				width: isFullWidth ? '100%' : isTablet ? width * 0.45 : width * 0.7,
			}}
			onPress={handleCardPress}
		>
			<View>
				{displayImageUrl ? (
					<FastImage
						source={{ uri: displayImageUrl }}
						className={cn(
							'w-full',
							variant !== 'video-grid' && 'bg-black',
							isFullWidth ? 'rounded-tl-lg rounded-tr-lg' : 'rounded-lg',
							variant === 'video-grid'
								? 'aspect-video h-auto'
								: isTablet
								? isFullWidth
									? 'h-96'
									: 'h-52'
								: 'h-40',
						)}
						resizeMode={
							variant === 'video-grid'
								? FastImage.resizeMode.cover
								: FastImage.resizeMode.contain
						}
					/>
				) : (
					<View
						className={cn(
							'w-full rounded-lg bg-gray-300',
							isTablet ? 'h-56' : 'h-40',
						)}
					/>
				)}
			</View>
			<View
				className={
					isFullWidth
						? 'rounded-bl-lg rounded-br-lg bg-slate-50 dark:bg-zinc-900 px-2 py-4'
						: ''
				}
			>
				<ThemeText
					className={cn(
						'font-NewsCycle_Bold mt-2',
						isTablet ? 'text-lg mt-3' : 'text-sm',
					)}
					numberOfLines={5}
				>
					{he.decode(post.title.rendered || '')}
				</ThemeText>
				{variant === 'video-grid' ? (
					<View>
						<ThemeText
							className={cn(
								'text-xs font-Inter_Regular text-gray-500 dark:text-gray-400 mt-1',
								isTablet && 'text-sm',
							)}
							numberOfLines={3}
						>
							{he.decode(stripTags(post.excerpt?.rendered || ''))}
						</ThemeText>
						<ThemeText
							className={cn(
								'text-xs font-Inter_Regular text-gray-400 dark:text-gray-500 mt-2',
								isTablet && 'text-sm',
							)}
						>
							{moment(post.date).format('MMM DD, YYYY')}
						</ThemeText>
					</View>
				) : (
					<View className="flex-row items-center flex-wrap">
						{Array.isArray(authors) &&
							authors.map((author, index) => (
								<React.Fragment key={author.id}>
									<Pressable
										className="active:opacity-70"
										onPress={() =>
											navigation.navigate('AuthorDetail', {
												authorId: parseInt(author?.id),
												authorName: author?.name,
											})
										}
									>
										<ThemeText
											className={cn(
												'text-xs font-Inter_Regular text-gray-500 dark:text-gray-400 mr-0 mt-1',
												isTablet && 'text-sm',
											)}
											numberOfLines={1}
										>
											{formatAuthorName(author.name)}
										</ThemeText>
									</Pressable>
									{index < authors.length - 1 && (
										<ThemeText
											className={cn(
												'text-xs font-Inter_Regular text-gray-500 dark:text-gray-400 mr-2',
												isTablet && 'text-sm',
											)}
										>
											,
										</ThemeText>
									)}
								</React.Fragment>
							))}

						{categoryName && (
							<>
								<ThemeText
									className={cn(
										'text-xs font-Inter_Regular text-gray-500 dark:text-gray-400 mt-1 mx-2',
										isTablet && 'text-sm',
									)}
								>
									.
								</ThemeText>
								<Pressable
									className="active:opacity-70"
									onPress={() =>
										navigation.navigate('WpCategoryViewAll', {
											categoryId: parseInt(category?.id),
											title: truncateStr(categoryName, 25),
											categoryType: 'list',
										})
									}
								>
									<ThemeText
										className={cn(
											'text-xs font-Inter_Regular text-gray-500 dark:text-gray-400 mt-1',
											isTablet && 'text-sm',
										)}
									>
										{truncateStr(categoryName, 25)}
									</ThemeText>
								</Pressable>
							</>
						)}
					</View>
				)}
			</View>
		</Pressable>
	);
};
