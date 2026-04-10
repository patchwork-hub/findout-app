import { Dimensions } from 'react-native';
import axios, { AxiosError, AxiosResponse } from 'axios';
import {
	QueryKey,
	UseInfiniteQueryOptions,
	UseQueryOptions,
} from '@tanstack/react-query';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
	DEFAULT_API_URL,
	CHANNEL_INSTANCE,
	MASTODON_INSTANCE,
	NEWSMAST_INSTANCE_V1,
	DEFAULT_INSTANCE,
} from '../constant';
import { useActiveFeedStore } from '@/store/feed/activeFeed';
import { uniqueId } from 'lodash';
import { useAuthStore } from '@/store/auth/authStore';
import instance from '@/services/instance';
import { queryClient } from '@/App';
import moment from 'moment';
import { getFavouriteChannelLists } from '@/services/channel.service';
import { log } from 'console';
import { useTranslation } from 'react-i18next';
import { QuotePolicy } from '@/context/composeStatusContext/composeStatus.type';
import { TFunction } from 'i18next';

export const handleError = (error: any) => {
	return Promise.reject({
		status: error?.response?.status,
		message:
			error?.response?.data?.error ||
			error?.response?.data?.message ||
			error?.response?.message ||
			error?.response?.data?.errors ||
			error?.response?.data?.errors?.[0] ||
			'Unknown error',
		data: error?.response?.data?.data || {},
	});
};

const scale = (size: number) => {
	return Dimensions.get('window').width / size;
};

const keyExtractor = (_: any, index: number) => index.toString();

export const appendApiVersion = (url: string, version: string = 'v1') => {
	return `/api/${version}/${url}`;
};

export const appendWPApiVersion = (url: string, version: string = 'v1') => {
	return `/wp-json/wp/${version}/${url}`;
};

export const appendDynamicDomain = (domainName: string, apiPath: string) => {
	return domainName + apiPath;
};

export const timelineDateFormatter = (
	createdAt: moment.Moment,
	t: TFunction,
) => {
	const now = moment();
	const seconds = now.diff(createdAt, 'seconds');
	const duration = moment.duration(now.diff(createdAt));

	if (seconds < 60) {
		return t('conversation.time_stamp.duration_seconds', {
			count: seconds,
			defaultValue: '{{count}} sec',
		});
	}

	const minutes = Math.floor(duration.asMinutes());
	if (minutes < 60) {
		return t('conversation.time_stamp.duration_minutes', {
			count: minutes,
			defaultValue: '{{count}}m ago',
		});
	}

	const hours = Math.floor(duration.asHours());
	if (hours < 24) {
		return t('conversation.time_stamp.duration_hours', {
			count: hours,
			defaultValue: '{{count}}h ago',
		});
	}

	const days = Math.floor(duration.asDays());
	if (days < 30) {
		return t('conversation.time_stamp.duration_days', {
			count: days,
			defaultValue: '{{count}}d ago',
		});
	}

	const months = Math.floor(duration.asMonths());
	if (months < 12) {
		return t('conversation.time_stamp.duration_months', {
			count: months,
			defaultValue: '{{count}}mo ago',
		});
	}

	const years = Math.floor(duration.asYears());
	return t('conversation.time_stamp.duration_years', {
		count: years,
		defaultValue: '{{count}}y ago',
	});
};

export const getMaxId = (resp: AxiosResponse) => {
	const linkHeader = resp.headers.link as string;
	let maxId = null;
	if (linkHeader) {
		const regex = /max_id=(\d+)/;
		const match = linkHeader.match(regex);
		if (match) {
			maxId = match[1];
		}
	}
	return maxId;
};

export const getRelationShipInfoForStatus = async (
	statusList: Patchwork.Status[],
) => {
	if (statusList.length == 0) return [];
	const accIdList = statusList.reduce((acc, item, idx) => {
		return (acc += `id[]=${item.account.id}${
			idx == statusList.length - 1 ? '' : '&'
		}`);
	}, '');

	try {
		const relationshipInfoList: AxiosResponse<Patchwork.RelationShip[]> =
			await instance.get(
				appendApiVersion(
					`accounts/relationships?with_suspended=true&${accIdList}`,
					'v1',
				),
			);

		return statusList;
	} catch (e) {
		return handleError(e);
	}
};

export const calculateHashTagCount = (
	hashTagList: Patchwork.HashtagHistory[],
	countType?: 'accounts' | 'uses',
) => {
	if (!Array.isArray(hashTagList)) return 0;
	return hashTagList.reduce(
		(accumulator: number, hashtag: Patchwork.HashtagHistory) =>
			accumulator + parseInt(hashtag[countType ?? 'uses']),
		0,
	);
};

