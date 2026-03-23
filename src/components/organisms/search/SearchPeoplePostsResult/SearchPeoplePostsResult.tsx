import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import StatusWrapper from '../../feed/StatusWrapper/StatusWrapper';
import HashTagsBySearchResult from '@/components/molecules/search/HashTagsBySearchResult/HashTagsBySearchResult';
import SuggestedPeopleBySearchResult from '@/components/molecules/search/SuggestedPeopleBySearchResult/SuggestedPeopleBySearchResult';
import { FlashList } from '@shopify/flash-list';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ISearchPeoplePostsResult {
	searchAllRes: Patchwork.SearchAll;
	q: string;
}
const SearchPeoplePostsResult = ({
	searchAllRes,
	q,
}: ISearchPeoplePostsResult) => {
	const { t } = useTranslation();

	return (
		<FlashList
			data={searchAllRes.statuses}
			keyExtractor={item => item.id.toString()}
			renderItem={({ item }) => (
				<StatusWrapper
					status={item}
					currentPage="SearchedStatuses"
					extraPayload={{ q }}
					statusType={item.reblog ? 'reblog' : 'normal'}
				/>
			)}
			ListHeaderComponent={() => (
				<>
					<HashTagsBySearchResult
						hashtagsSearchResult={searchAllRes.hashtags}
					/>
					<SuggestedPeopleBySearchResult
						searchedSuggestedPeople={searchAllRes.accounts}
						q={q}
					/>
					{searchAllRes.statuses.length > 0 && (
						<Pressable className="mx-4 mt-3">
							<ThemeText className="font-NewsCycle_Bold" size="lg_18">
								{t('common.posts')}
							</ThemeText>
						</Pressable>
					)}
				</>
			)}
			getItemType={item => {
				return item.id;
			}}
			showsVerticalScrollIndicator={false}
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
		/>
	);
};

export default SearchPeoplePostsResult;
