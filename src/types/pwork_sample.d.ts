/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="nativewind/types" />

declare namespace Patchwork {
	type User = {
		name: string;
		address: string;
		id: string;
	};
	type Country = {
		alpha2: string;
		common_name: string;
		emoji_flag: string;
		country_code: string;
	};
	type Collection = {
		id: number;
		name: string;
		slug: string;
		image_file_name: string;
		image_content_type: string;
		image_file_size: number;
		image_updated_at: string;
		community_count: number;
		created_at: string;
		updated_at: string;
		image_url: string;
		is_virtual: boolean;
	};

	type Account = {
		id: string;
		account_id: string;
		username: string;
		acct: string;
		display_name: string;
		locked: boolean;
		domain: string | null;
		bot: boolean;
		discoverable: boolean;
		hide_collections: boolean;
		group: boolean;
		created_at: string;
		note: string;
		url: string;
		uri: string;
		avatar: string;
		image_url: string;
		avatar_static: string;
		header: string;
		header_static: string;
		primary_community_slug: string;
		primary_community_name: string;
		followers_count: number;
		following_count: number;
		statuses_count: number;
		last_status_at: string;
		collection_count: number;
		community_count: number;
		country: string;
		country_common_name: string;
		dob: string;
		is_followed: boolean;
		is_requested: boolean;
		subtitle: string;
		contributor_role: string;
		voices: string;
		media: string;
		hash_tag_count: number;
		noindex: boolean;
		emojis: [];
		fields: Field[];
		tags: AccountBioHashTags[];
		email: string;
		phone: string;
		about_me: string;
		source?: {
			privacy: string;
			sensitive: string;
			language: null;
			note: string;
			fields: [];
			follow_requests_count: number;
			hide_collections?: string;
			discoverable?: boolean;
			indexable: boolean;
			email?: string;
			phone?: string;
		};
		roles: Role[];
	};

	type MuteBlockUserAccount = {
		id: string;
		username: string;
		acct: string;
		display_name: string;
		locked: boolean;
		bot: boolean;
		discoverable: boolean;
		indexable: boolean;
		group: boolean;
		created_at: string;
		note: string;
		url: string;
		uri: string;
		avatar: string;
		avatar_static: string;
		header: string;
		header_static: string;
		followers_count: number;
		following_count: number;
		statuses_count: number;
		last_status_at: string;
		hide_collections: boolean;
		noindex: boolean;
		mute_expires_at: string;
		emojis: Emoji[];
		roles: Role[];
		fields: Field[];
		isUnMutedNow?: boolean;
		isUnBlockedNow?: boolean;
	};

	type RelationShip = {
		blocked_by: boolean;
		blocking: boolean;
		domain_blocking: boolean;
		endorsed: boolean;
		followed_by: boolean;
		following: boolean;
		id: string;
		languages: null;
		muting: boolean;
		muting_notifications: boolean;
		note: string;
		notifying: boolean;
		requested: boolean;
		requested_by: boolean;
		showing_reblogs: boolean;
	};

	type ChannelList = {
		id: string;
		type: 'channel' | 'newsmast_channel';
		attributes: ChannelAttributes;
	};

	type ProfileList = {
		id: string;
		type: 'account';
		attributes: ProfileAttributes;
	};

	type ProfileAttributes = {
		id: string;
		name: string;
		username: string;
		email: string;
		display_name: string;
		confirmed_at: string;
		suspended_at: string | undefined;
		domain_name: string;
		avatar_image_url: string;
	};

	type MyChannel = {
		channel: {
			data: ChannelList;
		};
		channel_feed: {
			data: ProfileList;
		};
	};

	type CollectionList = {
		id: string;
		type: string;
		attributes: CollectionAttributes;
	};

	type CollectionAttributes = {
		id: number;
		name: string;
		slug: string;
		sorting_index: number;
		community_count: number;
		banner_image_url: string;
		avatar_image_url: string;
		channels: {
			data: ChannelList[];
		};
	};

