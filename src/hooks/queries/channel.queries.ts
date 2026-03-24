import {
	BristolChannelTimelineQueryKey,
	ChannelContentTypeQueryKey,
	ChannelFilterKeywordListQueryKey,
	ChannelFilterOutKeywordListQueryKey,
	ChannelHashtagListQueryKey,
	ChannelPostsTypeQueryKey,
	ContributorListQueryKey,
	ForYouTimelineQueryKey,
	GetChannelAdditionalInfoQueryKey,
	GetChannelDetailQueryKey,
	GetChannelFeedListQueryKey,
	GetChannelSearchQueryKey,
	GetCollectionChannelListQueryKey,
	GetCommunityAndChannelSearchQueryKey,
	GetCatchUpChannelListQueryKey,
	GetSpeakOutChannelListQueryKey,
	GetDetailCollectionChannelListQueryKey,
	GetFavouriteChannelListsQueryKey,
	GetForYouChannelListQueryKey,
	GetHomeTimelineQueryKey,
	GetLocalMastodonTimelineQueryKey,
	GetMyChannelListQueryKey,
	GetMyTotalChannelListQueryKey,
	GetNewsmastChannelDetailQueryKey,
	GetNewsmastChannelListQueryKey,
	GetNewsmastChannelListWBearerTokenQueryKey,
	GetNewsmastCollectionsQueryKey,
	GetNewsmastCommunityDetailBioQueryKey,
	GetNewsmastCommunityDetailProfileQueryKey,
	GetNewsmastCommunityHashtagQueryKey,
	GetNewsmastCommunityPeopleToFollowQueryKey,
	GetStarterPackLDetailQueryKey,
	GetStarterPackListQueryKey,
	MutedContributorListQueryKey,
	PatchworkChannelTimelineQueryKey,
	SearchContributorQueryKey,
} from './../../types/queries/channel.type';
import {
	getChannelAbout,
	getChannelAdditionalInfo,
	getChannelContentType,
	getChannelFeed,
	getChannelFilterKeywordList,
	getChannelFilterOutKeywordList,
	getChannelHashtagList,
	getChannelPostsType,
	getCollectionChannelList,
	getContributorList,
	getChannelDetail,
	getMutedContributorList,
	getDetailCollectionChannelList,
	getFavouriteChannelLists,
	getMyChannelList,
	getMyTotalChannelList,
	getRecommendedChannel,
	getSearchChannelResult,
	searchContributor,
	getHomeTimeline,
	searchChannelAndCommunity,
	getChannelListForChannelSection,
	getNewsmastChannelList,
	getNewsmastChannelDetail,
	getNewsmastCollectionList,
	getNewsmastCommunityDetailProfile,
	getNewsmastCommunityDetailBio,
	getNewsmastCommunityHashtags,
	getNewsmastCommunityPeopleToFollow,
	getNewsmastChannelListWBearerToken,
	getForYouChannelList,
	getCatchUpChannelList,
	getSpeakOutChannelList,
	getStarterPackList,
	getStarterPackDetail,
	getForYouTimeline,
} from '@/services/channel.service';
import { SearchServerInstanceQueryKey } from '@/types/queries/auth.type';
import {
	GetChannelAboutQueryKey,
	GetChannelFeedQueryKey,
	GetRecommendedChannelsQueryKey,
} from '@/types/queries/channel.type';
import { QueryOptionHelper } from '@/util/helper/helper';
import { infinitePageParam, PagedResponse } from '@/util/helper/timeline';
import {
	InfiniteData,
	useInfiniteQuery,
	UseInfiniteQueryOptions,
	useQuery,
} from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

export const useGetMyChannels = ({ enabled }: { enabled: boolean }) => {
	const queryKey: GetMyChannelListQueryKey = ['my-channel'];
	return useQuery({ queryKey, queryFn: getMyChannelList, enabled });
};

export const useRecommendedChannels = () => {
	const queryKey: GetRecommendedChannelsQueryKey = ['recommended-channel'];
	return useQuery({ queryKey, queryFn: getRecommendedChannel });
};

