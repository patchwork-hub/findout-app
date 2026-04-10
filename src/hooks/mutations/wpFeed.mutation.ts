import {
	useMutation,
	UseMutationOptions,
	useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
	postWordpressComment,
	likeWordpressPostThruMastodon,
} from '@/services/wpFeed.service';
import { queryClient } from '@/App';

export const usePostWordpressCommentMutation = (
	options?: UseMutationOptions<
		any,
		AxiosError,
		{ postId: number; content: string; parent?: number }
	>,
) => {
	return useMutation({
		mutationFn: postWordpressComment,
		...options,
	});
};

interface ToggleLikeParams {
	postId: number;
	postLink: string;
	newStatus: boolean;
	userInfo: Patchwork.Account;
}

export const useToggleWordpressLike = () => {
	return useMutation({
		mutationFn: async ({ postLink, newStatus }: ToggleLikeParams) => {
			return likeWordpressPostThruMastodon(postLink, !newStatus);
		},
		onMutate: async ({ postId, newStatus, userInfo }) => {
			await queryClient.cancelQueries({ queryKey: ['wordpressLikes', postId] });
			const previousLikes = queryClient.getQueryData([
				'wordpressLikes',
				postId,
			]);

			queryClient.setQueryData(['wordpressLikes', postId], (oldData: any) => {
				const safeOldData = oldData || { found: 0, data: [] };
				if (!userInfo) return safeOldData;
				const oldLikes = safeOldData.data || [];
				if (newStatus) {
					if (oldLikes.some((like: any) => like.url === userInfo.url)) {
						return safeOldData;
					}
					return {
						found: safeOldData.found + 1,
						data: [
							{
								name: userInfo.display_name || userInfo.username,
								url: userInfo.url,
								avatar: userInfo.avatar,
							},
							...oldLikes,
						],
					};
				} else {
					return {
						found: Math.max(0, safeOldData.found - 1),
						data: oldLikes.filter((like: any) => like.url !== userInfo.url),
					};
				}
			});

			return { previousLikes, postId };
		},
		onError: (err, variables, context) => {
			if (context?.previousLikes) {
				queryClient.setQueryData(
					['wordpressLikes', context?.postId],
					context.previousLikes,
				);
			} else {
				queryClient.invalidateQueries({
					queryKey: ['wordpressLikes', variables.postId],
				});
			}
		},
	});
};
