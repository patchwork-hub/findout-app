import { create } from 'zustand';

interface LiveVideoFeedState {
	// Comment
	isCommentSheetOpen: boolean;
	commentPostId: number | null;
	openComments: (postId: number) => void;
	closeComments: () => void;

	// Content
	isContentSheetOpen: boolean;
	contentPost: Patchwork.WPStory | null;
	openContent: (post: Patchwork.WPStory) => void;
	closeContent: () => void;

	// Like Sheet
	isLikeSheetOpen: boolean;
	likeSheetPostId: number | null;
	openLikeSheet: (postId: number) => void;
	closeLikeSheet: () => void;

	// Video Player
	videoProgressMap: Record<number, number>;
	setVideoProgress: (postId: number, time: number) => void;

	// Global Video Mute State
	isGlobalMuted: boolean;
	setIsGlobalMuted: (isMuted: boolean) => void;
}

export const useLiveVideoFeedStore = create<LiveVideoFeedState>(set => ({
	// Comment
	isCommentSheetOpen: false,
	commentPostId: null,
	openComments: postId =>
		set({ isCommentSheetOpen: true, commentPostId: postId }),
	closeComments: () => set({ isCommentSheetOpen: false, commentPostId: null }),

	// Content
	isContentSheetOpen: false,
	contentPost: null,
	openContent: post => set({ isContentSheetOpen: true, contentPost: post }),
	closeContent: () => set({ isContentSheetOpen: false, contentPost: null }),

	// Like Sheet
	isLikeSheetOpen: false,
	likeSheetPostId: null,
	openLikeSheet: postId =>
		set({ isLikeSheetOpen: true, likeSheetPostId: postId }),
	closeLikeSheet: () => set({ isLikeSheetOpen: false, likeSheetPostId: null }),

	// Video Player
	videoProgressMap: {},
	setVideoProgress: (postId, time) =>
		set(state => ({
			videoProgressMap: { ...state.videoProgressMap, [postId]: time },
		})),

	// Global Video Mute State
	isGlobalMuted: false,
	setIsGlobalMuted: isMuted => set({ isGlobalMuted: isMuted }),
}));