export const useGetChannelFeed = ({
	...queryParam
}: GetChannelFeedQueryKey[1]) => {
	const queryKey: GetChannelFeedQueryKey = ['channel-feed', queryParam];
	return useInfiniteQuery<
		Patchwork.Status[],
		Error,
		InfiniteData<PagedResponse<Patchwork.Status[]>>
	>({
		queryKey,
		//@ts-expect-error
		queryFn: getChannelFeed,
		...infinitePageParam,
	});
};

export const useGetHomeTimeline = ({
	...queryParam
}: GetHomeTimelineQueryKey[1]) => {
	const queryKey: GetHomeTimelineQueryKey = ['home-timeline', queryParam];
	return useInfiniteQuery<
		Patchwork.Status[],
		Error,
		InfiniteData<PagedResponse<Patchwork.Status[]>>
	>({
		queryKey,
		//@ts-expect-error
		queryFn: getHomeTimeline,
		...infinitePageParam,
	});
};

export const useGetForYouTimeline = () => {
	const queryKey: ForYouTimelineQueryKey = ['for-you-timeline'];
	return useInfiniteQuery({
		queryKey,
		queryFn: getForYouTimeline,
		select: data => ({
			...data,
			pages: data.pages.map(page => ({
				...page,
				data: page.data.filter(
					(status: Patchwork.Status) => status.visibility !== 'direct',
				),
			})),
		}),
		...infinitePageParam,
		initialPageParam: undefined,
	});
};

export const useGetChannelAbout = (domain: string) => {
	const queryKey: SearchServerInstanceQueryKey = [
		'search-server-instance',
		{ domain },
	];

	return useQuery({
		queryKey,
		queryFn: getChannelAbout,
		staleTime: Infinity,
		gcTime: Infinity,
	});
};

export const useGetChannelAdditionalInfo = (domain_name: string) => {
	const queryKey: GetChannelAdditionalInfoQueryKey = [
		'channel-additional-info',
		{ domain_name },
	];
	return useQuery({ queryKey, queryFn: getChannelAdditionalInfo });
};

export const useSearchChannel = ({
	searchKeyword,
	enabled = false,
}: {
	searchKeyword: string;
	enabled?: boolean;
}) => {
	const queryKey: GetChannelSearchQueryKey = [
		'channel-search',
		{ searchKeyword },
	];
	return useQuery({
		queryKey,
		queryFn: getSearchChannelResult,
		enabled,
	});
};

export const useSearchChannelAndCommunity = ({
	searchKeyword,
	enabled = false,
}: {
	searchKeyword: string;
	enabled?: boolean;
}) => {
	const queryKey: GetCommunityAndChannelSearchQueryKey = [
		'channel-community-search',
		{ searchKeyword },
	];
	return useQuery({
		queryKey,
		queryFn: searchChannelAndCommunity,
		enabled,
	});
};

export const useCollectionChannelList = () => {
	const queryKey: GetCollectionChannelListQueryKey = ['collection-channels'];
	return useQuery({ queryKey, queryFn: getCollectionChannelList });
};

export const useNewsmastCollectionList = ({
	options,
}: {
	options?: QueryOptionHelper<Patchwork.CollectionList[] | undefined>;
}) => {
	const queryKey: GetNewsmastCollectionsQueryKey = ['newsmast-collections'];
	return useQuery({
		queryKey,
		//@ts-expect-error
		queryFn: getNewsmastCollectionList,
		...options,
	});
};

export const useDetailCollectionChannelList = ({
	slug,
	type,
}: {
	slug: string;
	type?: string;
}) => {
	const queryKey: GetDetailCollectionChannelListQueryKey = [
		'detail-collection-channels',
		{ slug, type },
	];
	return useQuery({
		queryKey,
		queryFn: getDetailCollectionChannelList,
	});
};

export const useChannelDetail = ({ id }: { id: string }) => {
	const queryKey: GetChannelDetailQueryKey = ['channel-detail', { id }];
	return useQuery({
		queryKey,
		queryFn: getChannelDetail,
	});
};

export const useFavouriteChannelLists = (enabled?: boolean) => {
	const queryKey: GetFavouriteChannelListsQueryKey = [
		'favourite-channel-lists',
	];
	return useQuery({
		queryKey,
		queryFn: getFavouriteChannelLists,
		enabled,
	});
};

