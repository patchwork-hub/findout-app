import { useMemo, useRef } from 'react';
import { ElementType } from 'htmlparser2';
import type { ChildNode } from 'domhandler';
import { Platform } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import ParseEmojis from '@/components/atoms/common/ParseEmojis/ParnseEmojis';
import { unwrapNode, shouldRenderHashtag } from '@/util/helper/htmlParserUtils';
import { checkIfNodesAreOnlyTags } from '@/util/helper/hashtags';

type UseHtmlRendererProps = {
	status: Patchwork.Status;
	documentChildren: ChildNode[];
	isMainStatus?: boolean;
	continuedTagNames?: string[];
	onLinkPress: (url: string) => void;
	onHashtagPress: (tag: string) => void;
	onMentionPress: (mention: Patchwork.Mention) => void;
};

export const useHtmlRenderer = ({
	status,
	documentChildren,
	isMainStatus = false,
	continuedTagNames = [],
	onLinkPress,
	onHashtagPress,
	onMentionPress,
}: UseHtmlRendererProps) => {
	const isFirstLink = useRef(true);
	const adaptedLineheight = Platform.OS === 'ios' ? 18 : undefined;

	const isImageMissing = status?.media_attachments?.length !== 0;

	const isEntireDocTags = useMemo(() => {
		return checkIfNodesAreOnlyTags(documentChildren);
	}, [documentChildren]);

	// Cache the list of paragraph nodes to find them instantly
	const cachedParagraphNodes = useMemo(
		() =>
			documentChildren?.filter(
				child => child.type === ElementType.Tag && child.name === 'p',
			) || [],
		[documentChildren],
	);

	// Helper function to check if a node or its children contain any visible content
	// This respects the 'continuedTagNames' logic (hiding hashtags moved to the bottom)
	const shouldNodeRender = (node: ChildNode): boolean => {
		switch (node.type) {
			case ElementType.Text:
				return !!node.data.trim();
			case ElementType.Tag:
				if (node.name === 'br') return true;
				if (node.name === 'a') {
					if (node.attribs?.class?.includes('hashtag')) {
						const href = node.attribs.href;
						const rawHashtagFromHref = href?.match(/\/tags\/([^/?#]+)/)?.[1];
						const normalizedHashtag = rawHashtagFromHref?.toLowerCase();
						const tagsToHide =
							continuedTagNames?.map(t => t.toLowerCase()) || [];

						const isLastParagraph =
							node.parent ===
							cachedParagraphNodes[cachedParagraphNodes.length - 1];

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

						if (
							(normalizedHashtag && tagsToHide.includes(normalizedHashtag)) ||
							(isLastParagraph && isOnlyHashtagParagraph && !isEntireDocTags)
						) {
							return false;
						}
					}
					return true;
				}
				if (node.name === 'p') {
					if (status?.quote && node.attribs?.class?.includes('quote-inline')) {
						return false;
					}
					return node.children.some(child => shouldNodeRender(child));
				}
				return node.children.some(child => shouldNodeRender(child));
			default:
				return false;
		}
	};

	// Determine the index of the last node that will actually be rendered.
	// We use this to avoid adding extra bottom margin after the last visible text.
	const lastContentNodeIndex = useMemo(() => {
		for (let i = documentChildren.length - 1; i >= 0; i--) {
			if (shouldNodeRender(documentChildren[i])) {
				return i;
			}
		}
		return -1;
	}, [documentChildren, cachedParagraphNodes, status, continuedTagNames]);

	const renderNode = (node: ChildNode, index: number): React.ReactNode => {
		let classes: string | undefined;
		let href: string;

		switch (node?.type) {
			case ElementType.Text: {
				let content: string = node.data;

				if (node.data.trim().length) {
					content = node?.data.replace(/^\s+/, '');
				} else {
					content = node.data.trim();
				}

				return (
					<ParseEmojis emojis={status?.emojis} content={content} key={index} />
				);
			}

			case ElementType.Tag:
				switch (node.name) {
					case 'a':
						classes = node.attribs?.class;
						href = node.attribs?.href;

						if (classes) {
							if (classes.includes('hashtag')) {
								const children = node.children.map(unwrapNode).join('');
								const rawHashtagFromHref =
									href?.match(/\/tags\/([^/?#]+)/)?.[1];
								const tagNameRaw = rawHashtagFromHref?.toLowerCase();

								const shouldRender = shouldRenderHashtag(
									tagNameRaw,
									node,
									documentChildren,
									continuedTagNames,
									cachedParagraphNodes,
									isEntireDocTags,
								);

								if (!shouldRender) {
									return null;
								}

								return (
									<ThemeText
										emojis={status.emojis}
										key={index}
										size={'fs_13'}
										className={`text-patchwork-flourish dark:text-patchwork-secondary`}
										children={`${children} `}
										onPress={() => onHashtagPress(children)}
									/>
								);
							}

							if (classes.includes('mention') && status?.mentions?.length) {
								const mentionedText = node.children.map(unwrapNode).join('');
								const normalizedMentionedText = mentionedText
									.trim()
									.toLowerCase();

								const matchedMention = (status?.mentions || []).find(
									(mention: Patchwork.Mention) => {
										return (
											`@${mention.acct}`.toLowerCase() ===
												normalizedMentionedText ||
											`@${mention.username}`.toLowerCase() ===
												normalizedMentionedText
										);
									},
								);

								return (
									<ThemeText
										key={index}
										size={isMainStatus ? 'default' : 'fs_13'}
										children={`${mentionedText} `}
										className="text-patchwork-primary dark:text-patchwork-soft-primary"
										onPress={() => {
											if (matchedMention) onMentionPress(matchedMention);
										}}
									/>
								);
							}
						}

						if (isImageMissing) {
							const contentNode = node.children
								.map(child => unwrapNode(child))
								.join('');

							return (
								<ThemeText
									key={index}
									className="text-patchwork-secondary"
									size="fs_13"
									children={`${contentNode} `}
									onPress={() => onLinkPress(href)}
								/>
							);
						}

						const nodeContent = node.children
							.map(child => unwrapNode(child))
							.join('');

						if (
							isFirstLink.current &&
							status?.is_meta_preview &&
							status?.card
						) {
							isFirstLink.current = false;
							return null;
						}

						return (
							<ThemeText
								key={index}
								size="fs_13"
								children={`${nodeContent} `}
								className="text-patchwork-secondary"
								onPress={() => onLinkPress(href)}
							/>
						);

					case 'br':
						return (
							<ThemeText
								key={index}
								style={{
									lineHeight: adaptedLineheight
										? adaptedLineheight / 2
										: undefined,
								}}
							>
								{'\n'}
							</ThemeText>
						);

					case 'p':
						const renderedChildren = node.children.map((c, i) =>
							renderNode(c, i),
						);

						if (
							status?.quote &&
							node.attribs?.class?.includes('quote-inline')
						) {
							return null;
						}

						// Check if paragraph is effectively empty
						if (
							renderedChildren.every(
								child =>
									child == null || (typeof child === 'string' && child === ''),
							)
						) {
							return null;
						}

						return (
							<ThemeText key={index}>
								{renderedChildren}
								{index < documentChildren.length - 1 && (
									<ThemeText
										style={{
											lineHeight: adaptedLineheight
												? adaptedLineheight / 2
												: undefined,
										}}
									>
										{'\n'}
										{'\n'}
									</ThemeText>
								)}
							</ThemeText>
						);

					default:
						return (
							<ThemeText
								key={index}
								children={node.children.map((c, i) => renderNode(c, i))}
							/>
						);
				}
		}
		return null;
	};

	return {
		renderNode,
		adaptedLineheight,
	};
};
