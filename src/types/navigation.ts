import {
	CompositeNavigationProp,
	CompositeScreenProps,
	NavigationProp,
	NavigatorScreenParams,
	RouteProp,
} from '@react-navigation/native';
import type {
	StackNavigationProp,
	StackScreenProps,
} from '@react-navigation/stack';
import type {
	BottomTabNavigationProp,
	BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { StatusCurrentPage } from '@/context/statusItemContext/statusItemContext.type';

export type RootStackParamList = {
	Profile: { id: string };
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	Index: NavigatorScreenParams<BottomStackParamList>;
	Guest: NavigatorScreenParams<GuestStackParamList>;
	SettingStack: NavigatorScreenParams<SettingStackParamList>;
	WebViewer: { url: string; customTitle?: string; hideHeader?: boolean };
	ImageViewer: {
		imageUrls: Patchwork.ImageUrl[];
		id: Patchwork.Attachment['id'];
	};
	QuotePost: { statusId: string };
	EditProfile: { fromVerification?: boolean } | undefined;
	LocalImageViewer: {
		imageUrl: {
			url: string;
			width?: number;
			height?: number;
			isLocal?: boolean;
		};
	};
	ConversationsStack: NavigatorScreenParams<ConversationsStackParamList>;
	SplashScreen: undefined;
	VideoPlayer: { status: Patchwork.Status };
	GifPlayer: { status: Patchwork.Status; gifUrl: string };
};

export type BottomStackParamList = {
	Home: NavigatorScreenParams<HomeStackParamList>;
	Notification: NavigatorScreenParams<NotiStackParamList>;
	Search: NavigatorScreenParams<SearchStackParamList>;
	Compose:
		| {
				type: 'create';
				prefilledHashtags?: Patchwork.PatchworkCommunityHashtag[];
				prefilledAudience?: Patchwork.ChannelAttributes;
		  }
		| {
				type: 'repost' | 'edit';
				incomingStatus: Patchwork.Status;
				statusCurrentPage?: StatusCurrentPage;
				extraPayload?: Record<string, any>;
		  }
		| {
				type: 'schedule';
				scheduledStatus: Patchwork.Schedule | null;
		  };
	Conversations: NavigatorScreenParams<ConversationsStackParamList>;
};

export type HomeStackParamList = {
	HomeFeed: undefined;
	SearchFeed: undefined;
	FeedDetail: {
		id: string;
		isMainChannel?: boolean;
		openKeyboardAtMount?: boolean;
	};
	StarterPackDetail: {
		slug: string;
		title: string;
		description: string;
		collected_by: string;
		gradientColors: string[];
	};
	Profile: { id: string };
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	HashTagDetail: { hashtag: string; hashtagDomain: string };
	Conversations: NavigatorScreenParams<ConversationsStackParamList>;
	Search: NavigatorScreenParams<SearchStackParamList>;
	FollowingAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	FollowerAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	WebViewer: { url: string; customTitle?: string; hideHeader?: boolean };
	SettingStack: NavigatorScreenParams<SettingStackParamList>;
	PeopleFollowing: undefined;
	ListsStack: NavigatorScreenParams<ListsStackParamList>;
	TrendingStatuses: undefined;
	NewsmastChannelTimeline: {
		accountHandle: string;
		fetchTimelineFromLoggedInServer?: boolean;
		slug: string;
		avatar_image_url: string;
		banner_image_url: string;
		channel_name: string;
	};
	NMChannelAllContributorList: { id: string };
	NMChannelAllHashtagList: { slug: string };
	HashtagsFollowing: undefined;
	NewsmastCollections: undefined;
	NewsmastCollectionDetail: { slug: string; title: string; type: string };
	ViewAllChannelScreen: { title: string; data: Patchwork.ChannelList[] };
	FavoritedBy: { id: string; uri: string };
	BoostedBy: { id: string; uri: string };
	QuotedBy: { id: string; uri: string };
	ArticleDetail: { status: Patchwork.Status };
	WpStoryDetail: { postId: number; title: string };
	AuthorDetail: { authorId: number; authorName: string };
	WpCategoryViewAll: {
		categoryId?: number;
		title: string;
		categoryType: 'list' | 'card';
	};
	ImageViewer: {
		imageUrls: Patchwork.ImageUrl[];
		id: Patchwork.Attachment['id'];
	};
	QuotePost: { statusId: string };
};

export type SearchStackParamList = {
	SearchResults: {
		activeIndex: number;
	};
	SearchFeed: undefined;
	FeedDetail: {
		id: string;
		isMainChannel?: boolean;
		openKeyboardAtMount?: boolean;
	};
	ArticleDetail: { status: Patchwork.Status };
	Profile: { id: string };
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	CollectionDetail: { slug: string; title: string; type: string };
	FollowingAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	FollowerAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	Conversations: NavigatorScreenParams<ConversationsStackParamList>;
	HashTagDetail: { hashtag: string; hashtagDomain: string };
	SearchedAccountList: { q: string };
	SuggestedPeopleList: undefined;
	NewsmastChannelTimeline: {
		accountHandle: string;
		fetchTimelineFromLoggedInServer?: boolean;
		slug: string;
		avatar_image_url: string;
		banner_image_url: string;
		channel_name: string;
	};
	NMChannelAllContributorList: { id: string };
	NMChannelAllHashtagList: { slug: string };
	NewsmastCollections: undefined;
	NewsmastCollectionDetail: { slug: string; title: string; type: string };
	FavoritedBy: { id: string; uri: string };
	BoostedBy: { id: string; uri: string };
	QuotedBy: { id: string; uri: string };
	QuotePost: { statusId: string };
};

// ********** Notification Stack ********** //

export type NotiStackParamList = {
	NotificationList: {
		tabIndex: number;
	};
	FeedDetail: {
		id: string;
		isMainChannel?: boolean;
		openKeyboardAtMount?: boolean;
	};
	ArticleDetail: { status: Patchwork.Status };
	Profile: { id: string };
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	FollowingAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		userAccHandle: string;
	};
	FollowerAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	Conversations: NavigatorScreenParams<ConversationsStackParamList>;
	HashTagDetail: { hashtag: string; hashtagDomain: string };
	FavoritedBy: { id: string; uri: string };
	BoostedBy: { id: string; uri: string };
	QuotedBy: { id: string; uri: string };
	QuotePost: { statusId: string };
};

