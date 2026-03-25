import {
	appendApiVersion,
	appendWPApiVersion,
	handleError,
} from '@/util/helper/helper';
import { AxiosResponse } from 'axios';
import instance from './instance';
import he from 'he';
import { CSID_WP_URL, DEFAULT_DASHBOARD_API_URL } from '@/util/constant';

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

const EXCLUDED_RESOURCE_DOMAINS = ['partnerandpartners.com'];

const normalizeTitle = (html: string) =>
	html
		.replace(/<[^>]*>/g, '')
		.replace(/&[^;]+;/g, ' ')
		.trim()
		.toLowerCase();

const isResourceInternalHref = (url: string): boolean => {
	try {
		const h = new URL(url).hostname.toLowerCase();
		return h === 'csidnet.org' || h.endsWith('.csidnet.org');
	} catch {
		return false;
	}
};

const normalizeComparableUrl = (url: string): string => {
	try {
		const u = new URL(url);
		u.hash = '';
		if (u.pathname.endsWith('/')) u.pathname = u.pathname.slice(0, -1);
		return u.toString();
	} catch {
		return url.trim();
	}
};

const shouldSkipResourceUrl = (url: string, postLink?: string): boolean => {
	const normalized = normalizeComparableUrl(url);
	if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
		return true;
	}
	if (postLink && normalized === normalizeComparableUrl(postLink)) {
		return true;
	}
	return false;
};

const extractFirstResourceUrl = (
	html: string,
	postLink?: string,
): string | undefined => {
	const hrefRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
	let m;
	let firstInternalCandidate: string | undefined;
	while ((m = hrefRegex.exec(html)) !== null) {
		const candidate = m[1];
		if (shouldSkipResourceUrl(candidate, postLink)) continue;
		if (!isResourceInternalHref(candidate)) return candidate;
		if (!firstInternalCandidate) firstInternalCandidate = candidate;
	}

	const urlRegex = /\bhttps?:\/\/[^\s"'<>)]*[^\s"'<>)\].,!?]/gi;
	while ((m = urlRegex.exec(html)) !== null) {
		const candidate = m[0];
		if (shouldSkipResourceUrl(candidate, postLink)) continue;
		if (!isResourceInternalHref(candidate)) return candidate;
		if (!firstInternalCandidate) firstInternalCandidate = candidate;
	}

	return firstInternalCandidate;
};

export const getWpResourceExternalUrls = async (
	page = 1,
): Promise<Record<string, string>> => {
	try {
		const pageUrl =
			page === 1
				? `${CSID_WP_URL}/resources/`
				: `${CSID_WP_URL}/resources/page/${page}/`;
		const response = await fetch(pageUrl);
		if (!response.ok) return {};
		const html = await response.text();
		const map: Record<string, string> = {};
		const regex = /<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
		let match;
		while ((match = regex.exec(html)) !== null) {
			const [, href, rawTitle] = match;
			const isExcluded = EXCLUDED_RESOURCE_DOMAINS.some(d => href.includes(d));
			const title = rawTitle.trim();
			if (!isExcluded && title.length > 10) {
				map[title.toLowerCase()] = href;
			}
		}
		return map;
	} catch {
		return {};
	}
};

export const getWpResourcesPaginated = async ({
	page = 1,
	per_page = 10,
}: {
	page?: number;
	per_page?: number;
}) => {
	try {
		const [resp, externalUrls] = await Promise.all([
			instance.get(
				appendWPApiVersion(
					`resource?_embed&per_page=${per_page}&page=${page}`,
					'v2',
				),
				{
					params: {
						isDynamicDomain: true,
						domain_name: CSID_WP_URL,
						removeBearerToken: true,
					},
				},
			) as Promise<AxiosResponse<Patchwork.WPPost[]>>,
			getWpResourceExternalUrls(page),
		]);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '1', 10);
		const resources = resp.data.map(post => ({
			...post,
			external_url:
				post.external_url ??
				externalUrls[normalizeTitle(post.title.rendered)] ??
				extractFirstResourceUrl(post.content?.rendered ?? '', post.link) ??
				extractFirstResourceUrl(post.excerpt?.rendered ?? '', post.link),
		}));
		return { resources, totalPages };
	} catch (error) {
		return handleError(error);
	}
};

// URL patterns that indicate tracking pixels, icons, or non-content images
const SKIP_IMAGE_PATTERNS =
	/logo|icon|favicon|badge|sprite|avatar|placeholder|spacer|pixel|lazy-img|getimage|track(?:er|ing)?|banner\.svg|collect\?|fmt=gif|analytics/i;

