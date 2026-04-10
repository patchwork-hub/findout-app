import { useMemo } from 'react';
import { ProcessedComment } from '../CommentItem';

/**
 * used to resolve WP comments into mastodon thread comments by nesting replies under their parents
 */
export const useThreadedComments = (comments: Patchwork.WPComment[]) => {
	return useMemo(() => {
		if (!comments || !comments.length) return [];

		const sortedComments = [...comments].sort((a, b) => {
			const timeA = new Date(
				a.date_gmt.endsWith('Z') ? a.date_gmt : `${a.date_gmt}Z`,
			).getTime();
			const timeB = new Date(
				b.date_gmt.endsWith('Z') ? b.date_gmt : `${b.date_gmt}Z`,
			).getTime();
			return timeA - timeB;
		});

		const commentMap = new Map<number, any>();
		const rootComments: any[] = [];

		sortedComments.forEach(c => {
			commentMap.set(Number(c.id), { ...c, children: [], depth: 0 });
		});

		sortedComments.forEach(c => {
			const node = commentMap.get(Number(c.id));
			const parentId = Number(c.parent) || 0;

			if (parentId !== 0 && commentMap.has(parentId)) {
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