export type NotificationScreenNavigationProp = NavigationProp<
	NotiStackParamList,
	'NotificationList'
>;
export type NotificationScreenRouteProp = RouteProp<
	NotiStackParamList,
	'NotificationList'
>;
// ********** Notification Stack ********** //

export type ConversationsStackParamList = {
	ConversationList: undefined;
	NewMessage: undefined;
	ConversationDetail: {
		id: string;
		isFromExternalNotiAlert?: boolean;
		isFromProfile?: boolean;
	};
	InitiateNewConversation: {
		account: Patchwork.Account;
		allowAddMoreParticipant?: boolean;
	};
	NotificationRequests: undefined;
	Profile: { id: string };
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	FeedDetail: {
		id: string;
		isMainChannel?: boolean;
		openKeyboardAtMount?: boolean;
	};
	ArticleDetail: { status: Patchwork.Status };
	FollowingAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	FollowerAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	FavoritedBy: { id: string; uri: string };
	BoostedBy: { id: string; uri: string };
	QuotedBy: { id: string; uri: string };
	QuotePost: { statusId: string };
};

export type GuestStackParamList = {
	Login: undefined;
	Register: undefined;
	Welcome: undefined;
	ForgotPassword: undefined;
	ServerInstance: undefined;
	ForgotPasswordOTP: { email: string; reset_password_token: string };
	ChangePassword: { reset_password_token: string; access_token: string };
	MastodonSignInWebView: {
		url: string;
		domain: string;
		client_id: string;
		client_secret: string;
	};
	WebViewer: { url: string; customTitle?: string; hideHeader?: boolean };
	SignUp: undefined;
	SignUpOTP: { email: string; signup_token: string };
	AddUserNameScreen: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
	};
};

