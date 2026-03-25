export type ParsedExcerpt = {
	description: string;
	location: string;
	websiteUrl: string;
};

export const formatDate = (raw?: string): string => {
	if (!raw) return '';
	const d = new Date(raw);
	if (isNaN(d.getTime())) return raw;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

export const getDateRange = (
	date: string,
	acf?: Record<string, any>,
	meta?: Record<string, any>,
): string => {
	const start =
		acf?.start_date ||
		acf?.event_start ||
		acf?.event_start_date ||
		meta?._EventStartDate ||
		date;
	const end =
		acf?.end_date ||
		acf?.event_end ||
		acf?.event_end_date ||
		meta?._EventEndDate;

	const startStr = formatDate(start);
	const endStr = formatDate(end);

	if (!endStr || startStr === endStr) return startStr;
	return `${startStr} – ${endStr}`;
};

// Matches common CTA link text regardless of exact wording
const CTA_ANCHOR_RE =
	/(?:learn\s*more|register(?:\s*(?:now|here))?|visit(?:\s*(?:website|site|page))?|more\s*info(?:rmation)?|find\s*out)[^<]*<a[^>]+href=["']([^"']+)["']/i;

// Matches "Label: https://..." plain-text patterns
const CTA_TEXT_RE =
	/\s*(?:learn\s*more|register|website|visit|more\s*info(?:rmation)?):\s*([^\s<]+)/i;

export const parseExcerpt = (html: string): ParsedExcerpt => {
	// Extract href from a CTA anchor tag
	const anchorMatch = html.match(CTA_ANCHOR_RE);
	const hrefUrl = anchorMatch?.[1] ?? '';

	// Strip HTML tags and decode entities
	const text = html
		.replace(/<\/p>/gi, '\n')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#8211;/g, '–')
		.replace(/&#8212;/g, '—')
		.replace(/&#8216;/g, '\u2018')
		.replace(/&#8217;/g, '\u2019')
		.replace(/&#8218;/g, '\u201A')
		.replace(/&#8220;/g, '\u201C')
		.replace(/&#8221;/g, '\u201D')
		.replace(/&#8230;/g, '\u2026')
		.replace(/&hellip;/g, '\u2026')
		.replace(/&ndash;/g, '–')
		.replace(/&mdash;/g, '—')
		.replace(/&lsquo;/g, '\u2018')
		.replace(/&rsquo;/g, '\u2019')
		.replace(/&ldquo;/g, '\u201C')
		.replace(/&rdquo;/g, '\u201D')
		.replace(/&#\d+;/g, match => {
			const code = parseInt(match.replace(/&#|;/g, ''), 10);
			return String.fromCharCode(code);
		})
		// Remove WordPress "[…]" / "[...]" read-more markers
		.replace(/\[[\u2026.]+\]/g, '')
		.trim();

	let description = text;
	let location = '';
	let websiteUrl = hrefUrl;

	// Extract "Location: ..." — may appear anywhere in text
	const locationMatch = description.match(
		/\s*Location:\s*(.+?)(?=\s*(?:Learn More|Register|Website|Visit|More Info):|$)/i,
	);
	if (locationMatch) {
		location = locationMatch[1].trim();
		description = description.replace(locationMatch[0], '');
	}

	// Extract "Label: <url>" plain-text pattern
	const ctaMatch = description.match(CTA_TEXT_RE);
	if (ctaMatch) {
		if (!websiteUrl) {
			websiteUrl = ctaMatch[1].trim();
		}
		description = description.replace(ctaMatch[0], '');
	}

	// Clean up leftover whitespace / newlines
	description = description
		.split('\n')
		.map(l => l.trim())
		.filter(Boolean)
		.join('\n\n');

	return { description, location, websiteUrl };
};

/**
 * Extracts the external website URL for an event post.
 * Tries the excerpt first; falls back to the full content HTML
 * (needed when the excerpt is WordPress-truncated and the URL only
 * appears in the full post content).
 */
export const getEventWebsiteUrl = (
	excerpt: string,
	content?: string,
): string => {
	const { websiteUrl } = parseExcerpt(excerpt);
	if (websiteUrl) return websiteUrl;

	if (!content) return '';

	// CTA anchor in content HTML
	const anchorMatch = content.match(CTA_ANCHOR_RE);
	if (anchorMatch?.[1]) return anchorMatch[1];

	// Plain-text "Label: https://..." in content
	const textMatch = content.match(CTA_TEXT_RE);
	return textMatch?.[1] ?? '';
};

const normalizeUrl = (url: string): string => {
	if (!url) return '';
	return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

export const isZoomLink = (url: string): boolean => {
	try {
		const hostname = new URL(normalizeUrl(url)).hostname.toLowerCase();
		return (
			hostname === 'zoom.us' ||
			hostname.endsWith('.zoom.us') ||
			hostname === 'zoomgov.com' ||
			hostname.endsWith('.zoomgov.com')
		);
	} catch {
		return false;
	}
};

export const getEventLocationLabel = (
	location: string,
	websiteUrl: string,
): string => {
	if (location?.trim()) return location.trim();
	return isZoomLink(websiteUrl) ? 'Online (Zoom)' : '';
};

export const getFaviconUrl = (url: string): string | undefined => {
	try {
		const hostname = new URL(url.replace(/#.*$/, '')).hostname;
		return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
	} catch {
		return undefined;
	}
};