export const ensureHttp = (url: string) => {
	if (!url.startsWith('https://')) {
		return 'https://' + url;
	}
	return url;
};

export type QueryOptionHelper<
	TQueryFnData = unknown,
	TError = AxiosError,
	TData = TQueryFnData,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>;

export const saveAuthState = async (key: string, value: string) => {
	try {
		await EncryptedStorage.setItem(key, value);
	} catch (err) {
		console.log(`Failed To Save ${key}`, err);
	}
};

type StoredAuthState = {
	wordpress: {
		token: string;
		domain: string;
	};
	mastodon: {
		token: string;
		domain: string;
	};
};

const defaultAuthState = {
	wordpress: {
		token: '',
		domain: process.env.WORDPRESS_API_URL || '',
	},
	mastodon: {
		token: '',
		domain: process.env.API_URL ?? DEFAULT_INSTANCE,
	},
};

export const getAuthState = async (): Promise<StoredAuthState> => {
	try {
		const authState = await EncryptedStorage.getItem('AUTH_STATE');
		if (authState) {
			return JSON.parse(authState) as StoredAuthState;
		}
		return defaultAuthState;
	} catch (err) {
		return defaultAuthState;
	}
};

export const clearEncStorage = async () => {
	return await EncryptedStorage.clear();
};

export const formatNumber = (num?: number) => {
	if (num == null || isNaN(num)) return 0;
	if (num >= 1000 && num < 1000000) {
		return (num / 1000).toFixed(1) + 'K';
	} else if (num >= 1000000) {
		return (num / 1000000).toFixed(1) + 'M';
	} else {
		return num?.toString();
	}
};

