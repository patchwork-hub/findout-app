import { queryClient } from '@/App';
import { useAuthStore } from '@/store/auth/authStore';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';

export const handleOptimisticWPCommentAdd = async (
	newCommentInput: any,
	postId: number | null,
	replyToCommentId: number | null,
) => {
	await queryClient.cancelQueries({
		queryKey: ['wordpressComments', postId],
	});

	const userInfo = useAuthStore.getState().userInfo;

	const fakeComment = {
		id: Date.now(),
		post: postId || 0,
		parent: replyToCommentId || 0,
		author: userInfo?.id || 0,
		author_name: userInfo?.display_name || userInfo?.username || 'You',
		date: new Date().toISOString(),
		date_gmt: new Date().toISOString(),
		content: {
			rendered: `<p>${newCommentInput.status}</p>`,
		},
		author_avatar_urls: {
			'24': userInfo?.avatar || userInfo?.avatar_static || '',
			'48': userInfo?.avatar || userInfo?.avatar_static || '',
			'96': userInfo?.avatar || userInfo?.avatar_static || '',
		},
		status: 'approved',
		type: 'comment',
	} as any;

	if (postId) {
		useLiveVideoFeedStore.getState().addOptimisticComment(postId, fakeComment);
	}

	return { fakeCommentId: fakeComment.id };
};

export const handleOptimisticWPCommentError = (
	postId: number | null,
	context: any,
) => {
	if (postId && context?.fakeCommentId) {
		useLiveVideoFeedStore
			.getState()
			.removeOptimisticComment(postId, context.fakeCommentId);
	}
};
