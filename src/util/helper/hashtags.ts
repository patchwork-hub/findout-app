import { parseDocument, ElementType } from 'htmlparser2';
import { Node, Element, Text } from 'domhandler';

// Helper to check if a list of nodes contains only hashtags, whitespace, or break lines.
export const checkIfNodesAreOnlyTags = (nodes: Node[]): boolean => {
	const isOnlyTagsNode = (node: Node): boolean => {
		if (node.type === 'text') return !(node as Text).data.trim();
		if (node.type === 'comment') return true;
		if (node.type === 'tag') {
			const el = node as Element;
			if (el.name === 'br') return true;
			if (el.name === 'a' && el.attribs?.class?.includes('hashtag'))
				return true;
			if (['p', 'div', 'span'].includes(el.name)) {
				return checkIfNodesAreOnlyTags(el.children);
			}
		}
		return false;
	};
	return nodes.every(isOnlyTagsNode);
};

// This helper func is used to extract hashtags which stand allone at the end of the line from the HTML content
// These hashtags are hidden in the main content and shown in StatusTags
export const getContinuedHashtags = (html: string): string[] => {
	const doc = parseDocument(html);

	if (checkIfNodesAreOnlyTags(doc.children)) {
		return [];
	}

	const continuedHashtags = new Set<string>();
	const allSeenHashtagsInOrder = new Set<string>(); // All hashtags found, in order
	const alreadySeenOutsideContinuedBlock = new Set<string>(); // Hashtags already used in content

	/*
	  Checks if a hashtag node qualifies as a continued hashtag.
	  - It must be inside a <p> tag.
	  - The <p> tag must be the last paragraph in the HTML.
	  - That <p> must only contain hashtags and/or whitespace.
	 */
	const isContinuedHashtag = (node: Element) => {
		const parent = node.parent;
		if (!parent || (parent as Element).name !== 'p') return false;

		const isLastParagraph =
			doc.children
				.filter(n => n.type === 'tag' && (n as Element).name === 'p')
				.at(-1) === parent;

		if (!isLastParagraph) return false;

		const isOnlyHashtagsAndSpaces = parent.children.every(
			child =>
				(child.type === 'tag' &&
					child.name === 'a' &&
					child.attribs?.class?.includes('hashtag')) ||
				(child.type === 'text' && !child.data.trim()),
		);

		return isLastParagraph && isOnlyHashtagsAndSpaces;
	};

	// Recursive func to find continued hashtags inside DOM
	const traverse = (node: Node, depth = 0) => {
		// check for safety to avoid deeply nested tags
		if (depth > 100) return;

		if (
			node.type === 'tag' &&
			(node as Element).name === 'a' &&
			(node as Element).attribs?.class?.includes('hashtag')
		) {
			const href = (node as Element).attribs.href;
			const match = href?.match(/\/tags\/([^"]+)/i);
			if (match) {
				const rawTag = decodeURIComponent(match[1]);
				allSeenHashtagsInOrder.add(rawTag);

				if (!isContinuedHashtag(node as Element)) {
					alreadySeenOutsideContinuedBlock.add(rawTag);
				}
			}

			// if found a continued hashtag, add it to the continuedHashtags
			if (isContinuedHashtag(node as Element)) {
				const href = (node as Element).attribs.href;
				const match = href?.match(/\/tags\/([^"]+)/i);
				if (match) {
					const rawTag = decodeURIComponent(match[1]);
					if (!alreadySeenOutsideContinuedBlock.has(rawTag)) {
						continuedHashtags.add(rawTag);
					}
				}
			}
		}

		// Recursive func to find continued hashtags inside its children
		if ('children' in node && Array.isArray(node.children)) {
			node.children.forEach(child => traverse(child, depth + 1));
		}
	};
	doc.children.forEach(traverse);

	return Array.from(continuedHashtags);
};
