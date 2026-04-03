import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import Image from '@/components/atoms/common/Image/Image';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useNewsmastCollectionList } from '@/hooks/queries/channel.queries';
import { HomeStackScreenProps } from '@/types/navigation';
import { isTablet } from '@/util/helper/isTablet';
import { cn } from '@/util/helper/twutil';
import { ChevronRightIcon } from '@/util/svg/icon.common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

const NewsmastCollections: React.FC<
	HomeStackScreenProps<'NewsmastCollections'>
> = ({ navigation }) => {
	const { t } = useTranslation();
	const { data: collectionList } = useNewsmastCollectionList({});
	const imageHeightClass = isTablet ? 'h-[300]' : 'h-[150]';

	return (
		<SafeScreen>
			<Header title={'Global Channels'} leftCustomComponent={<BackButton />} />
			<View className="flex-1">
				{collectionList && (
					<FlatList
						data={collectionList}
						ListEmptyComponent={
							<ListEmptyComponent title="No Community Exist" />
						}
						renderItem={({ item, index }) => {
							const isLastItem = index == collectionList.length - 1;
							const baseWidthClass = isTablet
								? 'w-[31.5%]'
								: isLastItem && index % 2 === 0
								? 'w-[45.8%]'
								: 'flex-1';

							return (
								<Pressable
									className={cn(
										'rounded-md mx-2 items-center mb-3',
										baseWidthClass,
									)}
									onPress={() => {
										navigation.navigate('NewsmastCollectionDetail', {
											slug: item.attributes?.slug,
											title: item.attributes?.name,
											type: 'newsmast',
										});
									}}
								>
									<Image
										className={`w-full ${imageHeightClass} rounded-md`}
										uri={item.attributes.avatar_image_url}
										fallbackType="newsmast"
									/>
									<View
										className={`absolute w-full ${imageHeightClass} rounded-md bg-black opacity-30 bottom-0`}
									></View>
									<View className="absolute bottom-0 mx-2 mb-2 flex-row items-center">
										<ThemeText
											className="flex-1 font-Inter_Regular text-white"
											size={'fs_13'}
										>
											{item.attributes.name}{' '}
											{`(${item.attributes?.community_count})`}
										</ThemeText>
										<ChevronRightIcon className="ml-1" fill={'#fff'} />
									</View>
								</Pressable>
							);
						}}
						keyExtractor={item => item.id.toString()}
						contentContainerStyle={{
							paddingHorizontal: 16,
							paddingVertical: 16,
						}}
						numColumns={isTablet ? 3 : 2}
						showsVerticalScrollIndicator={false}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

export default NewsmastCollections;
