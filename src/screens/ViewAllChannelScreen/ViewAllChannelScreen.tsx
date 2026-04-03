import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { EmptyListComponent } from '@/components/molecules/search/EmptyListItem/EmptyListItem';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useAuthStore } from '@/store/auth/authStore';
import { useActiveDomainAction } from '@/store/feed/activeDomain';
import { HomeStackScreenProps } from '@/types/navigation';
import customColor from '@/util/constant/color';
import {
	ensureHttp,
	isCurrentUserFromMainInstances,
} from '@/util/helper/helper';
import { isTablet } from '@/util/helper/isTablet';
import { cn } from '@/util/helper/twutil';
import { ChevronRightIcon, PrimaryBadgeIcon } from '@/util/svg/icon.common';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';

const ViewAllChannelScreen: React.FC<
	HomeStackScreenProps<'ViewAllChannelScreen'>
> = ({ route, navigation }) => {
	const { title, data } = route.params;
	const { setDomain } = useActiveDomainAction();
	const { userOriginInstance } = useAuthStore();

	const onPressChannelItem = (item: Patchwork.ChannelList) => {
		navigation.navigate('NewsmastChannelTimeline', {
			accountHandle: item?.attributes?.community_admin?.username,
			fetchTimelineFromLoggedInServer: true,
			slug: item?.attributes?.slug,
			avatar_image_url: item?.attributes?.avatar_image_url,
			banner_image_url: item?.attributes?.banner_image_url,
			channel_name: item?.attributes?.name,
			channel_type: item?.attributes?.channel_type,
		});
	};

	const renderChannelItem = ({
		item,
		index,
	}: {
		item: Patchwork.ChannelList;
		index: number;
	}) => {
		const isLastItem = index === data.length - 1;

		const imageHeightClass = isTablet ? 'h-[300]' : 'h-[150]';
		const baseWidthClass = isTablet
			? 'w-[31.5%]'
			: isLastItem && index % 2 === 0
			? 'w-[45.8%]'
			: 'flex-1';
		return (
			<Pressable
				className={cn('rounded-md mx-2 items-center mb-3', baseWidthClass)}
				onPress={() => onPressChannelItem(item)}
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
				{item.attributes?.is_primary && (
					<View className="absolute top-1 right-1 bg-white rounded-full">
						<PrimaryBadgeIcon
							fill={customColor['patchwork-dark-50']}
							width={25}
							height={25}
						/>
					</View>
				)}
			</Pressable>
		);
	};

	return (
		<SafeScreen>
			<Header title={title} leftCustomComponent={<BackButton />} />
			<View className="flex-1">
				<FlatList
					data={data}
					ListEmptyComponent={EmptyListComponent}
					renderItem={({ item, index }) => {
						return renderChannelItem({
							item,
							index,
						});
					}}
					keyExtractor={item => {
						if ('domain' in item) {
							return `server-info-${item.domain}`;
						} else {
							return item.id.toString();
						}
					}}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingVertical: 16,
					}}
					numColumns={isTablet ? 3 : 2}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</SafeScreen>
	);
};

export default ViewAllChannelScreen;
