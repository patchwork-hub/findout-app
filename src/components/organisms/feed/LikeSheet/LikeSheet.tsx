import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
	BottomSheetModal,
	BottomSheetFlatList,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import {
	View,
	Image,
	ActivityIndicator,
	Pressable,
	Linking,
} from 'react-native';
import customColor from '@/util/constant/color';
import {
	// useGetWordpressLikesByPostId,
	useGetWordpressPostById,
	useGetWordpressPostStatusFromMastodon,
	useGetWordpressPostLikesFromMastodon,
} from '@/hooks/queries/wpFeed.queries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth/authStore';
import navigationRef from '@/util/navigation/navigationRef';
import { CommonActions } from '@react-navigation/native';

export const LikeSheet = () => {
	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const userInfo = useAuthStore(state => state.userInfo);
	const {
		isLikeSheetOpen: isOpen,
		closeLikeSheet,
		likeSheetPostId,
	} = useLiveVideoFeedStore();
	const snapPoints = useMemo(() => ['50%', '85%'], []);

	// const { data: likesData, isLoading } = useGetWordpressLikesByPostId(
	// 	likeSheetPostId!,
	// 	!!likeSheetPostId && isOpen,
	// );

	const { data: post, isFetching: isPostFetching } = useGetWordpressPostById(
		likeSheetPostId!,
		!!likeSheetPostId && isOpen,
	);

	const { data: mastodonStatus, isFetching: isStatusFetching } =
		useGetWordpressPostStatusFromMastodon(post?.link || '');

	const { data: mastodonLikesData, isFetching: isLikesFetching } =
		useGetWordpressPostLikesFromMastodon(mastodonStatus?.id);

	const isLoading =
		isOpen &&
		(isPostFetching ||
			isStatusFetching ||
			isLikesFetching ||
			(!!mastodonStatus?.id && mastodonLikesData === undefined));

	useEffect(() => {
		if (isOpen) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [isOpen]);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
				pressBehavior="close"
			/>
		),
		[],
	);

	const renderItem = useCallback(
		({ item }: { item: Patchwork.Account }) => (
			<Pressable
				className="flex-row items-center py-3 px-4 border-b border-gray-100 dark:border-patchwork-dark-50"
				onPress={() => {
					if (!item.id || !navigationRef.isReady()) {
						if (item.url) Linking.openURL(item.url);
						return;
					}
					closeLikeSheet();
					if (userInfo?.id === item.id) {
						navigationRef.dispatch(
							CommonActions.navigate({
								name: 'Profile',
								params: { id: item.id },
							}),
						);
					} else {
						navigationRef.dispatch(
							CommonActions.navigate({
								name: 'ProfileOther',
								params: { id: item.id },
							}),
						);
					}
				}}
			>
				<Image
					source={{ uri: item.avatar || 'https://via.placeholder.com/150' }}
					className="w-10 h-10 rounded-full bg-gray-200"
				/>
				<View className="ml-3 flex-1">
					<ThemeText className="font-NewsCycle_Bold">
						{item.display_name || item.username || 'Anonymous User'}
					</ThemeText>
					{item.url && (
						<ThemeText
							className="text-xs text-gray-500 mt-0.5"
							numberOfLines={1}
						>
							{item.acct || item.url.replace(/^https?:\/\//, '')}
						</ThemeText>
					)}
				</View>
			</Pressable>
		),
		[closeLikeSheet, userInfo?.id],
	);

	const ListEmptyComponent = useCallback(() => {
		if (isLoading) {
			return (
				<View className="py-8 justify-center items-center">
					<ActivityIndicator
						size="small"
						color={customColor['patchwork-primary']}
					/>
				</View>
			);
		}
		return (
			<View className="py-8 justify-center items-center">
				<ThemeText className="text-gray-500 font-Inter_Regular">
					No likes yet.
				</ThemeText>
			</View>
		);
	}, [isLoading]);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			onDismiss={closeLikeSheet}
			backdropComponent={renderBackdrop}
			enablePanDownToClose
			backgroundStyle={{
				backgroundColor:
					colorScheme === 'dark' ? customColor['patchwork-dark-100'] : 'white',
			}}
			handleIndicatorStyle={{
				backgroundColor: colorScheme === 'dark' ? '#555' : '#ccc',
			}}
		>
			<View className="px-4 py-3 border-b border-gray-200 dark:border-patchwork-dark-200">
				<ThemeText className="text-lg font-NewsCycle_Bold text-center">
					Likes
				</ThemeText>
			</View>
			<BottomSheetFlatList
				data={mastodonLikesData || []}
				keyExtractor={(
					item: { url: any; id?: string },
					index: { toString: () => any },
				) => item.id?.toString() || item.url || index.toString()}
				renderItem={renderItem}
				ListEmptyComponent={ListEmptyComponent}
				contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}
			/>
		</BottomSheetModal>
	);
};
