import { faCommentAlt } from '@fortawesome/free-regular-svg-icons';
import {
	faGlobe,
	faPenNib,
	faSearch,
	faUserCog,
} from '@fortawesome/free-solid-svg-icons';

export const slides = [
	{
		id: 1,
		icon: faGlobe,
		title: 'Exploring the Feed',
		description:
			'Your home feed brings you the latest local news, community updates, and discussions.',
		bullets: [
			'Find Out tab: Discover curated local news and trending community topics',
			'Main feed: See the latest timeline updates from people you follow',
			'Channels tabs: Dive into specific focused topics and community interests',
		],
		tip: 'Tap on a news item to read the full context and see what others are saying.',
	},
	{
		id: 2,
		icon: faCommentAlt,
		title: 'Community Engagement',
		description:
			'FindOut is built on open social protocols (Fediverse) that let you connect deeply with your neighbors and local creators.',
		bullets: [
			'Like and reply to participate in public discussions',
			'Start private conversations to connect one-on-one with neighbors',
			'Boost posts to amplify important local voices',
			'Follow local journalists and active community members',
		],
		tip: 'A supportive community starts with you. Keep conversations respectful and engaging.',
	},
	{
		id: 3,
		icon: faPenNib,
		title: 'Share Your Voice',
		description:
			'Got news or an interesting local update? Post it to keep your neighbors informed.',
		bullets: [
			'Write updates to your followers and the local timeline',
			'Attach photos and media to share ground-level events',
			'Use content warnings for sensitive topics to respect others',
		],
		tip: 'Add relevant hashtags to make your posts easier to discover locally.',
	},
	{
		id: 4,
		icon: faSearch,
		title: 'Search & Discovery',
		description:
			'Finding relevant information and finding your people has never been easier.',
		bullets: [
			'Search for trending local hashtags (e.g., #LocalEvents)',
			'Find and follow accounts of organizations matching your interests',
			'Explore curated lists of community content',
		],
		tip: 'The search tab is your gateway to topics outside your immediate following.',
	},
	{
		id: 5,
		icon: faUserCog,
		title: 'Customizing Your Experience',
		description:
			'FindOut puts you in control of your timeline, your data, and your visual preferences.',
		bullets: [
			'Adjust your notification preferences in settings',
			'Manage privacy levels for your profile and individual posts',
			'Switch between light and dark themes in the appearance menu',
		],
		tip: 'You can mute or block accounts anytime to curate a safe personal space.',
	},
];