export const useSearchContributor = ({
	keyword,
	enabled,
}: {
	keyword: string;
	enabled: boolean;
}) => {
	const queryKey: SearchContributorQueryKey = [
		'search-contributor',
		{ keyword },
	];
	return useQuery({
		queryKey,
		queryFn: searchContributor,
		enabled,
	});
};

export const useGetContributorList = (channelId: string, enabled: boolean) => {
	const queryKey: ContributorListQueryKey = ['contributor-list', { channelId }];
	return useQuery({
		queryKey,
		queryFn: getContributorList,
		enabled,
	});
};

export const useGetChannelHashtagList = (
	channelId: string,
	enabled: boolean,
) => {
	const queryKey: ChannelHashtagListQueryKey = [
		'channel-hashtag-list',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getChannelHashtagList,
		enabled,
	});
};

export const useGetChannelFilterKeyword = (
	channelId: string,
	enabled: boolean,
) => {
	const queryKey: ChannelFilterKeywordListQueryKey = [
		'channel-filter-keyword-list',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getChannelFilterKeywordList,
		enabled,
	});
};

export const useGetChannelContentType = (channelId: string) => {
	const queryKey: ChannelContentTypeQueryKey = [
		'channel-content-type',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getChannelContentType,
	});
};

export const useGetMyTotalChannelList = () => {
	const queryKey: GetMyTotalChannelListQueryKey = ['my-total-channel'];
	return useQuery({
		queryKey,
		queryFn: getMyTotalChannelList,
		staleTime: Infinity,
	});
};

export const useGetMutedContributorList = (
	channelId: string,
	enabled: boolean,
) => {
	const queryKey: MutedContributorListQueryKey = [
		'muted-contributor-list',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getMutedContributorList,
		enabled,
	});
};

export const useGetChannelFilterOutKeyword = (
	channelId: string,
	enabled: boolean,
) => {
	const queryKey: ChannelFilterOutKeywordListQueryKey = [
		'channel-filter-out-keyword-list',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getChannelFilterOutKeywordList,
		enabled,
	});
};

export const useGetChannelPostsType = (channelId: string) => {
	const queryKey: ChannelPostsTypeQueryKey = [
		'channel-posts-type',
		{ channelId },
	];
	return useQuery({
		queryKey,
		queryFn: getChannelPostsType,
	});
};

