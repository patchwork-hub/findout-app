import {
	DEFAULT_INSTANCE,
	DEFAULT_WP_INSTANCE,
} from './../../util/constant/index';
import { ensureHttp } from '@/util/helper/helper';
import { create } from 'zustand';

export type AuthSource = {
	token: string | undefined;
	domain: string;
};

export type AuthState = {
	wordpress: AuthSource;
	mastodon: AuthSource;
	userInfo: Patchwork.Account | undefined;
	userTheme: 'light' | 'dark' | undefined;
	userOriginInstance: string;
	selectedTimeline: number;
	isHydrating: boolean;
	homeLayout: number;
	actions: {
		setAuthState: (payload: {
			wordpress?: Partial<AuthSource>;
			mastodon?: Partial<AuthSource>;
		}) => void;
		clearAuthState: () => void;
		setUserInfo: (user: Patchwork.Account) => void;
		setUserTheme: (theme: 'light' | 'dark' | undefined) => void;
		setHomeLayout: (layout: number) => void;
		setUserOriginInstance: (userOrigin: string) => void;
		setSelectedTimeline: (timeline: number) => void;
		setIsHydrating: (status: boolean) => void;
	};
};

const WORDPRESS_DOMAIN = process.env.WORDPRESS_API_URL || DEFAULT_WP_INSTANCE;
const MASTODON_DOMAIN = process.env.API_URL || DEFAULT_INSTANCE;

const OriginInstance = `${process.env.API_URL || DEFAULT_INSTANCE}`;

export const useAuthStore = create<AuthState>()(set => ({
	wordpress: { token: undefined, domain: WORDPRESS_DOMAIN },
	mastodon: { token: undefined, domain: MASTODON_DOMAIN },
	access_token: undefined,
	userInfo: undefined,
	userOriginInstance: OriginInstance,
	userTheme: undefined,
	homeLayout: 1,
	selectedTimeline: 2, // default is 2 which is community
	isHydrating: false,
	actions: {
		setAuthState: payload =>
			set(state => ({
				...state,
				wordpress: { ...state.wordpress, ...payload.wordpress },
				mastodon: { ...state.mastodon, ...payload.mastodon },
			})),
		clearAuthState: () =>
			set(state => ({
				...state,
				wordpress: { ...state.wordpress, token: undefined },
				mastodon: { ...state.mastodon, token: undefined },
				userInfo: undefined,
			})),
		setUserInfo: (user: Patchwork.Account) =>
			set(state => ({ ...state, userInfo: user })),
		setUserTheme: (theme: 'light' | 'dark' | undefined) =>
			set(state => ({ ...state, userTheme: theme })),
		setUserOriginInstance: (domain: string) =>
			set(state => ({ ...state, userOriginInstance: ensureHttp(domain) })),
		setSelectedTimeline: (timeline: number) =>
			set(state => ({ ...state, selectedTimeline: timeline })),
		setIsHydrating: (status: boolean) => set({ isHydrating: status }),
		setHomeLayout: (layout: number) =>
			set(state => ({ ...state, homeLayout: layout })),
	},
}));

export const useAuthStoreAction = () => useAuthStore(state => state.actions);