	type ChannelAndCollectionSearch = {
		communities: {
			data: ChannelList[];
		};
		collections: {
			data: CollectionList[];
		};
		channel_feeds: {
			data: ChannelList[];
		};
		newsmast_channels: {
			data: ChannelList[];
		};
	};

	type ChannelAttributes = {
		id: number;
		name: string;
		slug: string;
		description: string;
		is_recommended: boolean;
		admin_following_count: number;
		account_id: number;
		patchwork_collection_id: number;
		guides: string;
		participants_count: number;
		visibility: string;
		channel_type: string;
		community_type: {
			data: {
				id: string;
				type: string;
				attributes: {
					id: number;
					name: string;
				};
			};
		};
		banner_image_url: string;
		avatar_image_url: string;
		domain_name: string;
		follower: 0;
		favourited: boolean;
		is_primary: boolean;
		community_admin: {
			id: string;
			account_id: string;
			username: string;
		};
		patchwork_community_hashtags: PatchworkCommunityHashtag[];
		favourited_count: number;
	};

	type PatchworkCommunityHashtag = {
		id: number;
		patchwork_community_id: number;
		hashtag: string;
		name: string;
		created_at: string;
		updated_at: string;
	};

	type HashTag = {
		id: string;
		name: string;
		hasNoti?: boolean;
	};

	type Channel = {
		id: string;
		name: string;
		is_private: boolean;
		slug: string;
		image_updated_at: string;
		description: string;
		domain_name: string;
		image_url: string;
		created_at: string;
		updated_at: string;
	};

	type LinkPreview = {
		url: string;
		favicon: string;
		title: string;
		description: string;
		images: {
			src: string;
			size: Array<number>;
			type: string;
		}[];
		videos: [];
	};

	type Status = {
		id: string;
		communities: Array<{
			id: number;
			name: string;
			slug: string;
		}>;
		community_ids?: string[]; // Scheduled Status
		community_id: number;
		community_name: stirng;
		community_slug: string;
		created_at: string;
		in_reply_to_id?: string;
		in_reply_to_account_id?: string;
		sensitive: boolean;
		spoiler_text?: string;
		visibility: string;
		local_only?: boolean;
		language: string;
		uri: string;
		url: string;
		replies_count: number;
		reblogs_count: number;
		quotes_count: number;
		favourites_count: number;
		translated_text: string;
		edited_at?: null;
		image_url: string;
		favourited: boolean;
		meta_title: string;
		bookmarked: boolean;
		reblogged: boolean;
		muted: boolean;
		pinned: boolean;
		content: string;
		filtered: any;
		reblog?: Status;
		application: {
			name: string;
			website?: null;
		};
		account: Account;
		media_attachments: Attachment[];
		mentions: Mention[];
		tags: Tags[];
		emojis: any;
		card?: Card;
		poll: Poll;
		is_rss_content: boolean;
		rss_link: string | null;
		is_meta_preview: boolean;
		text?: string;
		text_count: number;
		scheduled_at?: string;
		drafted?: boolean;
		isDeleted?: boolean;
		isMuted?: boolean;
		isBlocked?: boolean;
		quote?: {
			state: QuoteState;
			quoted_status: Status | null;
			quoted_status_id?: string | null;
		};
		quote_approval: {
			current_user: QuoteUserPermission;
			manual: QuotePolicyGroup[];
			automatic: QuotePolicyGroup[];
		};
		custom?: {
			isHashtagExpanded?: boolean;
			isLongPost?: boolean;
			forceShowSensitiveContent?: boolean;
			forceHideStatus?: boolean;
			forceShowHiddenQuote?: boolean;
		};
	};

	type QuoteState =
		| 'pending'
		| 'accepted'
		| 'rejected'
		| 'revoked'
		| 'deleted'
		| 'unauthorized'
		| 'blocked_account'
		| 'blocked_domain'
		| 'muted_account';

	type QuotePolicyGroup =
		| 'public'
		| 'followers'
		| 'following'
		| 'unsupported_policy';

	type QuoteUserPermission = 'automatic' | 'manual' | 'denied' | 'unknown';

