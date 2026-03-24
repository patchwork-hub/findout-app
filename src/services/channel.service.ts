import {
	appendApiVersion,
	appendDynamicDomain,
	handleError,
	removeHttps,
} from '@/util/helper/helper';
import { AxiosResponse } from 'axios';
import { QueryFunctionContext } from '@tanstack/react-query';
import {
	BristolChannelTimelineQueryKey,
	ChannelContentTypeQueryKey,
	ChannelFilterKeywordListQueryKey,
	ChannelFilterOutKeywordListQueryKey,
	ChannelHashtagListQueryKey,
	ChannelPostsTypeQueryKey,
	ContributorListQueryKey,
	ForYouTimelineQueryKey,
	GetChannelAboutQueryKey,
	GetChannelAdditionalInfoQueryKey,
	GetChannelDetailQueryKey,
	GetChannelFeedQueryKey,
	GetChannelSearchQueryKey,
	GetCollectionChannelListQueryKey,
	GetCommunityAndChannelSearchQueryKey,
	GetDetailCollectionChannelListQueryKey,
	GetForYouChannelListQueryKey,
	GetHomeTimelineQueryKey,
	GetNewsmastChannelDetailQueryKey,
	GetNewsmastCollectionsQueryKey,
	GetNewsmastCommunityDetailBioQueryKey,
	GetNewsmastCommunityDetailProfileQueryKey,
	GetNewsmastCommunityHashtagQueryKey,
	GetNewsmastCommunityPeopleToFollowQueryKey,
	GetRecommendedChannelsQueryKey,
	GetStarterPackLDetailQueryKey,
	MutedContributorListQueryKey,
	PatchworkChannelTimelineQueryKey,
	SearchContributorQueryKey,
} from '@/types/queries/channel.type';
import instance from './instance';
import {
	DEFAULT_API_URL,
	DEFAULT_DASHBOARD_API_URL,
	CHANNEL_INSTANCE,
	NEWSMAST_INSTANCE_V1,
	DEFAULT_INSTANCE,
	PATCHWORK_CHANNEL_API_URL,
	DEFAULT_FINDOUT_DASHBOARD_API_URL,
} from '@/util/constant';
import { useAuthStore } from '@/store/auth/authStore';
import { SearchServerInstanceQueryKey } from '@/types/queries/auth.type';

