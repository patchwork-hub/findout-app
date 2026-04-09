import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { postWordpressComment } from '@/services/wpFeed.service';

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
