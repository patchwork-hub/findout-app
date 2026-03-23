import { ElementType } from 'htmlparser2';
import type { ChildNode } from 'domhandler';

/**
 * Utility function to unwrap content from child nodes.
 * Used for extracting text content from HTML nodes like `span`.
 */
export const unwrapNode = (node: ChildNode): string => {
	switch (node.type) {
		case ElementType.Text:
			return node.data;
		case ElementType.Tag: // ElementType.Tag is equivalent to "tag"
			if (node.name === 'span') {
				// Handle Mastodon invisible spans and ellipses
				if (node.attribs && node.attribs.class?.includes('invisible'))
					return '';
				if (node.attribs && node.attribs.class?.includes('ellipsis'))
					return `${node.children.map(child => unwrapNode(child)).join('')}...`;
			}
			return node.children.map(child => unwrapNode(child)).join('');
		default:
			return '';
	}
};

/**
 * Determines whether a hashtag link should be rendered inside the post body.
 *
 * Logic:
 * 1. If it's part of `continuedTagNames` (tags that might be displayed elsewhere, e.g., thread continuation), skip rendering.
 * 2. If it's the last paragraph and contains only hashtags, skip rendering (often used for tagging posts without integrating them into sentences).
 *
 * @param tagNameRaw - The raw tag name extracted from href (e.g., from `/tags/Friday`).
 * @param node - The current HTML node being processed.
 * @param documentChildren - The top-level children of the parsed HTML document.
 * @param continuedTagNames - A list of tag names to exclude.
 */
export const shouldRenderHashtag = (
	tagNameRaw: string | undefined,
	node: ChildNode,
	documentChildren: ChildNode[],
	continuedTagNames: string[] = [],
	cachedParagraphNodes: ChildNode[] = [],
	isEntireDocTags: boolean = false,
): boolean => {
	// Check if this is the last paragraph
	const isLastParagraph =
		node.parent === cachedParagraphNodes[cachedParagraphNodes.length - 1];

	// Check if the paragraph contains only hashtags (and whitespace)
	// We need to cast parent to any or Element because ChildNode.parent is generalized as ParentNode in domhandler types
	const isOnlyHashtagParagraph =
		node.parent &&
		'name' in node.parent &&
		node.parent.name === 'p' &&
		node.parent.children.every(
			n =>
				(n.type === ElementType.Tag &&
					n.name === 'a' &&
					n.attribs?.class?.includes('hashtag')) ||
				(n.type === ElementType.Text && !n.data.trim()),
		);

	const tagsToHide = continuedTagNames?.map(t => t.toLowerCase()) || [];

	if (
		(tagNameRaw && tagsToHide.includes(tagNameRaw)) ||
		(isLastParagraph && isOnlyHashtagParagraph && !isEntireDocTags)
	) {
		return false;
	}

	return true;
};
