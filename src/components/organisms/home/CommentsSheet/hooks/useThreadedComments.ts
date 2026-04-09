import { useMemo } from 'react';
import { ProcessedComment } from '../CommentItem';

/**
 * used to resolve WP comments into mastodon thread comments by nesting replies under their parents
 */
export const useThreadedComments = (comments: Patchwork.WPComment[]) => {
	return useMemo(() => {
		if (!comments || !comments.length) return [];

		const sortedComments = [...comments].sort(
			(a, b) =>
				new Date(a.date_gmt + 'Z').getTime() -
				new Date(b.date_gmt + 'Z').getTime(),
		);

		const commentMap = new Map<number, any>();
		const rootComments: any[] = [];

		sortedComments.forEach(c => {
			commentMap.set(c.id, { ...c, children: [], depth: 0 });
		});

		sortedComments.forEach(c => {
			const node = commentMap.get(c.id);
			if (c.parent && c.parent !== 0 && commentMap.has(c.parent)) {
				commentMap.get(c.parent).children.push(node);
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
