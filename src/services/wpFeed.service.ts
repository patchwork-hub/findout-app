import {
	appendApiVersion,
	appendWPApiVersion,
	handleError,
} from '@/util/helper/helper';
import { AxiosResponse } from 'axios';
import instance from './instance';
import he from 'he';
import { DEFAULT_DASHBOARD_API_URL } from '@/util/constant';

export const getWordpressPostByCategoryId = async ({
	categoryId,
	limit = 5,
}: {
	categoryId?: number;
	limit?: number;
}) => {
	try {
		let url = `posts?_embed=author,wp:term,wp:featuredmedia&per_page=${limit}`;
		if (categoryId) {
			url += `&categories=${categoryId}`;
		}
		const resp: AxiosResponse<Patchwork.WPStory[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressPostById = async ({ postId }: { postId: number }) => {
	try {
		const url = `posts/${postId}?_embed=author,wp:term,wp:featuredmedia`;
		const resp: AxiosResponse<Patchwork.WPStory> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressCategories = async () => {
	try {
		const resp: AxiosResponse<Patchwork.WpCategory[]> = await instance.get(
			appendWPApiVersion('categories?per_page=100', 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressFeed = async ({
	page = 1,
	per_page = 10,
	order = 'desc',
	orderby = 'date',
	categories,
}: {
	page?: number;
	per_page?: number;
	order?: 'asc' | 'desc';
	orderby?: string;
	categories?: string | number;
}) => {
	try {
		let url = `posts?_embed&page=${page}&per_page=${per_page}&order=${order}&orderby=${orderby}`;
		if (categories) {
			url += `&categories=${categories}`;
		}
		const resp: AxiosResponse<Patchwork.WPStory[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);

		const totalPosts = parseInt(resp.headers['x-wp-total'] || '0', 10);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);

		return {
			posts: resp.data,
			totalPosts,
			totalPages,
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressAuthorById = async ({
	authorId,
}: {
	authorId: number;
}) => {
	try {
		const url = `coauthors/${authorId}`;
		const resp: AxiosResponse<Patchwork.WPUser> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressCommentsByPostId = async ({
	postId,
}: {
	postId: number;
}) => {
	try {
		const url = `comments?post=${postId}&per_page=100`;
		const resp: AxiosResponse<Patchwork.WPComment[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressCommentsByPostIdPaginated = async ({
	postId,
	page = 1,
	per_page = 100,
}: {
	postId: number;
	page?: number;
	per_page?: number;
}) => {
	try {
		const url = `comments?post=${postId}&page=${page}&per_page=${per_page}&order=asc`;
		const resp = await instance.get(appendWPApiVersion(url, 'v2'), {
			params: {
				isDynamicDomain: true,
				domain_name: process.env.WORDPRESS_API_URL || '',
				removeBearerToken: true,
			},
		});

		const totalComments = parseInt(resp.headers['x-wp-total'] || '0', 10);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);

		return {
			comments: resp.data,
			totalComments,
			totalPages,
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressLikesByPostId = async ({
	postId,
}: {
	postId: number;
}) => {
	try {
		const url = `/wp-json/activitypub/1.0/posts/${postId}/reactions`;
		const resp = await instance.get(url, {
			params: {
				isDynamicDomain: true,
				domain_name: process.env.WORDPRESS_API_URL || '',
				removeBearerToken: true,
			},
		});

		const data = resp.data || {};
		const likes = data.likes?.items || [];

		return { found: likes.length, data: likes };
	} catch (error) {
		return { found: 0, data: [] };
	}
};

export const likeWordpressPostThruMastodon = async (
	url: string,
	isLiked: boolean,
) => {
	try {
		// 1. Search for the post in the Mastodon instance to resolve it to a Mastodon status ID.
		const searchResp = await instance.get(appendApiVersion('search', 'v2'), {
			params: {
				q: url,
				resolve: true,
				limit: 1,
			},
		});

		const status = searchResp.data?.statuses?.[0];

		if (!status) {
			throw new Error('Post could not be resolved on the Mastodon instance.');
		}

		// 2. Like or unlike it using the resolved status ID
		const toggleFavourite = isLiked ? 'unfavourite' : 'favourite';
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			appendApiVersion(`statuses/${status.id}/${toggleFavourite}`, 'v1'),
		);

		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

const extractAuthorExtras = (html: string) => {
	let imageUrl: string | null = null;
	let description: string | null = null;

	const imgRegex =
		/<img[^>]+class="[^"]*author-byline-profile-pic[^"]*"[^>]+src="([^"]+)"/i;
	const imgMatch = html.match(imgRegex);
	if (imgMatch && imgMatch[1]) {
		imageUrl = imgMatch[1];
	}

	const descRegex =
		/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i;
	const descMatch = html.match(descRegex);
	if (descMatch && descMatch[1]) {
		description = he.decode(descMatch[1]);
	} else {
		const bioRegex =
			/<li[^>]+class="[^"]*author-bio-description[^"]*"[^>]*>([\s\S]*?)<\/li>/i;
		const bioMatch = html.match(bioRegex);

		if (bioMatch && bioMatch[1]) {
			let rawContent = bioMatch[1];

			const cleanContent = rawContent.replace(/<[^>]*>?/gm, '').trim();

			if (cleanContent) {
				description = he.decode(cleanContent);
			}
		}
	}

	return { imageUrl, description };
};

export const getWordpressAuthorExtras = async ({
	authorSlug,
}: {
	authorSlug: string;
}) => {
	try {
		const htmlUrl = `https://thebristolcable.org/author/${authorSlug}`;
		const response = await fetch(htmlUrl);

		if (!response.ok) {
			throw new Error('Failed to fetch author HTML page');
		}

		const html = await response.text();
		const { imageUrl, description } = extractAuthorExtras(html);

		return { imageUrl, description };
	} catch (error) {
		console.error('Error fetching/parsing author HTML:', error);
		return { imageUrl: null, description: null };
	}
};

export const getLatestPrintEditionCategory = async () => {
	try {
		const resp: AxiosResponse<{ categoryId: string; title: string }> =
			await instance.get(appendApiVersion('categories/bristol_latest_print'), {
				params: {
					domain_name: DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			});
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressPostsByAuthorIdPaginated = async ({
	authorId,
	page = 1,
	per_page = 10,
}: {
	authorId: number;
	page?: number;
	per_page?: number;
}) => {
	try {
		const url = `posts?_embed=author,wp:term,wp:featuredmedia&coauthors=${authorId}&page=${page}&per_page=${per_page}`;
		const resp: AxiosResponse<Patchwork.WPStory[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);

		const totalPosts = parseInt(resp.headers['x-wp-total'] || '0', 10);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);

		return {
			posts: resp.data,
			totalPosts,
			totalPages,
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getWordpressPostByCategoryIdPaginated = async ({
	categoryId,
	page = 1,
	per_page = 10,
}: {
	categoryId?: number;
	page?: number;
	per_page?: number;
}) => {
	try {
		let url = `posts?_embed=author,wp:term,wp:featuredmedia&page=${page}&per_page=${per_page}`;
		if (categoryId) {
			url += `&categories=${categoryId}`;
		}
		const resp: AxiosResponse<Patchwork.WPStory[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
					removeBearerToken: true,
				},
			},
		);

		const totalPosts = parseInt(resp.headers['x-wp-total'] || '0', 10);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '0', 10);

		return {
			posts: resp.data,
			totalPosts,
			totalPages,
		};
	} catch (error) {
		return handleError(error);
	}
};

export const postWordpressComment = async ({
	postId,
	content,
	parent = 0,
}: {
	postId: number;
	content: string;
	parent?: number;
}) => {
	try {
		const url = `comments`;
		const resp: AxiosResponse<Patchwork.WPComment> = await instance.post(
			appendWPApiVersion(url, 'v2'),
			{
				post: postId,
				content,
				parent,
			},
			{
				params: {
					isDynamicDomain: true,
					domain_name: process.env.WORDPRESS_API_URL || '',
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};
