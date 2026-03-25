export type PeopleSortOrder = 'az' | 'za';

export type PeopleDirectoryQueryParam = {
	search?: string;
	sort?: PeopleSortOrder;
	department?: string;
	country?: string;
	limit?: number;
};

export type GetPeoplePreviewQueryKey = ['peoplePreview', { limit: number }];
export type GetPeopleDepartmentOptionsQueryKey = ['peopleDepartmentOptions'];

export type GetPeopleDirectoryQueryKey = [
	'peopleDirectory',
	{
		search?: string;
		sort: PeopleSortOrder;
		department?: string;
		country?: string;
	},
];