export const getMyChannelList = async () => {
	try {
		const resp: AxiosResponse<Patchwork.MyChannel> = await instance.get(
			appendApiVersion('channels/my_channel'),
			{
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			},
		);
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const getMyTotalChannelList = async () => {
	try {
		const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
			await instance.get(appendApiVersion('channels'), {
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			});
		return resp.data?.data;
	} catch (e) {
		return handleError(e);
	}
};

export const getChannelFeed = async (
	qfContext: QueryFunctionContext<GetChannelFeedQueryKey>,
) => {
	try {
		const { domain_name, remote, only_media, local } = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;
		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion('timelines/public'),
			{
				params: {
					domain_name,
					remote,
					only_media,
					isDynamicDomain: true,
					max_id,
					...(!!local ? { local } : {}),
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const getHomeTimeline = async (
	qfContext: QueryFunctionContext<GetHomeTimelineQueryKey>,
) => {
	try {
		const state = useAuthStore.getState();
		const { domain_name, remote, only_media } = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;

		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion('timelines/home'),
			{
				params: {
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					remote,
					only_media,
					isDynamicDomain: true,
					max_id,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const getChannelAbout = async (
	qfContext: QueryFunctionContext<SearchServerInstanceQueryKey>,
) => {
	const { domain } = qfContext.queryKey[1];
	const resp: AxiosResponse<Patchwork.ChannelAbout> = await instance.get(
		appendApiVersion('instance', 'v2'),
		{
			params: { domain_name: domain, isDynamicDomain: true },
		},
	);
	return resp.data;
};

export const getChannelAdditionalInfo = async (
	qfContext: QueryFunctionContext<GetChannelAdditionalInfoQueryKey>,
) => {
	const { domain_name } = qfContext.queryKey[1];
	const resp: AxiosResponse<Patchwork.ChannelAdditionalInfo> =
		await instance.get(
			appendApiVersion('instance/extended_description', 'v1'),
			{
				params: { domain_name, isDynamicDomain: true },
			},
		);
	return resp.data;
};

export const getRecommendedChannel = async (
	qfContext: QueryFunctionContext<GetRecommendedChannelsQueryKey>,
) => {
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/recommend_channels', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
			},
		});
	return resp.data.data;
};

export const getSearchChannelResult = async (
	qfContext: QueryFunctionContext<GetChannelSearchQueryKey>,
) => {
	const { searchKeyword } = qfContext.queryKey[1];
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/search', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				q: searchKeyword,
			},
		});
	return resp.data.data;
};

export const getCollectionChannelList = async (
	qfContext: QueryFunctionContext<GetCollectionChannelListQueryKey>,
) => {
	const resp: AxiosResponse<{ data: Patchwork.CollectionList[] }> =
		await instance.get(appendApiVersion('collections', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
			},
		});
	return resp.data.data;
};

export const getNewsmastCollectionList = async (
	qfContext: QueryFunctionContext<GetNewsmastCollectionsQueryKey>,
) => {
	const resp: AxiosResponse<{ data: Patchwork.CollectionList[] }> =
		await instance.get(
			appendApiVersion('collections/newsmast_collections', 'v1'),
			{
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			},
		);
	return resp.data.data;
};

export const searchContributor = async (
	qfContext: QueryFunctionContext<SearchContributorQueryKey>,
) => {
	const keyword = qfContext.queryKey[1].keyword;
	const resp: AxiosResponse<Patchwork.SearchContributorRes> =
		await instance.get(appendApiVersion('channels/search_contributor', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				query: keyword,
			},
		});
	return resp.data;
};

export const getContributorList = async (
	qfContext: QueryFunctionContext<ContributorListQueryKey>,
) => {
	const patchwork_community_id = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{ contributors: Patchwork.ContributorList[] }> =
		await instance.get(appendApiVersion('channels/contributor_list', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				page: 1,
				per_page: 100,
				patchwork_community_id,
			},
		});
	return resp.data?.contributors;
};

export const getMutedContributorList = async (
	qfContext: QueryFunctionContext<MutedContributorListQueryKey>,
) => {
	const patchwork_community_id = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{ contributors: Patchwork.ContributorList[] }> =
		await instance.get(
			appendApiVersion('channels/mute_contributor_list', 'v1'),
			{
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
					page: 1,
					per_page: 100,
					patchwork_community_id,
				},
			},
		);
	return resp.data?.contributors;
};

export const getChannelHashtagList = async (
	qfContext: QueryFunctionContext<ChannelHashtagListQueryKey>,
) => {
	const channelId = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{ data: Patchwork.ChannelHashtag[] }> =
		await instance.get(
			appendApiVersion(`channels/${channelId}/community_hashtags`, 'v1'),
			{
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
					page: 1,
					per_page: 100,
				},
			},
		);
	return resp.data?.data;
};

export const getChannelFilterKeywordList = async (
	qfContext: QueryFunctionContext<ChannelFilterKeywordListQueryKey>,
) => {
	const channelId = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{
		data: Patchwork.ChannelFilterKeyword[];
	}> = await instance.get(
		appendApiVersion(`channels/${channelId}/community_filter_keywords`, 'v1'),
		{
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				page: 1,
				per_page: 100,
				filter_type: 'filter_in',
			},
		},
	);
	return resp.data?.data;
};

export const getChannelContentType = async (
	qfContext: QueryFunctionContext<ChannelContentTypeQueryKey>,
) => {
	const channelId = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{
		data: Patchwork.ChannelContentTpye[];
	}> = await instance.get(appendApiVersion(`content_types`, 'v1'), {
		params: {
			domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
			isDynamicDomain: true,
			patchwork_community_id: channelId,
		},
	});
	return resp.data?.data;
};

