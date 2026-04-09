import React, {
	useState,
	useCallback,
	useEffect,
	useRef,
	useMemo,
} from 'react';
import {
	View,
	ScrollView,
	StyleSheet,
	Dimensions,
	AppState,
	AppStateStatus,
	Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useColorScheme } from 'nativewind';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import { LiveVideoFeedActionBar } from '@/components/atoms/feed/LiveVideoFeedActionBar/LiveVideoFeedActionBar';
import { LiveFeedContent } from '@/components/atoms/feed/LiveFeedContent/LiveFeedContent';
import { LiveVideoFeedPlayer } from '@/components/atoms/feed/LiveVideoFeedPlayer/LiveVideoFeedPlayer';
import {
	getInitialVideoOrientation,
	extractYoutubeId,
} from '@/util/helper/helper';
import {
	useGetWordpressCommentsByPostId,
	useGetWordpressLikesByPostId,
} from '@/hooks/queries/wpFeed.queries';
import customColor from '@/util/constant/color';

const VideoFeedItem = ({
	post,
	isActive,
	isPreloading,
	index,
	visibleHeight,
}: {
	post: Patchwork.WPStory;
	isActive: boolean;
	isPreloading: boolean;
	index: number;
	visibleHeight?: number;
}) => {
	const youtubeId = extractYoutubeId(post.content.rendered);
	const assumedOrientation = getInitialVideoOrientation(post);
	const [isLandscape, setIsLandscape] = useState(
		youtubeId ? true : assumedOrientation.isLandscape,
	);
	const [videoAspectRatio, setVideoAspectRatio] = useState(
		youtubeId ? 16 / 9 : assumedOrientation.aspectRatio,
	);
	const { colorScheme } = useColorScheme();
	const {
		openComments,
		openContent,
		openLikeSheet,
		isGlobalMuted,
		setIsGlobalMuted,
		optimisticComments: allOptimisticComments,
	} = useLiveVideoFeedStore();

	const { data: comments = [] } = useGetWordpressCommentsByPostId(
		post.id,
		!!post.id,
	);

	const mergedComments = useMemo(() => {
		const opComments = allOptimisticComments[post.id || 0] || [];
		const activeOpComments = opComments.filter(
			(oc: any) =>
				!comments.some((c: any) => {
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
	}, [comments, allOptimisticComments, post.id]);

	const commentCount = mergedComments.filter(c => c.type === 'comment' || !c.type).length;

	const { data: likesData } = useGetWordpressLikesByPostId(post.id, !!post.id);
	const likeCount = likesData?.found || 0;

	const playerRef = useRef<YoutubeIframeRef>(null);
	const { setVideoProgress, videoProgressMap } = useLiveVideoFeedStore();
	const initialTime = videoProgressMap[post.id] || 0;

	const playerStateRef = useRef<string>('unstarted');
	const isPlayerReadyRef = useRef<boolean>(false);

	const [isPlaying, setIsPlaying] = useState(true);

	useEffect(() => {
		if (!isActive) {
			if (playerRef.current) {
				playerRef.current?.getCurrentTime().then((time: number) => {
					setVideoProgress(post.id, time);
				});
			}
		} else {
			setIsPlaying(true);
		}
	}, [isActive, post.id, setVideoProgress]);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		let consecutiveValidFrames = 0;
		if (isActive && youtubeId) {
			interval = setInterval(() => {
				if (
					!isPlayerReadyRef.current ||
					(playerStateRef.current !== 'playing' &&
						playerStateRef.current !== 'paused')
				) {
					consecutiveValidFrames = 0;
					return;
				}
				consecutiveValidFrames++;
				if (consecutiveValidFrames < 4) {
					return;
				}
				playerRef.current
					?.isMuted()
					.then(muted => {
						if (muted !== undefined && muted !== isGlobalMuted) {
							setIsGlobalMuted(muted);
						}
					})
					.catch(() => {});
			}, 500);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, youtubeId, isGlobalMuted, setIsGlobalMuted]);

	const onFullScreenChange = useCallback(
		(isFullScreen: boolean) => {
			if (!isFullScreen && isActive) {
				setIsPlaying(true);
			}
		},
		[isActive],
	);

	useEffect(() => {
		const orientation = getInitialVideoOrientation(post);
		if (youtubeId) {
			setIsLandscape(true);
			setVideoAspectRatio(16 / 9);
		} else {
			setIsLandscape(orientation.isLandscape);
			setVideoAspectRatio(orientation.aspectRatio);
		}
	}, [post, youtubeId]);

	const toggleMute = useCallback(() => {
		setIsGlobalMuted(!isGlobalMuted);
	}, [isGlobalMuted, setIsGlobalMuted]);

	const handleAspectRatioLoad = useCallback(
		(landscape: boolean, ratio: number) => {
			setIsLandscape(landscape);
			setVideoAspectRatio(ratio);
		},
		[],
	);

	const renderVideo = (children?: React.ReactNode) => {
		if (youtubeId) {
			return (
				<View
					key={post.id}
					style={{
						flex: 1,
					}}
				>
					<YoutubePlayer
						ref={playerRef}
						width={Dimensions.get('window').width}
						height={Dimensions.get('window').width / (16 / 9)}
						play={isActive}
						videoId={youtubeId}
						mute={isGlobalMuted}
						initialPlayerParams={{
							start: initialTime,
							preventFullScreen: false,
						}}
						onReady={() => {
							isPlayerReadyRef.current = true;
						}}
						onChangeState={(state: string) => {
							playerStateRef.current = state;
						}}
						onFullScreenChange={onFullScreenChange}
						webViewProps={{
							androidLayerType: 'hardware',
							renderToHardwareTextureAndroid: true,
						}}
					/>
					{children}
				</View>
			);
		}

		return (
			<LiveVideoFeedPlayer
				key={post.id}
				post={post}
				isActive={isActive}
				isMuted={isGlobalMuted}
				toggleMute={toggleMute}
				onAspectRatioLoad={handleAspectRatioLoad}
			>
				{children}
			</LiveVideoFeedPlayer>
		);
	};

	if (isLandscape) {
		const propsColor = colorScheme === 'dark' ? 'white' : 'black';
		return (
			<View
				className={`flex-1 bg-white dark:bg-patchwork-dark-100 ${
					index == 0 ? (Platform.OS === 'android' ? 'mt-32' : '-mt-2') : 'mt-0'
				}`}
			>
				<View className="w-full" style={{ aspectRatio: videoAspectRatio }}>
					{renderVideo()}
				</View>
				<ScrollView
					className="flex-1 bg-white dark:bg-patchwork-dark-100"
					showsVerticalScrollIndicator={false}
				>
					<LiveFeedContent
						post={post}
						isLandscape={true}
						onNavigateToDetail={() => openContent(post)}
					/>
					<View className="px-0">
						<LiveVideoFeedActionBar
							onLike={() => openLikeSheet(post.id)}
							onComment={() => openComments(post.id)}
							onShare={() => openLikeSheet(post.id)}
							onMore={() => openLikeSheet(post.id)}
							color={propsColor}
							commentCount={commentCount}
							likeCount={likeCount}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.videoContainer}>
				{renderVideo(
					<LinearGradient
						colors={['transparent', 'rgba(0,0,0,0.8)']}
						style={styles.overlayContainer}
						pointerEvents="box-none"
					>
						<View style={styles.contentContainer}>
							<LiveFeedContent
								post={post}
								isLandscape={false}
								onNavigateToDetail={() => openContent(post)}
							/>
						</View>

						<View style={styles.actionSection}>
							<LiveVideoFeedActionBar
								onLike={() => openLikeSheet(post.id)}
								onComment={() => openComments(post.id)}
								onShare={() => openLikeSheet(post.id)}
								onMore={() => openLikeSheet(post.id)}
							/>
						</View>
					</LinearGradient>,
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: customColor['patchwork-dark-100'],
	},
	videoContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: customColor['patchwork-dark-100'],
	},
	overlayContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'flex-end',
		zIndex: 50,
	},
	contentContainer: {
		marginBottom: 1,
	},
	actionSection: {
		zIndex: 10,
	},
	landscapeContent: {
		flex: 1,
		backgroundColor: customColor['patchwork-dark-100'],
	},
	landscapeActions: {
		paddingHorizontal: 0,
	},
});

export default VideoFeedItem;