	type StatusDetail = {
		id: string;
		created_at: string;
		in_reply_to_id?: string;
		in_reply_to_account_id?: string;
		sensitive: boolean;
		spoiler_text?: string;
		visibility: string;
		language: string;
		uri: string;
		url: string;
		replies_count: number;
		reblogs_count: number;
		quotes_count: number;
		favourites_count: number;
		edited_at?: string;
		content: string;
		reblog?: Status;
		application: {
			name: string;
			website?: null;
		};
		account: Account;
		media_attachments: Attachment[];
		mentions: Mention[];
		tags: any;
		emojis: any;
		card?: Card;
		poll?: Poll;
	};

	type HashtagDetail = {
		id: string;
		history: HashtagHistory[];
		name: string;
		url: string;
		following?: boolean;
	};

	type HashtagHistory = {
		day: string;
		accounts: string;
		uses: string;
	};

	type HashtagsFollowing = {
		history: HashtagHistory[];
		name: string;
		url: string;
		following: boolean;
	};

	type ChannelAbout = {
		configuration: any;
		contact: {
			account: {
				acct: string;
				avatar: string;
				avatar_static: string;
				bot: boolean;
				created_at: string;
				discoverable: null;
				display_name: string;
				emojis: [];
				fields: [];
				followers_count: number;
				following_count: number;
				group: boolean;
				header: string;
				header_static: string;
				hide_collections: null;
				id: string;
				indexable: boolean;
				last_status_at: string;
				locked: boolean;
				noindex: boolean;
				note: string;
				statuses_count: number;
				uri: string;
				url: string;
				username: string;
			};
		};
		description: string;
		domain: string;
		languages: string;
		rules: ChannelAboutHint[];
		thumbnail: {
			blurhash: string;
			url: string;
		};
		title: string;
	};

	type ChannelAdditionalInfo = {
		content: string;
		updated_at: string;
	};

	type TimelineReplies = {
		ancestors: Status[];
		descendants: Status[];
	};

	type ChannelAboutHint = {
		hint: string;
		id: string;
		text: string;
	};

	type Emoji = {
		shortcode: string;
		url: string;
		static_url: string;
		visible_in_picker: boolean;
		category?: string;
	};

	type Role = {
		id: string;
		name: string;
		color: string;
	};

	type Mention = {
		id: string;
		username: string;
		acct: string;
		url: string;
	};

	type Attachment = {
		id: string;
		type: 'image' | 'gifv' | 'video';
		url: string;
		preview_url: string;
		sensitive?: boolean;
		remote_url?: string;
		text_url?: string;
		meta?: {
			original?: {
				width: number;
				height: number;
				size: string;
				aspect: number;
				duration: number;
			};
			small?: { width: number; height: number; size: string; aspect: number };
			focus?: { x: number; y: number };
		};
		description?: string;
		blurhash?: string;
		custom?: {
			isShowAltTextModal?: boolean;
		};
	};

	type ImageUrl = {
		id: Patchwork.Attachment['id'];
		preview_url?: Patchwork.Attachment['preview_url'];
		url: Patchwork.Attachment['url'];
		remote_url?: Patchwork.Attachment['remote_url'];
		id: Patchwork.Attachment['id'];
		preview_url?: Patchwork.Attachment['preview_url'];
		url: Patchwork.Attachment['url'];
		remote_url?: Patchwork.Attachment['remote_url'];
		sensitive?: boolean;
		width?: number;
		height?: number;
	};

	type ComposeVisibility =
		| 'public'
		| 'unlisted'
		| 'private'
		| 'direct'
		| 'local';

	// type FieldName =
	// 	| 'Patreon'
	// 	| 'X'
	// 	| 'TikTok'
	// 	| 'Youtube'
	// 	| 'Linkedin'
	// 	| 'Instagram'
	// 	| 'Reddit'
	// 	| 'Facebook'
	// 	| 'Twitch';

	type Field = {
		name: string;
		value: string;
		verified_at?: string;
	};

	type ProfileDetail = {
		account_data: {
			account: Account;
			is_requested: boolean;
			is_my_account: boolean;
			is_followed: boolean;
		};
		community_images_url: string[];
		following_images_url: string[];
		is_admin: boolean;
		community_slug: string;
		account_type: string;
	};

