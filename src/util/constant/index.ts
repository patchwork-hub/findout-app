export const HTTP_ERROR_MESSAGE = {
	OTP_NOT_VERIFIED: 'OTP not verified',
	ACCOUNT_DEACTIVATED: 'account deactivated',
	INVALID_GRANT: 'invalid_grant',
};

export const FALLBACK_PREVIEW_IMAGE_URL =
	'https://newsmast-assets.s3.eu-west-2.amazonaws.com/fom-fallback.png';

export const NEWSMAST_FALLBACK_PREVIEW_IMAGE_URL =
	'https://newsmast-assets.s3.eu-west-2.amazonaws.com/default_fallback_newsmast_resized.png';

export const CHANNELS_FALLBACK_PREVIEW_IMAGE_URL =
	'https://patchwork-staging-bucket.s3.eu-west-2.amazonaws.com/default_fallback_resized.png';

export const DEFAULT_API_URL = 'https://findout.media';
export const DEFAULT_DASHBOARD_API_URL = 'https://dashboard.channel.org';
export const DEFAULT_BRISTOL_DASHBOARD_API_URL =
	'https://dashboard.thebristolcable.social';
export const DEFAULT_BRISTOL_DASHBOARD_URL =
	'https://dashboard.thebristolcable.social';
export const PATCHWORK_CHANNEL_API_URL = 'https://patchwork.channel.org';

// export const DEFAULT_API_URL = 'https://staging.patchwork.online';
// export const DEFAULT_DASHBOARD_API_URL =
// 	'https://staging-dashboard.patchwork.online';

export const DEFAULT_INSTANCE = process.env.API_URL ?? DEFAULT_API_URL;
export const DEFAULT_WP_INSTANCE =
	process.env.WORDPRESS_API_URL ?? 'https://thebristolcable.org';

export const NEWSMAST_INSTANCE_V1 = 'https://newsmast.social';
export const MASTODON_INSTANCE = 'https://mastodon.social';
export const CHANNEL_INSTANCE = 'https://channel.org';
export const MO_ME_INSTANCE = 'https://mo-me.social';
