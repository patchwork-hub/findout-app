import { View, RefreshControl } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import Underline from '@/components/atoms/common/Underline/Underline';
import { FloatingAddButton } from '@/components/molecules/conversations/FloatingAddButton/FloatingAddButton';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useListsQueries } from '@/hooks/queries/lists.queries';
import { ListsStackScreenProps } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import ListsItem from '@/components/organisms/lists/ListsItem';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

const Lists = ({ navigation }: ListsStackScreenProps<'Lists'>) => {
	const { bottom } = useSafeAreaInsets();
	const { t } = useTranslation();
	const { data, isLoading, isRefetching, refetch } = useListsQueries();

	const renderItem = useCallback(
		({ item }: { item: Patchwork.Lists }) => (
			<ListsItem {...{ item, navigation }} />
		),
		[],
	);
	const { colorScheme } = useColorScheme();

	return (
		<SafeScreen>
			<Header
				title={t('screen.lists')}
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
				<FlashList
					data={data}
					contentContainerStyle={{
						paddingBottom: bottom,
					}}
					keyExtractor={item => item.id.toString()}
					renderItem={renderItem}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							tintColor={colorScheme == 'dark' ? 'white' : 'black'}
							onRefresh={refetch}
						/>
					}
					getItemType={item => {
						return item.id;
					}}
					ListEmptyComponent={() => {
						return (
							<ListEmptyComponent
								title={t('list.no_lists_yet')}
								subtitle={t('list.no_lists_yet_desc')}
							/>
						);
					}}
					ItemSeparatorComponent={Underline}
					showsVerticalScrollIndicator={false}
				/>
			)}
			<FloatingAddButton
				onPress={() => navigation.navigate('UpsertList', { type: 'create' })}
				className="right-7"
				style={{
					bottom: bottom + 15,
				}}
			/>
		</SafeScreen>
	);
};

export default Lists;
