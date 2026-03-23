import React from 'react';
import {
	TwitterIcon,
	FacebookIcon,
	InstagramIcon,
	LinkedinIcon,
	RedditIcon,
	YoutubeIcon,
	TiktokIcon,
	TwitchIcon,
	PatreonIcon,
	GlobeIcon,
} from '@/util/svg/icon.profile';

type ColorScheme = 'dark' | 'light';

export const SOCIAL_MEDIA_LINKS = [
	{
		icon: (_colorScheme?: ColorScheme) => <TwitterIcon />,
		title: 'X',
		pattern: /twitter|x\.com/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <FacebookIcon />,
		title: 'Facebook',
		pattern: /facebook/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <InstagramIcon />,
		title: 'Instagram',
		pattern: /instagram/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <LinkedinIcon />,
		title: 'Linkedin',
		pattern: /linkedin/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <RedditIcon />,
		title: 'Reddit',
		pattern: /reddit/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <YoutubeIcon />,
		title: 'Youtube',
		pattern: /youtube|youtu\.be/i,
	},
	{
		icon: (colorScheme?: ColorScheme) => (
			<TiktokIcon colorScheme={colorScheme} />
		),
		title: 'TikTok',
		pattern: /tiktok/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <TwitchIcon />,
		title: 'Twitch',
		pattern: /twitch/i,
	},
	{
		icon: (_colorScheme?: ColorScheme) => <PatreonIcon />,
		title: 'Patreon',
		pattern: /patreon/i,
	},
	{
		icon: (colorScheme?: ColorScheme) => (
			<GlobeIcon colorScheme={colorScheme} />
		),
		title: 'Website',
		pattern: /.*/,
	},
];

export const Icons: Record<
	string,
	(colorScheme?: ColorScheme) => React.ReactElement
> = {
	Website: (colorScheme?: ColorScheme) => (
		<GlobeIcon colorScheme={colorScheme} />
	),
	Facebook: (_colorScheme?: ColorScheme) => <FacebookIcon />,
	Instagram: (_colorScheme?: ColorScheme) => <InstagramIcon />,
	Linkedin: (_colorScheme?: ColorScheme) => <LinkedinIcon />,
	Reddit: (_colorScheme?: ColorScheme) => <RedditIcon />,
	Youtube: (_colorScheme?: ColorScheme) => <YoutubeIcon />,
	Tiktok: (colorScheme?: ColorScheme) => (
		<TiktokIcon colorScheme={colorScheme} />
	),
	Twitch: (_colorScheme?: ColorScheme) => <TwitchIcon />,
	Patreon: (_colorScheme?: ColorScheme) => <PatreonIcon />,
};

export const DefaultBioTextForChannel =
	'This Channel is curated by a human and distributed automatically. See https://site.qlub.social/qlub/. Questions about content? DM me! Report Community Guideline violations to the Channel.org server.';