const isUsableImageUrl = (src: string): boolean => {
	if (!src.startsWith('http')) return false;
	if (src.endsWith('.svg') || src.endsWith('.gif')) return false;
	// Apply SKIP only to the URL pathname, not the domain.
	// Without this, domains that happen to contain words like "icon" (e.g. sricongress.org)
	// would cause every image from that site to be incorrectly skipped.
	try {
		const urlPath = new URL(src).pathname;
		if (SKIP_IMAGE_PATTERNS.test(urlPath)) return false;
	} catch {
		if (SKIP_IMAGE_PATTERNS.test(src)) return false;
	}
	return true;
};

export const getEventOgImage = async (url: string): Promise<string | null> => {
	try {
		const cleanUrl = url.replace(/#.*$/, ''); // strip fragment before fetching
		const response = await fetch(cleanUrl);
		if (!response.ok) return null;
		const html = await response.text();

		// 1. og:image (both attribute orderings)
		const ogMatch =
			html.match(
				/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
			) ??
			html.match(
				/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
			);
		if (ogMatch?.[1]) return ogMatch[1];

		// 2. twitter:image fallback
		const twitterMatch =
			html.match(
				/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
			) ??
			html.match(
				/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
			);
		if (twitterMatch?.[1]) return twitterMatch[1];

		// 3. First content <img> — checks both src and srcSet attributes.
		//    Handles modern frameworks (Next.js) that use srcSet instead of src.
		const imgTagRegex = /<img[^>]+>/gi;
		let imgTag;
		while ((imgTag = imgTagRegex.exec(html)) !== null) {
			const tag = imgTag[0];

			// srcSet: "url1 320w, url2 640w, ..." — take first URL (smallest but real)
			const srcSetMatch = tag.match(/\bsrcSet=["']([^"'\s,]+)/i);
			if (srcSetMatch && isUsableImageUrl(srcSetMatch[1])) {
				return srcSetMatch[1];
			}

			// Fallback: plain src="https://..."
			const srcMatch = tag.match(/\bsrc=["'](https?:\/\/[^"']+)["']/i);
			if (srcMatch && isUsableImageUrl(srcMatch[1])) {
				return srcMatch[1];
			}
		}

		return null;
	} catch {
		return null;
	}
};

export const getWpResources = async () => {
	try {
		const [resp, externalUrls] = await Promise.all([
			instance.get(appendWPApiVersion('resource?per_page=10&_embed', 'v2'), {
				params: {
					isDynamicDomain: true,
					domain_name: CSID_WP_URL,
					removeBearerToken: true,
				},
			}) as Promise<AxiosResponse<Patchwork.WPPost[]>>,
			getWpResourceExternalUrls(1),
		]);
		return resp.data.map(post => ({
			...post,
			external_url:
				post.external_url ??
				externalUrls[normalizeTitle(post.title.rendered)] ??
				extractFirstResourceUrl(post.content?.rendered ?? '', post.link) ??
				extractFirstResourceUrl(post.excerpt?.rendered ?? '', post.link),
		}));
	} catch (error) {
		return handleError(error);
	}
};

export const searchWordpressPosts = async ({
	search,
	page = 1,
	per_page = 10,
	post_type = 'posts',
}: {
	search: string;
	page?: number;
	per_page?: number;
	post_type?: string;
}) => {
	try {
		const url = `${post_type}?_embed&search=${encodeURIComponent(
			search,
		)}&page=${page}&per_page=${per_page}`;
		const resp: AxiosResponse<Patchwork.WPStory[]> = await instance.get(
			appendWPApiVersion(url, 'v2'),
			{
				params: {
					isDynamicDomain: true,
					domain_name: CSID_WP_URL,
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

export const getWpEventsPaginated = async ({
	page = 1,
	per_page = 10,
}: {
	page?: number;
	per_page?: number;
}) => {
	try {
		const resp: AxiosResponse<Patchwork.WPPost[]> = await instance.get(
			appendWPApiVersion(
				`event?_embed&per_page=${per_page}&page=${page}`,
				'v2',
			),
			{
				params: {
					isDynamicDomain: true,
					domain_name: CSID_WP_URL,
					removeBearerToken: true,
				},
			},
		);
		const totalPages = parseInt(resp.headers['x-wp-totalpages'] || '1', 10);
		return { events: resp.data, totalPages };
	} catch (error) {
		return handleError(error);
	}
};
