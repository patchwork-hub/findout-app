import NewsmastPeopleToFollowItem from '@/components/atoms/channel/NewsmastPeopleToFollowItem/NewsmastPeopleToFollowItem';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useGetNewsmastCommunityPeopleToFollow } from '@/hooks/queries/channel.queries';
import { HomeStackScreenProps } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { CircleFade, Flow } from 'react-native-animated-spinkit';
import { FlatList } from 'react-native-gesture-handler';
import { DEFAULT_FINDOUT_DASHBOARD_API_URL } from '@/util/constant';

const PAGE_SIZE = 15;

const NMChannelAllContributorList = ({
	route,
}: HomeStackScreenProps<'NMChannelAllContributorList'>) => {
	const { t } = useTranslation();
	const { id, adminUsername } = route.params;
	const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

	const { colorScheme } = useColorScheme();
	const [currentPage, setCurrentPage] = useState(1);

	const { data: allPeople, isLoading } = useGetNewsmastCommunityPeopleToFollow({
		id,
		domain_name: adminUsername?.endsWith('findout.media')
			? DEFAULT_FINDOUT_DASHBOARD_API_URL
			: undefined,
	});

	const [displayedPeople, setDisplayedPeople] = useState(() =>
		allPeople?.slice(0, PAGE_SIZE),
	);

	const loadMorePeople = useCallback(() => {
		if (
			displayedPeople &&
			allPeople &&
			displayedPeople.length >= allPeople?.length
		) {
			return setIsFetchingNextPage(false);
		}
		setIsFetchingNextPage(true);
		setTimeout(() => {
			const nextPage = currentPage + 1;
			const newItems = allPeople?.slice(0, nextPage * PAGE_SIZE);
			setCurrentPage(nextPage);
			setDisplayedPeople(newItems);
		}, 400);
	}, [allPeople, currentPage, displayedPeople?.length]);

	const renderItem = useCallback(
		({ item }: { item: Patchwork.NewsmastComunityContributorList }) => {
			return (
				<NewsmastPeopleToFollowItem item={item} showAsVerticalItem={true} />
			);
		},
		[],
	);

	return (
		<SafeScreen>
			<View className="flex-1">
				<Header
					title={t('screen.people_to_follow')}
					leftCustomComponent={<BackButton />}
					underlineClassName="mb-0"
				/>

				{isLoading ? (
					<View className="flex-1 justify-center items-center">
						<Flow
							size={50}
							color={
								colorScheme === 'dark'
									? customColor['patchwork-primary-dark']
									: customColor['patchwork-primary']
							}
						/>
					</View>
				) : (
					<FlatList
						data={displayedPeople}
						renderItem={renderItem}
						keyExtractor={item => item.id}
						onEndReached={loadMorePeople}
						showsVerticalScrollIndicator={false}
						onEndReachedThreshold={0.5}
						ListFooterComponent={
							<View className="items-center my-5">
								{isFetchingNextPage &&
								displayedPeople &&
								displayedPeople?.length > 0 ? (
									<CircleFade
										size={25}
										color={colorScheme === 'dark' ? '#fff' : '#000'}
									/>
								) : (
									<></>
								)}
							</View>
						}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

export default NMChannelAllContributorList;