	type Tags = {
		name: string;
		url: string;
	};

	type LoginRespone = {
		access_token: string;
		token_type: string;
		scope: string;
		created_at: string;
	};

	type WPUserProfileResponse = {
		wp_id: number;
		display_name: string;
		username: string;
		email: string;
		primary_blog: number;
		avatar_URL: string;
		profile_URL: string;
	};

	type SocialLoginSuccessResponse = {
		wordpressToken: string;
		mastodonToken: Patchwork.LoginRespone;
	};

	type PollOptions = {
		id: string;
		title: string;
		votes_count: number;
	};

	type Poll = {
		id: string;
		options: PollOptions[];
		expires_at: string | null;
		expired: boolean;
		multiple: boolean;
		votes_count: number;
		voters_count: number;
		voted: boolean;
		own_votes: number[];
		emojis: string[];
	};

	type Conversations = {
		id: string;
		unread: boolean;
		accounts: Patchwork.Account[];
		last_status: Patchwork.Status;
	};

	type SearchResult = {
		accounts: Account[];
		hashtags: HashTag[];
		statuses: Status[];
	};

	type PushNotiResponse = {
		notification: {
			android: {};
			body: string;
			title: string;
		};
		originalPriority: number;
		priority: number;
		sentTime: number;
		data: {
			noti_type:
				| 'favourite'
				| 'mention'
				| 'follow'
				| 'reblog'
				| 'poll'
				| 'follow_request';
			reblogged_id: string;
			destination_id: string;
			visibility: Patchwork.ComposeVisibility;
		};
		from: string;
		messageId: string;
		ttl: number;
		collapseKey: string;
	};

	type NotiReq = {
		id: string;
		created_at: string | Date;
		updated_at: string | Date | null;
		notifications_count: string;
		account: Patchwork.Account;
		last_status: Patchwork.Status;
	};

	type Instance<T extends 'v1' | 'v2'> = T extends 'v2'
		? Instance_V2
		: Instance_V1;

	type Instance_V2 = {
		domain: string;
		title: string;
		version: string;
		source_url: string;
		description: string;
		usage: { users: { active_month: number } };
		thumbnail: {
			url: string;
			blurhash?: string;
			versions?: { '@1x'?: string; '@2x'?: string };
		};
		languages: string[];
		configuration: {
			urls: { streaming_api: string };
			accounts: { max_featured_tags: number };
			statuses: {
				max_characters: number;
				max_media_attachments: number;
				characters_reserved_per_url: number;
			};
			media_attachments: {
				supported_mime_types: string[];
				image_size_limit: number;
				image_matrix_limit: number;
				video_size_limit: number;
				video_frame_rate_limit: number;
				video_matrix_limit: number;
			};
			poll: {
				max_options: number;
				max_characters_per_option: number;
				min_expiration: number;
				max_expiration: number;
			};
			translation: { enabled: boolean };
			registrations: {
				enabled: boolean;
				approval_required: boolean;
				message?: string;
			};
		};
		registrations: {
			enabled: boolean;
			approval_required: boolean;
			reason_required: boolean;
			message: string | null;
			min_age: number;
			url: string | null;
		};
		contact: { email: string; account: Account };
		rules: Rule[];
		account_domain?: string;
	};
	type Instance_V1 = {
		uri: string;
		title: string;
		description: string;
		thumbnail: {
			url: string;
			blurhash?: string;
			versions?: { '@1x'?: string; '@2x'?: string };
		};
		short_description: string;
		email: string;
		version: string;
		languages: string[];
		registrations: boolean;
		approval_required: boolean;
		invites_enabled: boolean;
		urls: {
			streaming_api: string;
		};
		stats: {
			user_count: number;
			status_count: number;
			domain_count: number;
		};
		thumbnail?: string;
		contact_account?: Account;
		configuration?: {
			statuses: {
				max_characters: number;
				max_media_attachments: number;
				characters_reserved_per_url: number;
			};
			media_attachments: {
				supported_mime_types: string[];
				image_size_limit: number;
				image_matrix_limit: number;
				video_size_limit: number;
				video_frame_rate_limit: number;
				video_matrix_limit: number;
			};
			poll: {
				max_options: number;
				max_characters_per_option: number;
				min_expiration: number;
				max_expiration: number;
			};
		};
		account_domain?: string;
	};

