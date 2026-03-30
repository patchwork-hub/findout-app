export type GetMyChannelListQueryKey = ['my-channel'];

export type GetRecommendedChannelsQueryKey = ['recommended-channel'];

export type GetChannelFeedQueryKey = [
	'channel-feed',
	{
		domain_name: string;
		remote: boolean;
		only_media: boolean;
		local?: boolean;
	},
];

export type GetHomeTimelineQueryKey = [
	'home-timeline',
	{ domain_name: string; remote: boolean; only_media: boolean },
];

export type PatchworkChannelTimelineQueryKey = [
	'patchwork-channel-timeline',
	{
		domain_name: string;
		account_id: string;
		exclude_reblogs: boolean;
		exclude_replies: boolean;
	},
];

export type BristolChannelTimelineQueryKey = [
	'bristol-channel-timeline',
	{
		domain_name: string;
		account_id: string;
		exclude_reblogs: boolean;
		exclude_replies: boolean;
	},
];

export type GetChannelAboutQueryKey = [
	'channel-about',
	{ domain_name: string },
];

export type GetChannelAdditionalInfoQueryKey = [
	'channel-additional-info',
	{ domain_name: string },
];

export type GetChannelSearchQueryKey = [
	'channel-search',
	{ searchKeyword: string },
];

export type GetCollectionChannelListQueryKey = ['collection-channels'];

export type GetNewsmastCollectionsQueryKey = ['newsmast-collections'];

export type GetDetailCollectionChannelListQueryKey = [
	'detail-collection-channels',
	{ slug: string; type?: string },
];

export type SearchContributorQueryKey = [
	'search-contributor',
	{ keyword: string },
];

export type ContributorListQueryKey = [
	'contributor-list',
	{ channelId: string },
];

export type MutedContributorListQueryKey = [
	'muted-contributor-list',
	{ channelId: string },
];

export type ChannelHashtagListQueryKey = [
	'channel-hashtag-list',
	{ channelId: string },
];

export type ChannelFilterKeywordListQueryKey = [
	'channel-filter-keyword-list',
	{ channelId: string },
];

export type ChannelContentTypeQueryKey = [
	'channel-content-type',
	{ channelId: string },
];

export type GetMyTotalChannelListQueryKey = ['my-total-channel'];

export type ChannelFilterOutKeywordListQueryKey = [
	'channel-filter-out-keyword-list',
	{ channelId: string },
];

export type ChannelPostsTypeQueryKey = [
	'channel-posts-type',
	{ channelId: string },
];
export type GetChannelDetailQueryKey = ['channel-detail', { id: string }];

export type GetFavouriteChannelListsQueryKey = ['favourite-channel-lists'];

export type GetCommunityAndChannelSearchQueryKey = [
	'channel-community-search',
	{ searchKeyword: string },
];

export type GetChannelFeedListQueryKey = ['channel-feed-list'];

export type GetLocalMastodonTimelineQueryKey = ['local-mstd-timeline'];

export type GetNewsmastChannelListQueryKey = ['newsmast-channel-list'];

export type GetNewsmastChannelListWBearerTokenQueryKey = [
	'newsmast-channel-list-bearer',
];

export type GetNewsmastChannelDetailQueryKey = [
	'newsmast-channel-detail',
	{ accountHandle: string },
];

export type GetNewsmastCommunityDetailProfileQueryKey = [
	'newsmast-community-detail',
	{ id: string },
];

export type GetNewsmastCommunityDetailBioQueryKey = [
	'newsmast-community-detail-bio',
	{ id: string; domain_name?: string },
];

export type GetNewsmastCommunityHashtagQueryKey = [
	'newsmast-community-hashtag',
	{ id: string },
];

export type GetNewsmastCommunityPeopleToFollowQueryKey = [
	'newsmast-community-people-to-follow',
	{ id: string; domain_name?: string },
];

export type GetChannelFeedCollectionsQueryKey = ['channel-feed-collections'];

export type GetForYouChannelListQueryKey = [
	'for-you-channel-list',
	{ slug: string },
];

export type GetCatchUpChannelListQueryKey = ['catch-up-channel-list'];

export type GetSpeakOutChannelListQueryKey = ['speak-out-channel-list'];

export type GetStarterPackListQueryKey = ['starter-pack-list'];

export type GetStarterPackLDetailQueryKey = [
	'starter-pack-detail',
	{ slug: string },
];

export type ForYouTimelineQueryKey = ['for-you-timeline'];
