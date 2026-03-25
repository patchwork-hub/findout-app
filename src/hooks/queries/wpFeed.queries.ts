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
	getWpResources,
	getWpResourcesPaginated,
	getEventOgImage,
	searchWordpressPosts,
	getWpEventsPaginated,
} from '@/services/wpFeed.service';
import { SearchUsersQueryKey } from '@/types/queries/conversations.type';
import { WordpressPostsByCategoryIdQueryKey } from '@/types/queries/wordpressFeed.type';
import { QueryOptionHelper } from '@/util/helper/helper';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { MOCK_WP_COMMENTS } from '@/util/constant/wpComments';
import { getEventWebsiteUrl, getFaviconUrl } from '@/util/helper/wpContent';

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
		select: data => {
			if (
				postId === 560 ||
				postId === 554 ||
				postId === 537 ||
				postId === 548
			) {
				return MOCK_WP_COMMENTS.filter(comment => comment.post === postId);
			}
			return data;
		},
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

export const useGetWpResources = () => {
	return useQuery({
		queryKey: ['wpResources'],
		queryFn: getWpResources,
		staleTime: 5 * 60 * 1000,
	});
};

export const useGetWpResourcesPaginated = () => {
	return useInfiniteQuery({
		queryKey: ['wpResourcesPaginated'],
		queryFn: ({ pageParam = 1 }) =>
			getWpResourcesPaginated({ page: pageParam }),
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage > lastPage.totalPages ? undefined : nextPage;
		},
		initialPageParam: 1,
	});
};

export const useGetEventOgImage = (url?: string) => {
	return useQuery({
		queryKey: ['eventOgImage', url],
		queryFn: () => getEventOgImage(url!),
		enabled: Boolean(url),
		staleTime: Infinity,
		gcTime: Infinity,
		retry: 0,
	});
};

export const useEventImage = (item: Patchwork.WPPost) => {
	const wpImageUrl =
		item._embedded?.['wp:featuredmedia']?.[0]?.source_url ??
		item.acf?.event_image ??
		item.acf?.featured_image_url ??
		item.meta?.event_image;
	const websiteUrl = getEventWebsiteUrl(
		item.excerpt?.rendered ?? '',
		item.content?.rendered,
	);
	const isCsidInternal = !wpImageUrl && !websiteUrl;
	const { data: ogImageUrl, isFetched: ogFetched } = useGetEventOgImage(
		!wpImageUrl ? websiteUrl : undefined,
	);
	const primaryImageUrl = wpImageUrl ?? ogImageUrl ?? undefined;
	const isLoadingOg = !wpImageUrl && !isCsidInternal && !ogFetched;
	const faviconUrl =
		!primaryImageUrl && ogFetched && websiteUrl
			? getFaviconUrl(websiteUrl)
			: undefined;
	return {
		isCsidInternal,
		isLoadingOg,
		faviconUrl,
		primaryImageUrl,
		websiteUrl,
	};
};

const isCsidUrl = (url: string): boolean => {
	try {
		const host = new URL(url).hostname.toLowerCase();
		return host === 'csidnet.org' || host.endsWith('.csidnet.org');
	} catch {
		return false;
	}
};

export const useResourceImage = (item: Patchwork.WPPost) => {
	const wpImageUrl = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
	const externalUrl =
		item.external_url ??
		item.acf?.external_url ??
		item.meta?.external_url ??
		'';
	const isExternal = Boolean(externalUrl) && !isCsidUrl(externalUrl);
	const { data: ogImageUrl, isFetched: ogFetched } = useGetEventOgImage(
		!wpImageUrl && isExternal ? externalUrl : undefined,
	);
	const isCsidInternal = !wpImageUrl && !isExternal;
	const primaryImageUrl = wpImageUrl ?? ogImageUrl ?? undefined;
	const isLoadingOg = !wpImageUrl && isExternal && !ogFetched;
	const faviconUrl =
		!primaryImageUrl && ogFetched && isExternal
			? getFaviconUrl(externalUrl)
			: undefined;
	return { isCsidInternal, isLoadingOg, faviconUrl, primaryImageUrl };
};

export const useSearchWpResources = (search: string) => {
	return useInfiniteQuery({
		queryKey: ['wpResourcesSearch', { search }],
		queryFn: ({ pageParam }) =>
			searchWordpressPosts({
				search,
				page: pageParam as number,
				per_page: 10,
				post_type: 'resource',
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage) return undefined;
			return allPages.length < lastPage.totalPages
				? allPages.length + 1
				: undefined;
		},
		enabled: search.length >= 3,
		staleTime: 5 * 60 * 1000,
	});
};

export const useGetWpEventsPaginated = () => {
	return useInfiniteQuery({
		queryKey: ['wpEventsPaginated'],
		queryFn: ({ pageParam = 1 }) => getWpEventsPaginated({ page: pageParam }),
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = allPages.length + 1;
			return nextPage > lastPage.totalPages ? undefined : nextPage;
		},
		initialPageParam: 1,
	});
};
