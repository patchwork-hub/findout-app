import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { View, Keyboard } from 'react-native';
import {
	BottomSheetModal,
	BottomSheetFlatList,
	BottomSheetFooter,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useGetWordpressCommentsByPostId } from '@/hooks/queries/wpFeed.queries';
import customColor from '@/util/constant/color';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { CommentItem, ProcessedComment } from './CommentItem';
import { CommentFooter } from './CommentFooter';
import { useThreadedComments } from './hooks/useThreadedComments';

export const CommentsSheet = () => {
	const { colorScheme } = useColorScheme();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const {
		isCommentSheetOpen: isOpen,
		closeComments,
		commentPostId: postId,
	} = useLiveVideoFeedStore();

	const insets = useSafeAreaInsets();
	const isDark = colorScheme === 'dark';
	const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
	const snapPoints = useMemo(() => ['65%', '95%'], []);

	const { data: comments = [] } = useGetWordpressCommentsByPostId(
		postId || 0,
		isOpen && !!postId,
	);

	const processedComments = useThreadedComments(comments);

	useEffect(() => {
		if (isOpen) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
			Keyboard.dismiss();
		}
	}, [isOpen]);

	const handleSheetChanges = useCallback(
		(index: number) => {
			setCurrentSnapIndex(index);
			if (index === -1) {
				closeComments();
			}
		},
		[closeComments],
	);

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

	const renderFooter = useCallback(
		(props: any) => (
			<BottomSheetFooter {...props} bottomInset={0}>
				<CommentFooter
					onFocusInput={() => bottomSheetRef.current?.snapToIndex(1)}
					bottomInset={insets.bottom}
				/>
			</BottomSheetFooter>
		),
		[insets.bottom],
	);

	const renderItem = useCallback(
		({ item }: { item: ProcessedComment }) => <CommentItem item={item} />,
		[],
	);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			enablePanDownToClose
			onChange={handleSheetChanges}
			onDismiss={closeComments}
			backgroundStyle={{
				backgroundColor: isDark ? customColor['patchwork-dark-100'] : 'white',
			}}
			handleIndicatorStyle={{
				backgroundColor:
					currentSnapIndex === 1
						? isDark
							? '#000'
							: '#fff'
						: isDark
						? '#555'
						: '#ccc',
			}}
			keyboardBehavior="interactive"
			android_keyboardInputMode="adjustResize"
			footerComponent={renderFooter}
			backdropComponent={renderBackdrop}
		>
			<View className="flex-row justify-center items-center py-1.5 relative">
				<ThemeText
					className="font-bold text-sm"
					style={{ color: isDark ? 'white' : 'black' }}
				>
					{comments.length} comments
				</ThemeText>
			</View>

			<BottomSheetFlatList
				data={processedComments}
				showsVerticalScrollIndicator={false}
				keyExtractor={(item: ProcessedComment) => item.id.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
				ListEmptyComponent={
					<View className="h-[500] w-full items-center justify-center">
						<ListEmptyComponent title="No comments found" />
					</View>
				}
			/>
		</BottomSheetModal>
	);
};