	type InstanceResponse = {
		vapid_key: string;
		redirect_uri: string;
		client_id: string;
		client_secret: string;
		client_secret_expires_at: string;
		id: string;
		name: string;
		website: string;
		scopes: Array<string>;
		redirect_uris: Array<string>;
	};

	type InstanceAuthroizationResponse = {
		access_token: string;
		token_type: string;
		scope: string;
		created_at: string;
	};

	type ContributorFollowStatus = 'not_followed' | 'following' | 'requested';

	type Contributor = {
		id: string;
		username: string;
		display_name: string;
		domain: string;
		note: string;
		avatar_url: string;
		profile_url: string;
		following: ContributorFollowStatus;
		is_muted: boolean;
		is_own_account: boolean;
	};

	type SearchContributorRes = {
		accounts: Contributor[];
	};

	type ContributorList = {
		id: string;
		type: string;
		attributes: Contributor;
	};

	type ChannelHashtag = {
		id: number;
		patchwork_community_id: number;
		hashtag: string;
		name: string;
		created_at: string;
		updated_at: string;
	};

	type ChannelFilterKeyword = {
		id: number;
		patchwork_community_id: number;
		keyword: string;
		is_filter_hashtag: boolean;
		created_at: string;
		updated_at: string;
		filter_type: string;
	};

	type Lists = {
		id: string;
		title: string;
		replies_policy: string;
		exclusive: boolean;
	};

	type ChannelContentTpye = {
		id: string;
		type: string;
		attributes: ChannelContentAttribute;
	};

	type ChannelContentAttribute = {
		id: number;
		channel_type: string;
		custom_condition: 'or_condition' | 'and_condition';
		patchwork_community_id: number;
		created_at: string;
		updated_at: string;
	};

	type ChannelPostType = {
		posts: boolean;
		reposts: boolean;
		replies: boolean;
	};

	type SuggestedPeople = {
		source: string;
		account: Account;
	};

	type SearchAll = {
		accounts: Account[];
		hashtags: HashtagDetail[];
		statuses: Status[];
	};

	type DraftStatusParam = {
		poll: null;
		text: string;
		drafted: boolean;
		language: string;
		media_ids: string[];
		sensitive: boolean;
		text_count: number | null;
		visibility: visibility;
		idempotency: string | null;
		scheduled_at: string | null;
		spoiler_text: string;
		community_ids: string | null;
		application_id: number;
		in_reply_to_id: string | null;
		is_rss_content: boolean;
		is_meta_preview: boolean;
		with_rate_limit: boolean;
		allowed_mentions: string | null;
		is_only_for_followers: boolean;
	};

	type DraftStatusItem = {
		id: string;
		params: DraftStatusParam;
		media_attachments: Attachment[];
	};

	type MultiDraftStatusData = {
		date: string;
		datas: DraftStatusItem[];
	};

	type Schedule = {
		id: string;
		scheduled_at: Date;
		params: ScheduleParams;
		media_attachments: any[];
	};

	type ScheduleParams = {
		poll: {
			expires_in: number;
			multiple: boolean;
			options: string[];
		};
		text: string;
		drafted: boolean;
		language: string;
		media_ids: string[];
		sensitive: boolean;
		text_count: number;
		visibility: ComposeVisibility;
		idempotency?: string;
		scheduled_at?: string;
		spoiler_text: string;
		community_ids: string[];
		application_id: number;
		in_reply_to_id?: string;
		is_rss_content: boolean;
		is_meta_preview: boolean;
		with_rate_limit: boolean;
		allowed_mentions?: boolean;
		is_only_for_followers: boolean;
	};

	type NotificationTypes =
		| 'mention'
		| 'status'
		| 'reblog'
		| 'favourite'
		| 'follow'
		| 'poll'
		| 'update'
		| 'admin.report'
		| 'admin.sign_up'
		| 'severed_relationships'
		| 'moderation_warning'
		| 'annual_report'
		| 'quote'
		| 'quoted_update';