export const getSpecificServerStatus = async (q: string, authToken: string) => {
	try {
		const { userOriginInstance } = useAuthStore.getState();
		const isFormDifferentInstance = userOriginInstance !== CHANNEL_INSTANCE;
		const baseURl = isFormDifferentInstance
			? userOriginInstance
			: CHANNEL_INSTANCE;
		const payload = { q, resolve: true, type: 'statuses' };
		const resp: AxiosResponse<Patchwork.SearchResult> = await axios.get(
			`${baseURl}/api/v2/search`,
			{
				params: payload,
				headers: {
					Authorization: `${authToken}`,
				},
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export function isPatchworkStatus(data: any): data is Patchwork.Status {
	return (
		typeof data === 'object' &&
		typeof data.id === 'string' &&
		typeof data.uri === 'string' &&
		typeof data.url === 'string' &&
		typeof data.account === 'object'
	);
}

export const replaceIdInUrl = (
	url: string,
	searchRes: Patchwork.SearchResult,
) => {
	const match = url.match(/\b\d{9,}\b/);
	if (match && searchRes.statuses?.length > 0) {
		const oldId = match[0];
		const newUrl = url.replace(oldId, searchRes.statuses[0].id);
		return newUrl;
	}
	return url;
};

export const reverseSortStatusList = (data: Patchwork.TimelineReplies) => {
	if (data.ancestors?.length) data.ancestors.reverse();
	if (data.descendants?.length) data.descendants.reverse();
	return data;
};

export const checkIsCurrentSignedInUser = (userAccHandle: string) => {
	const regex = /@([a-zA-Z0-9_]+)/;
	const match = userAccHandle.match(regex);
	const { userInfo } = useAuthStore.getState();
	if (match) {
		const accHandle = match[1];
		return accHandle == userInfo?.acct;
	}
	return false;
};

export const isAccFromChannelOrg = (acct: string, originInstsance: string) => {
	if (!acct) return false;
	const parts = acct.split('@');
	if (parts.length === 1) {
		return originInstsance == CHANNEL_INSTANCE;
	}
	return ensureHttp(parts[1]) === CHANNEL_INSTANCE;
};

export const capatilizeStr = (str: string) => {
	if (!str) return '';
	return str.toLowerCase().replace(/^./, char => char.toUpperCase());
};

export const checkIsAccountVerified = (fields?: Patchwork.Field[]) => {
	if (!fields || fields?.length < 1) return false;

	return fields.some(
		field => !!field.verified_at && field.verified_at.length > 1,
	);
};

export const truncateStr = (str: string, maxLength: number) => {
	if (!str) return '';
	if (str.length > maxLength) {
		return str.substring(0, maxLength) + '...';
	}
	return str;
};

export const removeHashtagSign = (str: string) => {
	if (!str) return '';
	return str.replace('#', '');
};

export const isAccAlreadySelected = (
	prevSelctedAcc: Patchwork.Account[],
	acc: Patchwork.Account,
) => {
	return prevSelctedAcc.some(item => {
		return item.id == acc.id;
	});
};

export const addAllUserAcctFromConversation = (
	accountList: Patchwork.Account[] | undefined,
	orignalStatus: string,
) => {
	if (!accountList) return orignalStatus;
	const removeExtraMention = orignalStatus.replace(/\@\w+/g, '').trim();
	const res = accountList.map(item => '@' + item.acct).join(' ');
	return `${res} ${removeExtraMention}`;
};

export const getImageSizeForCommunityAllItem = (length: number): string => {
	if (length == 1) {
		return 'w-full h-full';
	} else if (length < 4) {
		return 'w-1/2 h-full';
	} else {
		return 'w-1/2 h-1/2';
	}
};

export const isDevelopment = () => {
	return __DEV__ ? true : false;
};

export const getFileNameFromUri = (uri: string) => {
	if (uri && uri.length > 0) {
		return uri.split('/').pop();
	}
	return '';
};

export const getTimeInterval = (interval: number) => {
	const currentTime = new Date();
	return new Date(currentTime.getTime() + interval);
};

export { scale, keyExtractor };

// This function is used to find the accountId if the search api res is more than one account Info.
export const findAccountId = (
	specificServerProfile: Patchwork.SearchResult | null | undefined,
	accountInfoData: Patchwork.Account | null | undefined,
): string | undefined => {
	const accounts = specificServerProfile?.accounts ?? [];

	if (accounts.length > 1 && accountInfoData?.url) {
		const foundAccount = accounts.find(acc => acc.url === accountInfoData.url);
		return foundAccount?.id ?? accountInfoData.id;
	}

	return accounts.length > 0 ? accounts[0].id : accountInfoData?.id;
};

export const isCurrentUserFromMainInstances = (userOriginInstance: string) => {
	return [
		CHANNEL_INSTANCE,
		NEWSMAST_INSTANCE_V1,
		MASTODON_INSTANCE,
		DEFAULT_INSTANCE,
	].includes(userOriginInstance);
};

export const getOtherParticipantAcct = (
	statusId: string,
	domain_name: string,
	ownAcct: string,
) => {
	const feedDetailQueryKey = [
		'feed-replies',
		{ id: statusId, domain_name: domain_name },
	];
	const previousData =
		queryClient.getQueryData<Patchwork.TimelineReplies>(feedDetailQueryKey);
	if (!previousData) return '';
	const mergedReplies = [
		...previousData.ancestors,
		...previousData.descendants,
	];
	const otherParticipants = Array.from(
		new Set(
			mergedReplies
				.map(item => item.account.acct)
				.filter(acct => acct !== ownAcct),
		),
	);
	return otherParticipants.length > 0
		? otherParticipants.map(acct => `@${acct}`).join(' ')
		: ' ';
};

export const getGridStructure = (count: number) => {
	if (count === 2) return [[0], [1]];
	if (count === 3) return [[0], [1, 2]];
	if (count === 4)
		return [
			[0, 2],
			[1, 3],
		];
	return [[0]];
};

export const getBorderRadius = (
	position: string,
	index: number,
	total: number,
) => {
	const isLeft = position === 'left';
	const firstInColumn = index === 0;
	const lastInColumn = index === total - 1;

	return [
		isLeft && firstInColumn && 'rounded-tl-xl',
		isLeft && lastInColumn && 'rounded-bl-xl',
		!isLeft && firstInColumn && 'rounded-tr-xl',
		!isLeft && lastInColumn && 'rounded-br-xl',
	]
		.filter(Boolean)
		.join(' ');
};

export const calculateUnread = (
	groups: Patchwork.NotificationGroup[],
	lastReadId: string,
) => {
	return groups.reduce((total, group) => {
		return group.most_recent_notification_id > lastReadId
			? total + group.notifications_count
			: total;
	}, 0);
};

export const getDomainFromAccHandle = (acc: string) => {
	const parts = acc.split('@');
	if (parts.length !== 2) {
		return { userName: '', domain: '' };
	}
	return { userName: parts[0], domain: parts[1] };
};

export const removeHttps = (url: string): string => {
	return url.replace(/^https?:\/\//, '');
};

export const isUserAlreadyJoinChannelsAndSetPrimary = (
	totalChannelList: Patchwork.ChannelList[],
) => {
	if (
		totalChannelList &&
		totalChannelList.length >= 5 &&
		!!totalChannelList[0]?.attributes?.is_primary
	) {
		return true;
	}
	return false;
};

export const checkIsUserJoinChannel = async () => {
	return getFavouriteChannelLists()
		.then(totalJoinChannelList => {
			const checkUserJoinChannel =
				isUserAlreadyJoinChannelsAndSetPrimary(totalJoinChannelList);
			return checkUserJoinChannel;
		})
		.catch(e => {
			return false;
		});
};

export const generateRandomKey = () =>
	Math.random().toString(36).substring(2, 10);

export type ThemeValue = 'light' | 'dark';
const THEME_KEY = 'user_theme';

export const getThemeFromStorage = async (): Promise<
	ThemeValue | undefined
> => {
	try {
		const theme = await EncryptedStorage.getItem(THEME_KEY);
		if (theme === 'light' || theme === 'dark') {
			return theme;
		}
		return undefined;
	} catch (error) {
		console.error('Error retrieving theme:', error);
		return undefined;
	}
};

export const setThemeToStorage = async (theme: ThemeValue) => {
	try {
		await EncryptedStorage.setItem(THEME_KEY, theme);
	} catch (error) {
		console.error('Error setting theme:', error);
	}
};

export const removeThemeFromStorage = async () => {
	try {
		await EncryptedStorage.removeItem(THEME_KEY);
	} catch (error) {
		console.error('Error removing theme:', error);
	}
};

export const generateAppopirateColor = ({
	light,
	dark,
}: {
	light: string;
	dark: string;
}) => {
	const { userTheme } = useAuthStore.getState();
	return userTheme === 'dark' ? dark : light;
};

export const formatFollowersCount = (count: number): string => {
	return count >= 1000
		? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`
		: `${count}`;
};

export const extractInstanceName = (url: string) => {
	const match = url.match(/^https?:\/\/([^/]+)/);
	return match ? match[1] : null;
};

export const getKeyByValue = (obj: Record<string, string>, value: string) => {
	return Object.keys(obj).find(key => obj[key] === value);
};

const WORD_COUNT_THRESHOLD = 1000;

export const isArticle = (htmlContent: string): boolean => {
	if (!htmlContent) {
		return false;
	}

	const plainText = htmlContent
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	const wordCount = plainText.split(' ').filter(Boolean).length;
	return wordCount > WORD_COUNT_THRESHOLD;
};

export const stripTags = (text: string) => text.replace(/<[^>]*>/g, '');

export const extractArticlePreview = (htmlContent: string) => {
	const pTagRegex = /<p>(.*?)<\/p>/gi;
	const matches = [...htmlContent.matchAll(pTagRegex)];

	const title =
		matches.length > 0 ? stripTags(matches[0][1]) : 'Untitled article';
	const excerpt =
		matches.length > 1 ? stripTags(matches[1][1]) : 'Tap to read more...';

	return {
		title,
		excerpt,
	};
};

export const generateSuggestions = (
	firstName: string,
	lastName: string,
): string[] => {
	const fn = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
	const ln = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
	const adjectives = [
		'mighty',
		'brave',
		'clever',
		'cool',
		'gentle',
		'bright',
		'wild',
		'calm',
		'swift',
		'kind',
		'royal',
		'cosmic',
		'sunny',
		'stormy',
		'golden',
		'crispy',
		'lucky',
	];
	const getRand = (arr: string[]) =>
		arr[Math.floor(Math.random() * arr.length)];
	const randNum = () => Math.floor(10 + Math.random() * 90);

	if (!fn || !ln) return [];
	const suggestions = [
		`${fn}${randNum()}`,
		`${ln}${randNum()}`,
		`${getRand(adjectives)}${fn.charAt(0).toUpperCase() + fn.slice(1)}`,
		`${getRand(adjectives)}${ln.charAt(0).toUpperCase() + ln.slice(1)}`,
		`${getRand(adjectives)}_${fn}`,
		`${getRand(adjectives)}${
			fn.charAt(0).toUpperCase() + fn.slice(1)
		}${randNum()}`,
		`${ln}_${getRand(adjectives)}`,
	];
	return suggestions;
};

export const formatAuthorName = (name: string): string => {
	if (!name) return '';
	return name
		.replace(/[-._]+/g, ' ')
		.split(' ')
		.filter(Boolean)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize
		.join(' ');
};

export const getAuthorList = (
	allTerms:
		| {
				id: string;
				link: string;
				name: string;
		  }[][]
		| undefined,
) => {
	return Array.isArray(allTerms) && allTerms.length > 0
		? allTerms[allTerms.length - 1]
		: [];
};

export const extractYouTubeId = (url: string): string | null => {
	const content = url.replace(/\\/g, ''); // Fix for escaped slashes in JSON
	const regex =
		/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
	const match = content.match(regex);
	return match ? match[1] : null;
};

export const formatAuthorSlug = (name: string) => {
	if (!name) return '';

	return (
		name
			.trim()
			.toLowerCase()
			// 1. Replace all non-alphanumeric characters (except space and hyphen)
			//    with a hyphen. This handles '.', ',', '_', '!', etc.
			.replace(/[^\w\s-]/g, '-')
			// 2. Replace all whitespace characters (which includes spaces) with a hyphen
			.replace(/\s+/g, '-')
			// 3. Remove multiple hyphens that may have resulted from steps 1 and 2
			.replace(/-+/g, '-')
	);
};

export const getInitialVideoOrientation = (post?: Patchwork.WPStory | null) => {
	const defaultOrientation = {
		isLandscape: true,
		aspectRatio: 16 / 9,
	};

	const termGroups = post?._embedded?.['wp:term'];
	if (!Array.isArray(termGroups)) {
		return defaultOrientation;
	}

	const hasShortCategory = termGroups.some(group => {
		if (!Array.isArray(group)) {
			return false;
		}

		return group.some(term => {
			if (!term || typeof term !== 'object') {
				return false;
			}

			const slug = (term as { slug?: unknown }).slug;
			if (typeof slug !== 'string') {
				return false;
			}

			return slug.toLowerCase().includes('short');
		});
	});

	if (hasShortCategory) {
		return {
			isLandscape: false,
			aspectRatio: 9 / 16,
		};
	}

	return defaultOrientation;
};

export const extractYoutubeId = (htmlContent: string) => {
	if (!htmlContent) return null;
	const content = htmlContent.replace(/\\/g, ''); // Fix for escaped slashes in JSON
	const embedMatch = content.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
	if (embedMatch && embedMatch[1]) return embedMatch[1];

	const watchMatch = content.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
	if (watchMatch && watchMatch[1]) return watchMatch[1];

	const shortMatch = content.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
	if (shortMatch && shortMatch[1]) return shortMatch[1];

	return null;
};

export const extractMuxPlaybackId = (htmlContent: string) => {
	const regex = /playback-id="([a-zA-Z0-9]+)"/;
	const match = htmlContent.match(regex);
	return match ? match[1] : null;
};

export const cleanHtmlContent = (html: string) => {
	if (!html) return '';
	let cleaned = html.replace(
		/<div class="mux-player-wrapper">[\s\S]*?<\/div>/gi,
		'',
	);
	cleaned = cleaned.replace(/<p>\s*(?:<a[^>]*>\s*<\/a>\s*)*\s*<\/p>/gi, '');
	return cleaned;
};

export function getQuoteInlineInfo(content: string, t: any) {
	if (!content) return { acct: '', displayText: '' };
	const match = content.match(
		/<p class="quote-inline">RE: <a href="https?:\/\/(.*?)\/(?:@([\w\d_\-]+))\/(\d+)".*?>(.*?)<\/a><\/p>/,
	);
	if (match) {
		const acct = `${match[2]}@${match[1]}`;
		const displayText = t('quote.quoted_by_acct', { acct });
		return { acct, displayText };
	}
	return { acct: '', displayText: '' };
}

export const getQuotePolicy = (status: Patchwork.Status): QuotePolicy => {
	const automatic = status.quote_approval?.automatic || [];

	if (automatic.includes('public')) return 'public';
	if (automatic.includes('followers')) return 'followers';

	return 'nobody';
};

export function extractPlainText(html: string): string {
	return html ? html.replace(/<[^>]+>/g, '') : '';
}

export const formatShortDate = (dateGmt: string) => {
	const m = moment.utc(dateGmt).local();
	const now = moment();
	const diffMs = now.diff(m);
	const duration = moment.duration(diffMs);

	// if under 24 hours, show relative social media format
	if (duration.asHours() < 24) {
		if (duration.asSeconds() < 60) return 'now';
		if (duration.asMinutes() < 60)
			return `${Math.floor(duration.asMinutes())}m`;
		return `${Math.floor(duration.asHours())}h`;
	}

	// if older, show the date and time
	if (!m.isSame(now, 'year')) {
		return m.format('MMM D, YYYY [at] h:mm A');
	}
	return m.format('MMM D [at] h:mm A');
};
