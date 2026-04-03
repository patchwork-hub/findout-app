import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import CollectionChannelLoading from '@/components/atoms/loading/CollectionChannelLoading';
import { EmptyListComponent } from '@/components/molecules/search/EmptyListItem/EmptyListItem';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useDetailCollectionChannelList } from '@/hooks/queries/channel.queries';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveDomainAction } from '@/store/feed/activeDomain';
import { HomeStackScreenProps } from '@/types/navigation';
import {
	ensureHttp,
	isCurrentUserFromMainInstances,
} from '@/util/helper/helper';
import { isTablet } from '@/util/helper/isTablet';
import { cn } from '@/util/helper/twutil';
import { ChevronRightIcon } from '@/util/svg/icon.common';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';

const NewsmastCollectionDetail: React.FC<
	HomeStackScreenProps<'NewsmastCollectionDetail'>
> = ({ route, navigation }) => {
	const { slug, title, type } = route.params;
	const {
		data: collectionChannelsList,
		isLoading,
		isSuccess,
	} = useDetailCollectionChannelList({ slug, type });

	const handleChannelClick = (item: Patchwork.ChannelList) => {
		navigation.navigate('NewsmastChannelTimeline', {
			accountHandle: item.attributes.community_admin.username,
			fetchTimelineFromLoggedInServer: true,
			slug: item.attributes?.slug,
			avatar_image_url: item?.attributes?.avatar_image_url,
			banner_image_url: item?.attributes?.banner_image_url,
			channel_name: item?.attributes?.name,
			channel_type: item?.attributes?.channel_type,
		});
	};

	return (
		<SafeScreen>
			<Header title={title} leftCustomComponent={<BackButton />} />
			<View className="flex-1">
				{isLoading ? (
					<CollectionChannelLoading />
				) : (
					collectionChannelsList &&
					isSuccess && (
						<FlatList
							data={collectionChannelsList}
							ListEmptyComponent={EmptyListComponent}
							renderItem={({ item, index }) => {
								const isLastItem = index == collectionChannelsList.length - 1;
								const baseWidthClass = isTablet
									? 'w-[31.5%]'
									: isLastItem && index % 2 === 0
									? 'w-[45.8%]'
									: 'flex-1';
								const imageHeightClass = isTablet ? 'h-[300]' : 'h-[150]';
								return (
									<Pressable
										className={cn(
											'rounded-md mx-2 items-center mb-3',
											baseWidthClass,
										)}
										onPress={() => handleChannelClick(item)}
									>
										<Image
											className={cn('w-full rounded-md', imageHeightClass)}
											uri={item.attributes.avatar_image_url}
										/>
										<View
											className={cn(
												'absolute w-full rounded-md bg-black opacity-30 bottom-0',
												imageHeightClass,
											)}
										></View>
										<View className="absolute bottom-0 mx-2 mb-2 flex-row items-center">
											<ThemeText
												className="flex-1 font-Inter_Regular text-white"
												size={'fs_13'}
											>
												{item.attributes.name}
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
					)
				)}
			</View>
		</SafeScreen>
	);
};

export default NewsmastCollectionDetail;