	type RelationshipSeveranceEvent = {
		id: string;
		type: 'domain_block' | 'user_domain_block' | 'account_suspension';
		purged: boolean;
		target_name: string;
		followers_count: number;
		following_count: number;
		created_at: string;
	};

	type NotificationGroup = {
		group_key: string;
		notifications_count: number;
		type: NotificationTypes;
		most_recent_notification_id: string;
		sample_account_ids: string[];
		status_id?: string;
		page_min_id?: string;
		page_max_id?: string;
		latest_page_notification_at?: string;
		event?: RelationshipSeveranceEvent;
		report?: {
			id: string;
			action_taken: boolean;
			action_taken_at?: string;
			category: string;
			comment: string;
			forwarded: boolean;
			created_at: string;
			status_ids?: string[];
			rule_ids?: string[];
			target_account: Account;
		};
		moderation_warning?: {
			id: string;
			action:
				| 'none'
				| 'disable'
				| 'silence'
				| 'suspend'
				| 'mark_statuses_as_sensitive'
				| 'delete_statuses'
				| 'sensitive';
			text: string;
			target_account: Account;
			status_ids?: string[];
			created_at?: string;
		};
	};

	type GroupedNotificationResults = {
		accounts: Account[];
		statuses?: Status[];
		notification_groups: NotificationGroup[];
	};

	type NewsmastCommunityDetailProfile = {
		community_followed_user_counts: number;
		community_name: string;
		community_description: string;
		collection_name: string;
		community_url: string;
		community_header_url: string;
		community_slug: string;
		is_joined: boolean;
		is_admin: boolean;
		participants_count: number;
		is_pinned: boolean;
		admin_following_count: number;
	};

	type NewsmastCommunityBio = {
		id: number;
		slug: string;
		name: string;
		bot_account: string;
		bot_account_id: string;
		bio: string;
		bot_account_info: any | null;
		guides: {
			title: string;
			position: number;
			description: string;
		}[];
	};

	type NewsmastTagHistory = {
		day: string;
		accounts: string;
		uses: string;
	};

	type NewsmastTagItem = {
		id: number;
		name: string;
		url: string;
		history: TagHistory[];
		post_count: number;
		following: boolean;
	};

	type NewsmastTagMeta = {
		has_more_objects: boolean;
		offset: number;
	};

	type GetNewsmastTagListResponse = {
		data: TagItem[];
		meta: TagMeta;
	};

	type NewsmastCommunityPeopleToFollow = {
		data: Account[];
		meta: { has_more_objects: boolean };
	};

	type NewsmastComunityContributorList = {
		id: string;
		type: 'account';
		attributes: NewsmastContributorAcc;
	};

	type NewsmastContributorAcc = {
		id: string;
		username: string;
		display_name: string;
		note: string;
		avatar_url: string;
		profile_url: string;
		following: 'followed' | 'not_followed';
		is_muted: boolean;
		acct: string;
	};

	type GifRes = {
		content_description: string;
		content_description_source: string;
		created: number;
		flags: string[];
		hasaudio: boolean;
		id: string;
		itemurl: string;
		media_formats: GifMediaFormats;
		tags: string[];
		title: string;
		url: string;
	};

	type GifMediaFormats = {
		gif: GIFInfo;
		gifpreview: GIFInfo;
		mp4: GIFInfo;
		tinygif: GIFInfo;
		tinygifpreview: GIFInfo;
	};

	type GIFInfo = {
		url: string;
		duration: number;
		preview: string;
		size: number;
		dims: number[];
	};

	type NotificationMarker = {
		notifications: {
			last_read_id: string;
			version: number;
			updated_at: string;
		};
	};

	type CustomEmojis = {
		shortcode: string;
		url: string;
		static_url: string;
		visible_in_picker: boolean;
		category: string;
	};

	type UserTheme = {
		app_name: string;
		account_id: string;
		settings: {
			theme: {
				type: 'light' | 'dark' | undefined;
			};
		};
	};

