import {
	getCiviDepartmentOptions,
	getCiviPeopleList,
} from '@/services/civicrm/civicrmPeople.service';
import {
	GetPeopleDepartmentOptionsQueryKey,
	GetPeopleDirectoryQueryKey,
	GetPeoplePreviewQueryKey,
	PeopleSortOrder,
} from '@/types/people.type';
import { QueryOptionHelper } from '@/util/helper/helper';
import { useQuery } from '@tanstack/react-query';

export const useGetPeoplePreview = ({
	limit = 10,
	options,
}: {
	limit?: number;
	options?: QueryOptionHelper<Patchwork.PeopleDirectoryItem[] | undefined>;
}) => {
	const queryKey: GetPeoplePreviewQueryKey = ['peoplePreview', { limit }];

	return useQuery({
		queryKey,
		queryFn: () => getCiviPeopleList({ sort: 'az', limit }),
		...options,
	});
};

export const useGetPeopleDirectory = ({
	search,
	sort = 'az',
	department,
	country,
	options,
}: {
	search?: string;
	sort?: PeopleSortOrder;
	department?: string;
	country?: string;
	options?: QueryOptionHelper<Patchwork.PeopleDirectoryItem[] | undefined>;
}) => {
	const queryKey: GetPeopleDirectoryQueryKey = [
		'peopleDirectory',
		{ search, sort, department, country },
	];

	return useQuery({
		queryKey,
		queryFn: () => getCiviPeopleList({ search, sort, department, country }),
		...options,
	});
};

export const useGetPeopleDepartmentOptions = ({
	options,
}: {
	options?: QueryOptionHelper<string[] | undefined>;
} = {}) =>
	useQuery({
		queryKey: ['peopleDepartmentOptions'] as GetPeopleDepartmentOptionsQueryKey,
		queryFn: getCiviDepartmentOptions,
		select: data => (Array.isArray(data) ? data : []),
		...options,
	});