export const createChannelHashtag = async ({
	hashtag,
	channelId,
}: {
	hashtag: string;
	channelId: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(`channels/${channelId}/community_hashtags`, 'v1'),
			),
			{
				community_hashtag: { hashtag },
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const removeOrUpdateFilterKeyword = async ({
	keyword,
	channelId,
	keywordId,
	operation,
	filter_type,
	is_filter_hashtag,
}: {
	keyword: string;
	channelId: string;
	keywordId: string;
	filter_type: 'filter_in' | 'filter_out';
	operation: 'edit' | 'delete';
	is_filter_hashtag: boolean;
}) => {
	try {
		const url = appendDynamicDomain(
			process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
			appendApiVersion(
				`channels/${channelId}/community_filter_keywords/${keywordId}`,
				'v1',
			),
		);
		if (operation == 'delete') {
			const resp: AxiosResponse<{ message: string }> = await instance.delete(
				url,
			);
			return resp.data;
		}
		const resp: AxiosResponse<{ message: string }> = await instance.put(url, {
			keyword,
			is_filter_hashtag,
			filter_type,
		});
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const removeOrUpdateHashtag = async ({
	hashtag,
	channelId,
	hashtagId,
	operation,
}: {
	hashtag: string;
	channelId: string;
	hashtagId: string;
	operation: 'edit' | 'delete';
}) => {
	try {
		const url = appendDynamicDomain(
			process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
			appendApiVersion(
				`channels/${channelId}/community_hashtags/${hashtagId}`,
				'v1',
			),
		);
		if (operation == 'delete') {
			const resp: AxiosResponse<{ message: string }> = await instance.delete(
				url,
			);
			return resp.data;
		}
		const resp: AxiosResponse<{ message: string }> = await instance.put(url, {
			community_hashtag: { hashtag },
		});
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const addFilterInOutKeyword = async ({
	keyword,
	channelId,
	is_filter_hashtag,
	filter_type,
}: {
	keyword: string;
	channelId: string;
	is_filter_hashtag: boolean;
	filter_type: 'filter_in' | 'filter_out';
}) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(
					`channels/${channelId}/community_filter_keywords`,
					'v1',
				),
			),
			{
				keyword,
				is_filter_hashtag,
				filter_type,
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updateChannelContentType = async ({
	channel_type,
	custom_condition,
	patchwork_community_id,
}: {
	channel_type: string;
	custom_condition: 'and_condition' | 'or_condition';
	patchwork_community_id: string;
}) => {
	try {
		const resp: AxiosResponse<{ data: Patchwork.ChannelContentAttribute }> =
			await instance.post(
				appendDynamicDomain(
					process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					appendApiVersion(`content_types`, 'v1'),
				),
				{
					channel_type,
					custom_condition,
					patchwork_community_id,
				},
			);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updateChannelPostType = async ({
	posts,
	reposts,
	replies,
	channelId,
}: {
	posts: boolean;
	reposts: boolean;
	replies: boolean;
	channelId: string;
}) => {
	try {
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(`channels/${channelId}/community_post_types`, 'v1'),
			),
			{
				community_post_type: { posts, reposts, replies },
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getChannelFilterOutKeywordList = async (
	qfContext: QueryFunctionContext<ChannelFilterOutKeywordListQueryKey>,
) => {
	const channelId = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<{
		data: Patchwork.ChannelFilterKeyword[];
	}> = await instance.get(
		appendApiVersion(`channels/${channelId}/community_filter_keywords`, 'v1'),
		{
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				page: 1,
				per_page: 100,
				filter_type: 'filter_out',
			},
		},
	);
	return resp.data?.data;
};

export const getChannelPostsType = async (
	qfContext: QueryFunctionContext<ChannelPostsTypeQueryKey>,
) => {
	const channelId = qfContext.queryKey[1].channelId;
	const resp: AxiosResponse<Patchwork.ChannelPostType> = await instance.get(
		appendApiVersion(`channels/${channelId}/community_post_types`, 'v1'),
		{
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data;
};

export const getDetailCollectionChannelList = async (
	qfContext: QueryFunctionContext<GetDetailCollectionChannelListQueryKey>,
) => {
	const { slug, type = 'channel' } = qfContext.queryKey[1];
	const resp: AxiosResponse<
		{ data: Patchwork.ChannelList[] } | Patchwork.ChannelList[]
	> = await instance.get(appendApiVersion('collections/fetch_channels', 'v1'), {
		params: {
			domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
			isDynamicDomain: true,
			slug,
			type,
		},
	});
	if (type === 'newsmast') {
		return resp.data as Patchwork.ChannelList[];
	} else {
		return (resp.data as { data: Patchwork.ChannelList[] })?.data;
	}
};

export const getChannelDetail = async (
	qfContext: QueryFunctionContext<GetChannelDetailQueryKey>,
) => {
	const id = qfContext.queryKey[1].id;
	const resp: AxiosResponse<{ data: Patchwork.ChannelList }> =
		await instance.get(appendApiVersion('channels/channel_detail', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				removeBearerToken: true,
				id,
			},
		});
	return resp.data.data;
};

export const getFavouriteChannelLists = async () => {
	const state = useAuthStore.getState();
	const domain = removeHttps(state.userOriginInstance);
	const resp: AxiosResponse<{
		data: Patchwork.ChannelList[];
		meta: { total: number };
	}> = await instance.get(
		appendDynamicDomain(
			process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
			appendApiVersion(`joined_communities`, 'v1'),
		),
		{
			params: {
				instance_domain: domain,
				platform_type: 'newsmast.social',
			},
		},
	);
	return resp.data.data;
};

export const favouriteChannelMutationFn = async ({
	id,
	isNewsmastChannel,
}: {
	id: string;
	isNewsmastChannel?: boolean;
}) => {
	try {
		const state = useAuthStore.getState();
		const domain = removeHttps(state.userOriginInstance);
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(`joined_communities`, 'v1'),
			),
			isNewsmastChannel
				? {
						id,
						instance_domain: domain,
						platform_type: 'newsmast.social',
				  }
				: { id },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const deleteFavouriteChannelMutationFn = async ({
	id,
	isNewsmastChannel,
}: {
	id: string;
	isNewsmastChannel?: boolean;
}) => {
	try {
		const state = useAuthStore.getState();
		const domain = removeHttps(state.userOriginInstance);
		const resp: AxiosResponse<{ message: string }> = await instance.delete(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(`joined_communities/${id}`, 'v1'),
			),
			isNewsmastChannel
				? {
						params: {
							id,
							instance_domain: domain,
							platform_type: 'newsmast.social',
						},
				  }
				: {
						params: { id },
				  },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const setPrimaryChannel = async ({
	id,
	isNewsmastChannel,
}: {
	id: string;
	isNewsmastChannel?: boolean;
}) => {
	try {
		const state = useAuthStore.getState();
		const domain = removeHttps(state.userOriginInstance);
		const resp: AxiosResponse<{ message: string }> = await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion(`joined_communities/set_primary`, 'v1'),
			),
			isNewsmastChannel
				? {
						id,
						instance_domain: domain,
						platform_type: 'newsmast.social',
				  }
				: { id },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const searchChannelAndCommunity = async (
	qfContext: QueryFunctionContext<GetCommunityAndChannelSearchQueryKey>,
) => {
	const { searchKeyword } = qfContext.queryKey[1];

	const resp: AxiosResponse<Patchwork.ChannelAndCollectionSearch> =
		await instance.post(
			appendDynamicDomain(
				process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				appendApiVersion('search', 'v1'),
			),
			{
				q: searchKeyword,
			},
			{ params: { removeBearerToken: true } },
		);
	return resp.data;
};

export const getChannelListForChannelSection = async () => {
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/channel_feeds', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				removeBearerToken: true,
			},
		});
	return resp.data?.data;
};

export const getNewsmastChannelList = async () => {
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/newsmast_channels', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				removeBearerToken: true,
			},
		});
	return resp.data?.data;
};

export const getNewsmastChannelListWBearerToken = async () => {
	const state = useAuthStore.getState();
	// const isChannelUser = state.userOriginInstance == CHANNEL_INSTANCE;
	const domain = removeHttps(state.userOriginInstance);

	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/newsmast_channels', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				instance_domain: domain,
			},
		});
	return resp.data?.data;
};

export const getNewsmastChannelDetail = async (
	qfContext: QueryFunctionContext<GetNewsmastChannelDetailQueryKey>,
) => {
	const { accountHandle } = qfContext.queryKey[1];
	const resp: AxiosResponse<Patchwork.Account> = await instance.get(
		appendApiVersion(`accounts/lookup?acct=${accountHandle}`, 'v1'),
	);
	return resp.data;
};

export const getNewsmastCommunityDetailProfile = async (
	qfContext: QueryFunctionContext<GetNewsmastCommunityDetailProfileQueryKey>,
) => {
	const { id } = qfContext.queryKey[1];
	const resp: AxiosResponse<{
		data: Patchwork.NewsmastCommunityDetailProfile;
	}> = await instance.get(
		appendApiVersion('community_statuses/get_community_details_profile', 'v1'),
		{
			params: {
				id,
				domain_name: NEWSMAST_INSTANCE_V1,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data.data;
};

export const getNewsmastCommunityDetailBio = async (
	qfContext: QueryFunctionContext<GetNewsmastCommunityDetailBioQueryKey>,
) => {
	const { id, domain_name } = qfContext.queryKey[1];
	const { userOriginInstance } = useAuthStore.getState();
	const domain = removeHttps(userOriginInstance);
	const resp: AxiosResponse<{ data: Patchwork.ChannelList }> =
		await instance.get(
			appendApiVersion(`channels/channel_detail?id=${id}`, 'v1'),
			{
				params: {
					domain_name: domain_name || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
					instance_domain:
						userOriginInstance !== CHANNEL_INSTANCE ? domain : undefined,
				},
			},
		);
	return resp.data.data;
};

export const getNewsmastCommunityHashtags = async (
	qfContext: QueryFunctionContext<GetNewsmastCommunityHashtagQueryKey>,
) => {
	const { id } = qfContext.queryKey[1];
	const resp: AxiosResponse<Patchwork.GetNewsmastTagListResponse> =
		await instance.get(
			appendApiVersion(
				`channels/${id}/community_hashtags?per_page=100&page=1`,
				'v1',
			),
			{
				params: {
					domain_name: DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			},
		);
	return resp.data;
};

export const getNewsmastCommunityPeopleToFollow = async (
	qfContext: QueryFunctionContext<GetNewsmastCommunityPeopleToFollowQueryKey>,
) => {
	const { id, domain_name } = qfContext.queryKey[1];
	const { userOriginInstance } = useAuthStore.getState();
	const domain = removeHttps(userOriginInstance);
	const resp: AxiosResponse<{
		contributors: Patchwork.NewsmastComunityContributorList[];
	}> = await instance.get(
		appendApiVersion(
			`channels/contributor_list?page=1&per_page=100&patchwork_community_id=${id}`,
			'v1',
		),
		{
			params: {
				domain_name: domain_name || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				instance_domain:
					userOriginInstance !== CHANNEL_INSTANCE ? domain : undefined,
			},
		},
	);
	return resp.data.contributors;
};

export const getForYouChannelList = async () => {
	const state = useAuthStore.getState();
	const resp: AxiosResponse<{ data: Patchwork.CollectionList[] }> =
		await instance.get(
			appendApiVersion('collections/channel_feed_collections', 'v1'),
			{
				params: {
					domain_name: DEFAULT_FINDOUT_DASHBOARD_API_URL,
					isDynamicDomain: true,
				},
			},
		);

	return (resp.data?.data as Patchwork.CollectionList[]) || [];
};

export const getCatchUpChannelList = async () => {
	const state = useAuthStore.getState();
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/find_out_catch_up', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				...(state.userOriginInstance !== CHANNEL_INSTANCE
					? { instance_domain: 'findout.channel.org' }
					: {}),
			},
		});

	return (resp.data?.data as Patchwork.ChannelList[]) || [];
};

export const getSpeakOutChannelList = async () => {
	const state = useAuthStore.getState();
	const resp: AxiosResponse<{ data: Patchwork.ChannelList[] }> =
		await instance.get(appendApiVersion('channels/find_out_speak_out', 'v1'), {
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				...(state.userOriginInstance !== CHANNEL_INSTANCE
					? { instance_domain: 'findout.channel.org' }
					: {}),
			},
		});

	return (resp.data?.data as Patchwork.ChannelList[]) || [];
};

export const getStarterPackList = async () => {
	const resp: AxiosResponse<{ data: Patchwork.StarterPack[] }> =
		await instance.get(
			appendApiVersion('channels/starter_packs_channels', 'v1'),
			{
				params: {
					domain_name:
						process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
					isDynamicDomain: true,
					starter_pack_source: 'findout',
				},
			},
		);
	return resp.data.data;
};

export const getStarterPackDetail = async (
	qfContext: QueryFunctionContext<GetStarterPackLDetailQueryKey>,
) => {
	const id = qfContext.queryKey[1].slug;
	const resp: AxiosResponse<Patchwork.StarterPackDetail> = await instance.get(
		appendApiVersion(`channels/${id}/starter_packs_detail`, 'v1'),
		{
			params: {
				domain_name: process.env.DASHBOARD_API_URL || DEFAULT_DASHBOARD_API_URL,
				isDynamicDomain: true,
				starter_pack_source: 'findout',
			},
		},
	);
	return resp.data;
};

export const getForYouTimeline = async (
	qfContext: QueryFunctionContext<ForYouTimelineQueryKey>,
) => {
	try {
		const max_id = qfContext.pageParam as string;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`timelines/for_you_custom_timeline`, 'v1'),
			{
				params: {
					max_id,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId: string | undefined = undefined;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: maxId ? { next: { max_id: maxId } } : undefined,
		};
	} catch (e) {
		return handleError(e);
	}
};