	type WPStory = {
		id: number;
		date: string;
		date_gmt: string;
		guid: {
			rendered: string;
		};
		modified: string;
		modified_gmt: string;
		slug: string;
		status: string;
		type: string;
		link: string;
		title: {
			rendered: string;
		};
		content: {
			rendered: string;
			protected: boolean;
		};
		excerpt: {
			rendered: string;
			protected: boolean;
		};
		_embedded: {
			'wp:featuredmedia'?: {
				source_url: string;
			}[];
			'wp:term'?: {
				id: string;
				link: string;
				name: string;
			}[][];
			author?: {
				id: number;
				name: string;
				avatar_urls: string;
			}[];
		};
		author: number;
		featured_media: number;
		comment_status: string;
		ping_status: string;
		sticky: boolean;
		template: string;
		format: string;
		meta: {
			[key: string]: any;
		};
		categories: number[];
		tags: number[];
		class_list: string[];
		jetpack_featured_media_url: string;
		jetpack_likes_enabled: boolean;
		jetpack_sharing_enabled: boolean;
		jetpack_shortlink: string;
		'jetpack-related-posts': any[];
		_links: {
			self: { href: string; targetHints?: { allow: string[] } }[];
			collection: { href: string }[];
			about: { href: string }[];
			author: { embeddable: boolean; href: string }[];
			replies: { embeddable: boolean; href: string }[];
			'version-history': { count: number; href: string }[];
			'predecessor-version': { id: number; href: string }[];
			'wp:attachment': { href: string }[];
			'wp:term': { taxonomy: string; embeddable: boolean; href: string }[];
			curies: { name: string; href: string; templated: boolean }[];
		};
	};

	type WPUser = {
		id: number;
		name: string;
		url: string;
		description: string;
		link: string;
		slug: string;
		avatar_urls: {
			'24': string;
			'48': string;
			'96': string;
		};
		meta: {
			[key: string]: any;
		};
		yoast_head_json?: {
			twitter_misc?: {
				'Written by': string;
			};
		};
	};

	interface UserPreferences {
		'posting:default:visibility': ComposeVisibility;
		'posting:default:sensitive': boolean;
		'posting:default:language': string;
		'reading:expand:media': 'default' | 'show_all' | 'hide_all';
		'reading:expand:spoilers': boolean;
		'reading:autoplay:gifs': boolean;
	}

	type UserSetting = {
		app_name: string;
		account_id: string;
		settings: {
			theme: {
				type: 'light' | 'dark' | undefined;
			};
			user_timeline: number[];
		};
	};
	type StarterPack = {
		id: string;
		title: string;
		description: string;
		collected_by: Account;
		total_accounts: number;
	};

	type StarterPackDetail = {
		channel: StarterPack;
		followers: Account[];
	};

	type WPComment = {
		id: number;
		post: number;
		parent: number;
		author: number;
		author_name: string;
		author_url: string;
		date: string;
		date_gmt: string;
		content: {
			rendered: string;
		};
		link: string;
		status: string;
		type: string;
		author_avatar_urls: {
			'24': string;
			'48': string;
			'96': string;
		};
		meta: {
			[key: string]: any;
		};
		_links: {
			self: { href: string; targetHints?: { allow: string[] } }[];
			collection: { href: string }[];
			author?: { embeddable: boolean; href: string }[];
			up?: { embeddable: boolean; post_type: string; href: string }[];
		};
	};

	type WPLike = {
		found: number;
		i_like: boolean;
		can_like: boolean;
		site_ID: number;
		post_ID: number;
		likes: any[];
	};

	type WpCategory = {
		id: number;
		count: number;
		description: string;
		link: string;
		name: string;
		slug: string;
		taxonomy: string;
		parent: number;
		meta: any[];
		_links: {
			self: { href: string; targetHints?: { allow: string[] } }[];
			collection: { href: string }[];
			about: { href: string }[];
			up?: { embeddable: boolean; href: string }[];
			'wp:post_type': { href: string }[];
			curies: { name: string; href: string; templated: boolean }[];
		};
	};
}
