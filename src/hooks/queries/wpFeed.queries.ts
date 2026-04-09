import { searchUsers } from '@/services/conversations.service';
import {
	getLatestPrintEditionCategory,
	getWordpressAuthorById,
	getWordpressAuthorExtras,
	getWordpressPostByCategoryId,
	getWordpressPostByCategoryIdPaginated,
	getWordpressCommentsByPostId,
	getWordpressLikesByPostId,
	getWordpressPostById,
	getWordpressPostsByAuthorIdPaginated,
	getWordpressFeed,
	getWordpressCategories,
} from '@/services/wpFeed.service';
import { SearchUsersQueryKey } from '@/types/queries/conversations.type';
import { WordpressPostsByCategoryIdQueryKey } from '@/types/queries/wordpressFeed.type';
import { QueryOptionHelper } from '@/util/helper/helper';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { MOCK_WP_COMMENTS } from '@/util/constant/wpComments';

export const useSearchUsers = ({
	options,
	...queryParam
}: SearchUsersQueryKey[1] & {
	options?: QueryOptionHelper<AxiosResponse<Patchwork.Account[]> | undefined>;
}) => {
	const queryKey: SearchUsersQueryKey = ['users', queryParam];
	return useQuery({
		queryKey,
		//@ts-expect-error
		queryFn: searchUsers,
		...options,
	});
};

export const useGetWordpressPostsByCategoryId = ({
	categoryId,
	limit,
}: {
	categoryId: number;
	limit: number;
}) => {
	const queryKey: WordpressPostsByCategoryIdQueryKey = [
		'wordpressPosts',
		{ categoryId, limit },
	];
	return useQuery({
		queryKey: ['wordpressPosts', { categoryId, limit }],
		queryFn: () => getWordpressPostByCategoryId({ categoryId, limit }),
	});
};

export const useGetWordpressCategories = () => {
	return useQuery({
		queryKey: ['wordpressCategories'],
		queryFn: getWordpressCategories,
	});
};

export const useGetWordpressPostById = (postId: number, enabled: boolean) => {
	return useQuery({
		queryKey: ['wordpressPost', postId],
		queryFn: () => getWordpressPostById({ postId }),
		enabled: enabled,
	});
};

export const useWordpressFeed = (
	order: 'asc' | 'desc' = 'desc',
	categories?: string | number,
) => {
	return useInfiniteQuery({
		queryKey: ['wordpressFeed', order, categories],
		queryFn: ({ pageParam = 1 }) =>
			getWordpressFeed({ page: pageParam, order, categories }),
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage > lastPage.totalPages ? undefined : nextPage;
		},
		initialPageParam: 1,
	});
};

export const useGetWordpressPostsByCategoryPaginated = (
	categoryId?: number,
) => {
	return useInfiniteQuery({
		queryKey: ['wordpressPosts', { categoryId }],
		queryFn: ({ pageParam = 1 }) =>
			getWordpressPostByCategoryIdPaginated({ categoryId, page: pageParam }),
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage > lastPage.totalPages ? undefined : nextPage;
		},
		initialPageParam: 1,
	});
};

export const useGetWordpressAuthorById = (authorId: number) => {
	return useQuery({
		queryKey: ['wordpressAuthor', authorId],
		queryFn: () => getWordpressAuthorById({ authorId }),
		enabled: !!authorId,
	});
};

export const useGetWordpressAuthorExtras = (authorSlug: string | undefined) => {
	return useQuery({
		queryKey: ['wordpressAuthorExtras', authorSlug],
		queryFn: () => getWordpressAuthorExtras({ authorSlug: authorSlug! }),
		enabled: !!authorSlug,
		staleTime: Infinity,
		gcTime: Infinity,
		retry: 1,
	});
};

export const useGetWordpressPostsByAuthorIdPaginated = (authorId: number) => {
	return useInfiniteQuery({
		queryKey: ['wordpressPostsByAuthor', { authorId }],
		queryFn: ({ pageParam = 1 }) =>
			getWordpressPostsByAuthorIdPaginated({ authorId, page: pageParam }),
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage > lastPage.totalPages ? undefined : nextPage;
		},
		initialPageParam: 1,
		enabled: !!authorId,
	});
};

export const useGetLatestPrintEdition = () => {
	return useQuery({
		queryKey: ['wordpressLatestPrintEdition'],
		queryFn: () => getLatestPrintEditionCategory(),
		gcTime: Infinity,
		retry: 1,
	});
};

export const useGetWordpressCommentsByPostId = (
	postId: number,
	enabled: boolean,
) => {
	return useQuery({
		queryKey: ['wordpressComments', postId],
		queryFn: () => getWordpressCommentsByPostId({ postId }),
		enabled: enabled,
	});
};

export const useGetWordpressLikesByPostId = (
	postId: number,
	enabled: boolean,
) => {
	return useQuery({
		queryKey: ['wordpressLikes', postId],
		queryFn: () => getWordpressLikesByPostId({ postId }),
		enabled: enabled,
		select: data => {
			return {
				...data,
				found: (postId % 100) + 1100,
			};
		},
	});
};
