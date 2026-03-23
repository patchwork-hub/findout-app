import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Underline from '@/components/atoms/common/Underline/Underline';
import UserListItem from '@/components/organisms/feed/UserListItem/UserListItem';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useGetBoostedBy } from '@/hooks/queries/feed.queries';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { HomeStackScreenProps } from '@/types/navigation';
import { DEFAULT_INSTANCE } from '@/util/constant';
import customColor from '@/util/constant/color';
import { extractInstanceName } from '@/util/helper/helper';
import { flattenPages } from '@/util/helper/timeline';
import { UserAccountIcon } from '@/util/svg/icon.common';
import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { FlatList, Linking, Pressable, View } from 'react-native';
import { CircleFade, Flow } from 'react-native-animated-spinkit';
import { useTranslation } from 'react-i18next';

const BoostedBy = ({ route }: HomeStackScreenProps<'BoostedBy'>) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { id, uri } = route.params;
	const instanceName = extractInstanceName(uri);
	const defaultInstance = extractInstanceName(DEFAULT_INSTANCE);
	const domain_name = useSelectedDomain();

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useGetBoostedBy({
			id,
			domain_name,
		});
	const boostedByList = useMemo(() => flattenPages(data), [data]);

	const renderItem = ({ item }: { item: Patchwork.Account }) => {
		return <UserListItem item={item} />;
	};

	const onLoadMore = () => {
		if (hasNextPage) {
			return fetchNextPage();
		}
	};

	const renderMissingNotice = () => (
		<>
			<ThemeText className="text-center text-xs text-patchwork-grey-400 my-3">
				{t('timeline.missingUsers')}
			</ThemeText>
			{instanceName !== defaultInstance && (
				<Pressable
					onPress={() => {
						Linking.openURL(`${uri}/reblogs`);
					}}
					className="active:opacity-70"
				>
					<ThemeText className="text-center text-xs pb-3 mt-[2] text-patchwork-secondary">
						{t('timeline.seeMoreUsers', { instance: instanceName })}
					</ThemeText>
				</Pressable>
			)}
		</>
	);

	return (
		<SafeScreen>
			<View className="flex-1">
				<Header
					title={t('screen.boosted_by')}
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
				) : boostedByList.length === 0 ? (
					<View className="flex-1 justify-center items-center">
						<UserAccountIcon colorScheme={colorScheme} />
						{renderMissingNotice()}
					</View>
				) : (
					<View className="flex-1 justify-between">
						<FlatList
							data={boostedByList}
							keyExtractor={item => item.id.toString()}
							renderItem={renderItem}
							ItemSeparatorComponent={Underline}
							showsVerticalScrollIndicator={false}
							onEndReached={onLoadMore}
							onEndReachedThreshold={0.15}
							ListFooterComponent={
								<View className="items-center my-5">
									{isFetchingNextPage ? (
										<CircleFade
											size={25}
											color={colorScheme === 'dark' ? '#fff' : '#000'}
										/>
									) : null}
								</View>
							}
						/>
						{renderMissingNotice()}
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

export default BoostedBy;