export const useGetChannelFeedListQuery = (options?: { enabled: boolean }) => {
	const queryKey: GetChannelFeedListQueryKey = ['channel-feed-list'];
	return useQuery({
		queryKey,
		queryFn: getChannelListForChannelSection,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastChannelList = (options?: { enabled: boolean }) => {
	const queryKey: GetNewsmastChannelListQueryKey = ['newsmast-channel-list'];
	return useQuery({
		queryKey,
		queryFn: getNewsmastChannelList,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastChannelListWBearerToken = (options?: {
	enabled: boolean;
}) => {
	const queryKey: GetNewsmastChannelListWBearerTokenQueryKey = [
		'newsmast-channel-list-bearer',
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastChannelListWBearerToken,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastChannelDetail = ({
	accountHandle,
	options,
}: {
	accountHandle: string;
	options?: { enabled: boolean };
}) => {
	const queryKey: GetNewsmastChannelDetailQueryKey = [
		'newsmast-channel-detail',
		{ accountHandle },
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastChannelDetail,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastCommunityDetailProfile = ({
	id,
	options,
}: {
	id: string;
	options?: { enabled: boolean };
}) => {
	const queryKey: GetNewsmastCommunityDetailProfileQueryKey = [
		'newsmast-community-detail',
		{ id },
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastCommunityDetailProfile,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastCommunityDetailBio = ({
	id,
	domain_name,
	options,
}: {
	id: string;
	domain_name?: string;
	options?: { enabled: boolean };
}) => {
	const queryKey: GetNewsmastCommunityDetailBioQueryKey = [
		'newsmast-community-detail-bio',
		{ id, domain_name },
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastCommunityDetailBio,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastCommunityHashtags = ({
	id,
	options,
}: {
	id: string;
	options?: { enabled: boolean };
}) => {
	const queryKey: GetNewsmastCommunityHashtagQueryKey = [
		'newsmast-community-hashtag',
		{ id },
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastCommunityHashtags,
		enabled: options?.enabled,
	});
};

export const useGetNewsmastCommunityPeopleToFollow = ({
	id,
	domain_name,
	options,
}: {
	id: string;
	domain_name?: string;
	options?: { enabled: boolean };
}) => {
	const queryKey: GetNewsmastCommunityPeopleToFollowQueryKey = [
		'newsmast-community-people-to-follow',
		{ id, domain_name },
	];
	return useQuery({
		queryKey,
		queryFn: getNewsmastCommunityPeopleToFollow,
		enabled: options?.enabled,
	});
};

export const useGetForYouChannelList = () => {
	const queryKey: GetForYouChannelListQueryKey = ['for-you-channel-list'];

	return useQuery({
		queryKey,
		queryFn: getForYouChannelList,
		staleTime: Infinity,
		gcTime: Infinity,
		select: data => {
			if (data.length > 1 && data[1].attributes.slug === 'government') {
				const channels = data[1].attributes.channels.data;
				const reorderedChannels = channels?.map(channel => {
					const admin = channel.attributes.community_admin;

					return {
						...channel,
						attributes: {
							...channel.attributes,
							community_admin: admin
								? {
										...admin,
										username: admin.username.replace(
											'@channel.org',
											'@findout.media',
										),
								  }
								: admin,
						},
					};
				});

				const podcastIndex = reorderedChannels.findIndex(
					channel => channel?.attributes?.slug === 'findoutpodcast',
				);

				if (podcastIndex > 0) {
					const [podcastChannel] = reorderedChannels.splice(podcastIndex, 1);
					reorderedChannels.unshift(podcastChannel);
				}

				return reorderedChannels;
			}
			return data;
		},
	});
};

export const useGetCatchUpChannelList = () => {
	const queryKey: GetCatchUpChannelListQueryKey = ['catch-up-channel-list'];
	return useQuery({
		queryKey,
		queryFn: getCatchUpChannelList,
	});
};

export const useGetSpeakOutChannelList = () => {
	const queryKey: GetSpeakOutChannelListQueryKey = ['speak-out-channel-list'];
	return useQuery({
		queryKey,
		queryFn: getSpeakOutChannelList,
	});
};

export const useStarterPackList = () => {
	const queryKey: GetStarterPackListQueryKey = ['starter-pack-list'];
	return useQuery({
		queryKey,
		queryFn: getStarterPackList,
		//temp
		// select: data => {
		// 	return data
		// 		.filter(item => {
		// 			return [1, 5, 2].includes(parseInt(item.id));
		// 		})
		// 		.map(item => {
		// 			if (item.id == '5') {
		// 				return {
		// 					...item,
		// 					title: 'Team Bristol Cable Staff',
		// 					description: 'People and accounts related to Find Out Media',
		// 					collected_by: {
		// 						...item.collected_by,
		// 						display_name: 'Team Bristol Staff',
		// 						acct: '@Bristol',
		// 					},
		// 					total_accounts: 0,
		// 				};
		// 			}
		// 			if (item.id == '2') {
		// 				return {
		// 					...item,
		// 					title: 'Sport News',
		// 					description:
		// 						'Sport news related to Bristol City, covering matches, players, and club developments',
		// 					collected_by: {
		// 						...item.collected_by,
		// 						display_name: 'Team Bristol Staff',
		// 						acct: '@Bristol',
		// 					},
		// 					total_accounts: 0,
		// 				};
		// 			}
		// 			return {
		// 				...item,
		// 				collected_by: {
		// 					...item.collected_by,
		// 					display_name: 'Team Bristol Staff',
		// 					acct: '@Bristol',
		// 				},
		// 			};
		// 		});
		// },
	});
};

export const useStarterPackDetail = ({ slug }: { slug: string }) => {
	const queryKey: GetStarterPackLDetailQueryKey = [
		'starter-pack-detail',
		{ slug },
	];
	return useQuery({
		queryKey,
		queryFn: getStarterPackDetail,
		//temp
		// select: item => {
		// 	if (['5', '2'].includes(item.channel.id)) {
		// 		return { ...item, followers: {} };
		// 	}
		// 	return item;
		// },
	});
};
