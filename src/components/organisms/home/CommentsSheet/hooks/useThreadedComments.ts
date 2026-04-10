import { useMemo } from 'react';
import { ProcessedComment } from '../CommentItem';

/**
 * used to resolve WP comments into mastodon thread comments by nesting replies under their parents
 */
export const useThreadedComments = (comments: Patchwork.Status[]) => {
	return useMemo(() => {
		if (!comments || !comments.length) return [];

		const sortedComments = [...comments].sort((a, b) => {
			const timeA = new Date(
				a.created_at.endsWith('Z') ? a.created_at : `${a.created_at}Z`,
			).getTime();
			const timeB = new Date(
				b.created_at.endsWith('Z') ? b.created_at : `${b.created_at}Z`,
			).getTime();
			return timeA - timeB;
		});

		const commentMap = new Map<string, any>();
		const rootComments: any[] = [];

		sortedComments.forEach(c => {
			commentMap.set(c.id, { ...c, children: [], depth: 0 });
		});

		sortedComments.forEach(c => {
			const node = commentMap.get(c.id);
			const parentId = c.in_reply_to_id;

			if (parentId && commentMap.has(parentId)) {
				commentMap.get(parentId).children.push(node);
			} else {
				rootComments.push(node);
			}
		});

		const flatResult: ProcessedComment[] = [];
		const traverse = (nodes: any[], currentDepth: number) => {
			nodes.forEach(node => {
				const depth = currentDepth;
				const { children, ...rest } = node;
				flatResult.push({ ...rest, depth } as ProcessedComment);
				if (children.length > 0) {
					traverse(children, currentDepth + 1);
				}
			});
		};

		traverse(rootComments, 0);
		return flatResult;
	}, [comments]);
};
