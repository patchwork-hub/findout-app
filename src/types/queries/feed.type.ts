import { Asset } from 'react-native-image-picker';

export type FeedDetailQueryKey = [
	'feed-detail',
	{ id: string; domain_name: string },
];

export type StatusDetailQueryKey = ['status', { id: string }];

export type FeedRepliesQueryKey = [
	'feed-replies',
	{ id: string; domain_name: string },
];

export type AccountDetailFeedQueryKey = [
	'account-detail-feed',
	{
		account_id: string;
		exclude_reblogs: boolean;
		exclude_replies: boolean;
		exclude_original_statuses?: boolean;
		only_reblogs?: boolean;
	},
];

export type HashtagDetailFeedQueryKey = [
	'hashtag-detail-feed',
	{ domain_name: string; hashtag: string },
];

export type LinkPreviewQueryKey = ['link-preview', { url: string }];
export type TranslationLanguagesQueryKey = ['translation-languages'];

export type Poll = {
	options: string[];
	expires_in: number;
	multiple: boolean;
};

type Media = {
	media_ids: string[];
};

export type ComposeMutationPayload = {
	statusId?: string; // For Compose (Edit) Mutation //
	in_reply_to_id: string | undefined;
	language: string;
	sensitive?: boolean;
	spoiler_text?: string;
	status: string;
	visibility: Patchwork.ComposeVisibility;
	max_length?: number;
	poll: Poll | null;
	media_ids: string[];
	media_attributes?: { id: string; description: string }[];
	schedule_detail_id?: string;
	scheduled_at?: Date;
	local_only?: boolean;
};

export type RepostMutationPayload = {
	id: string;
} & ComposeMutationPayload;

export type QuoteMutationPayload = {
	quoted_status_id: string;
	quote_approval_policy: 'public' | 'nobody' | 'followers';
} & ComposeMutationPayload;

export type ComposeImagePayload = {
	image: Asset;
	onProgressChange: (progress: number) => void;
};

export type BookmarkStatusQueryParams = {
	statusId: Patchwork.Status['id'];
	isBookmark: boolean;
};

export type BookmarkStatusQueryKey = ['Bookmark-Timeline'];
export type ReportMutationPayload = {
	comment: string;
	account_id: Patchwork.Account['id'] | undefined;
	status_ids: Array<Patchwork.Status['id'] | undefined>;
	category: string;
	forward?: boolean;
	forward_to_domains?: string[];
	rule_ids?: string[] | null;
};

export type GetTrendingStatusesQueryKey = [
	'trending-statuses',
	{
		limit?: number;
		offset?: number;
	},
];

export type UpdateMediaAttachmentQueryKey = [
	'update-media-attachment',
	{ id: string; description: string },
];

export type GetScheduleListQueryKey = ['schedule-list'];
export type SaveDraftPayload = Pick<
	ComposeMutationPayload,
	| 'in_reply_to_id'
	| 'language'
	| 'media_ids'
	| 'poll'
	| 'status'
	| 'visibility'
	| 'sensitive'
	| 'spoiler_text'
	| 'local_only'
> & {
	drafted: boolean;
};

export type ViewMultiDraftQueryKey = ['view-multi-draft'];

export type ViewSpecificDraftQueryKey = ['view-specific-draft', { id: string }];

export type NotifiationMuteUnMuteQueryKey = ['notification-mute-unmute'];

export type GifSearchQueryKey = ['gif-search', { query: string }];

export type NotificationMarkerQueryKey = ['notification-marker'];

export type CheckEmailNotiSettingQueryKey = ['check-email-noti-setting'];

export type UserThemeSettingQueryKey = ['user-theme-setting'];

export type UserSetting = ['user-setting'];

export type UserLocaleQueryKey = ['user-locale'];

export type CustomEmojisQueryKey = ['custom-emojis'];

export type GetFavoritedByQueryKey = [
	'favorited-by',
	{ id: string; domain_name: string },
];

export type GetBoostedByQueryKey = [
	'boosted-by',
	{ id: string; domain_name: string },
];

export type GetQuotedByQueryKey = [
	'quoted-by',
	{ id: string; domain_name: string },
];

export type AltTextSetting = ['alt-text-setting'];
