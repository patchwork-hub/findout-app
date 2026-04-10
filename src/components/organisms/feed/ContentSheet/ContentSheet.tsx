import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import RenderHTML, { MixedStyleDeclaration } from 'react-native-render-html';
import { useLiveVideoFeedStore } from '@/store/ui/liveVideoFeedStore';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { stripTags, cleanHtmlContent } from '@/util/helper/helper';
import customColor from '@/util/constant/color';
import he from 'he';

export const ContentSheet = () => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const {
		isContentSheetOpen: isOpen,
		contentPost: post,
		closeContent,
	} = useLiveVideoFeedStore();
	const snapPoints = useMemo(() => ['85%'], []);
	const { width } = useWindowDimensions();
	const { colorScheme } = useColorScheme();
	const textColor = colorScheme === 'dark' ? 'white' : 'black';

	const tagsStyles: Readonly<Record<string, MixedStyleDeclaration>> = useMemo(
		() => ({
			body: {
				whiteSpace: 'normal',
				color: textColor,
				fontSize: 16,
				lineHeight: 24,
			},
			p: {
				marginVertical: 10,
				padding: 0,
			},
			div: {
				marginVertical: 0,
			},
		}),
		[textColor],
	);

	useEffect(() => {
		if (isOpen && post) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [isOpen, post]);

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

	if (!post) return null;

	const htmlContent = cleanHtmlContent(post.content.rendered);
	const title = he.decode(post.title.rendered);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			onDismiss={closeContent}
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
			<BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
				<ThemeText className="text-xl font-bold mb-4">{title}</ThemeText>
				<RenderHTML
					contentWidth={width - 32}
					source={{ html: htmlContent }}
					tagsStyles={tagsStyles}
					defaultTextProps={{ numberOfLines: undefined }}
					ignoredDomTags={['img', 'iframe', 'video', 'source', 'br']}
				/>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};
