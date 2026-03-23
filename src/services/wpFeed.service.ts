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
		let url = `posts?_embed&per_page=${limit}`;
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
		const url = `posts/${postId}?_embed`;
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
		const url = `comments?post=${postId}`;
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

export const getWordpressLikesByPostId = async ({
	postId,
}: {
	postId: number;
}) => {
	try {
		const rawDomain = process.env.WORDPRESS_API_URL || '';
		const domain = rawDomain.replace(/^https?:\/\//, '').split('/')[0];
		const url = `https://public-api.wordpress.com/rest/v1.1/sites/${domain}/posts/${postId}/likes`;
		const resp: AxiosResponse<Patchwork.WPLike> = await instance.get(url, {
			params: {
				removeBearerToken: true,
			},
		});
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
		const url = `posts?_embed&coauthors=${authorId}&page=${page}&per_page=${per_page}`;
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
		let url = `posts?_embed&page=${page}&per_page=${per_page}`;
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
