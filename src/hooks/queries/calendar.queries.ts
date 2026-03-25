import { useInfiniteQuery } from '@tanstack/react-query';
import {
	dedupeLautiEvents,
	getLautiGroups,
	getLautiUpcomingEvents,
	hasValidCoords,
} from '@/services/calendar.service';
import type {
	GetLautiEventsParams,
	GetLautiGroupsParams,
} from '@/types/calendar.type';

type UseGetLautiUpcomingEventsParams = Pick<
	GetLautiEventsParams,
	'pageSize'
> & {
	enabled?: boolean;
};

type UseGetLautiGroupsParams = Pick<GetLautiGroupsParams, 'limit'> & {
	enabled?: boolean;
};

export const useGetLautiUpcomingEvents = ({
	pageSize = 100,
	enabled = true,
}: UseGetLautiUpcomingEventsParams = {}) => {
	return useInfiniteQuery({
		queryKey: ['lautiUpcomingEvents', { pageSize }],
		queryFn: ({ pageParam = 0 }) =>
			getLautiUpcomingEvents({
				page: pageParam,
				pageSize,
			}),
		initialPageParam: 0,
		getNextPageParam: lastPage => lastPage.nextPage,
		enabled,
		staleTime: 60 * 1000,
		select: data => ({
			...data,
			pages: (() => {
				const seenEventIdentities = new Set<string>();
				return data.pages.map(page => ({
					...page,
					items: dedupeLautiEvents(
						page.items.filter(hasValidCoords),
						seenEventIdentities,
					),
				}));
			})(),
		}),
	});
};

export const useGetLautiGroups = ({
	limit = 20,
	enabled = true,
}: UseGetLautiGroupsParams = {}) => {
	return useInfiniteQuery({
		queryKey: ['lautiGroups', { limit }],
		queryFn: ({ pageParam = 0 }) =>
			getLautiGroups({
				offset: pageParam,
				limit,
			}),
		initialPageParam: 0,
		getNextPageParam: lastPage => lastPage.nextOffset,
		enabled,
		staleTime: 60 * 1000,
	});
};