export type SettingStackParamList = {
	Settings: undefined;
	AccountSettings: undefined;
	NotificationSettings: undefined;
	FeedSettings: undefined;
	PrivacySettings: undefined;
	PersonalizationSettings: undefined;
	AccountManagement: undefined;
	UpdatePassword: undefined;
	MuteAndBlockList: undefined;
	MyInformation: undefined;
	WebViewer: { url: string; customTitle?: string; hideHeader?: boolean };
	BookmarkList: undefined;
	ProfileOther: {
		id: string;
		isFromNoti?: boolean;
		isOwnChannelFeed?: boolean;
		shouldResolveRemote?: boolean;
		acct?: string;
	};
	FeedDetail: {
		id: string;
		isMainChannel?: boolean;
		openKeyboardAtMount?: boolean;
	};
	ArticleDetail: { status: Patchwork.Status };
	ListsStack: NavigatorScreenParams<ListsStackParamList>;
	HashTagDetail: { hashtag: string; hashtagDomain: string };
	ChangeEmail: { oldEmail: string };
	ChangeEmailVerification: {
		newAccessToken?: string;
		oldEmail?: string;
		currentPassword?: string;
		newEmail?: string;
	};
	DeleteAccount: undefined;
	Welcome: undefined;
	AllContributorList: undefined;
	AllMutedContributorList: undefined;
	NewsmastChannelTimeline: {
		accountHandle: string;
		fetchTimelineFromLoggedInServer?: boolean;
		slug: string;
		avatar_image_url: string;
		banner_image_url: string;
		channel_name: string;
	};
	NMChannelAllContributorList: { id: string };
	NMChannelAllHashtagList: { slug: string };
	FavoritedBy: { id: string; uri: string };
	BoostedBy: { id: string; uri: string };
	QuotedBy: { id: string; uri: string };
	QuotePost: { statusId: string };
	Appearance: undefined;
	Language: undefined;
	FollowingAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	FollowerAccounts: {
		accountId: string;
		isMainChannel?: boolean;
		isUserFromSameServer?: boolean;
		userAccHandle: string;
	};
	ScheduledPostList: undefined;
	Compose:
		| { type: 'create' }
		| {
				type: 'repost' | 'edit';
				incomingStatus: Patchwork.Status;
				statusCurrentPage?: StatusCurrentPage;
				extraPayload?: Record<string, any>;
		  }
		| {
				type: 'schedule';
				scheduledStatus: Patchwork.Schedule | null;
		  }
		| {
				type: 'quote';
				statusId: string;
		  };
	Timeline: undefined;
	LoginAnotherAccount: undefined;
	Verification: undefined;
};

export type ListsStackParamList = {
	Lists: undefined;
	ListTimelines: { id: string; title: string };
	UpsertList:
		| {
				type: 'create';
		  }
		| {
				type: 'edit';
				id: string;
		  };
	ManageListMembers: {
		listId: string;
		listTimelinesTitle: string;
		isEditMember?: boolean;
	};
};

export type ListsStackScreenProps<S extends keyof ListsStackParamList> =
	StackScreenProps<ListsStackParamList, S>;

export type ListTimelinesScreenNavigationProp = NavigationProp<
	ListsStackParamList,
	'ListTimelines'
>;
export type ListTimelinesScreenRouteProp = RouteProp<
	ListsStackParamList,
	'ListTimelines'
>;

export type CommonCompositeNavigationProp = CompositeNavigationProp<
	StackNavigationProp<HomeStackParamList>,
	StackNavigationProp<BottomStackParamList>
>;

export type RootScreenProps<
	S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;

export type HomeStackScreenProps<S extends keyof HomeStackParamList> =
	StackScreenProps<HomeStackParamList, S>;

export type SearchStackScreenProps<S extends keyof SearchStackParamList> =
	StackScreenProps<SearchStackParamList, S>;

export type ConversationsStackScreenProps<
	S extends keyof ConversationsStackParamList,
> = StackScreenProps<ConversationsStackParamList, S>;

export type GuestStackScreenProps<S extends keyof GuestStackParamList> =
	StackScreenProps<GuestStackParamList, S>;

export type SettingStackScreenProps<S extends keyof SettingStackParamList> =
	StackScreenProps<SettingStackParamList, S>;

export type TabBarScreenProps<
	S extends keyof BottomStackParamList = keyof BottomStackParamList,
> = CompositeScreenProps<
	BottomTabScreenProps<BottomStackParamList, S>,
	RootScreenProps<keyof RootStackParamList>
>;

export type TabBarScreenNavigationProp<
	S extends keyof BottomStackParamList = keyof BottomStackParamList,
> = CompositeNavigationProp<
	BottomTabNavigationProp<BottomStackParamList, S>,
	StackNavigationProp<RootStackParamList>
>;

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
