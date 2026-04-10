import React, { useMemo } from 'react';
import { View, useWindowDimensions, Pressable, Platform } from 'react-native';
import RenderHTML, { MixedStyleDeclaration } from 'react-native-render-html';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { cleanHtmlContent, stripTags } from '@/util/helper/helper';
import he from 'he';

interface FeedContentProps {
	post: Patchwork.WPStory;
	isLandscape?: boolean;
	onNavigateToDetail?: () => void;
	index?: number;
}

const LINE_HEIGHT = 22;
const PORTRAIT_LINES = 1;

export const LiveFeedContent: React.FC<FeedContentProps> = ({
	post,
	isLandscape = false,
	onNavigateToDetail,
	index = 0,
}) => {
	const { width, height } = useWindowDimensions();
	const { colorScheme } = useColorScheme();
	const contentWidth = width - 32;

	// Dynamically calculate lines based on screen height

	const androidMultiplier = index === 0 ? 0.128 : 0.25;
	const landscapeLines = Math.max(
		2,
		Math.floor(
			(height * (Platform.OS === 'android' ? androidMultiplier : 0.25)) /
				LINE_HEIGHT,
		),
	);

	const title = he.decode(stripTags(post.title.rendered));
	const htmlContent = useMemo(
		() => cleanHtmlContent(post.content.rendered),
		[post.content.rendered],
	);

	const plainTextLength = useMemo(
		() => stripTags(post.content.rendered).trim().length,
		[post.content.rendered],
	);

	// noted: calculates if the text length overflow the est char the parent view
	const maxChars =
		(contentWidth / 7) * (isLandscape ? landscapeLines : PORTRAIT_LINES);
	const shouldShowSeeMore = plainTextLength > maxChars;

	const textColor = !isLandscape
		? 'white'
		: colorScheme === 'dark'
		? 'white'
		: 'black';

	const tagsStyles: Readonly<Record<string, MixedStyleDeclaration>> = useMemo(
		() => ({
			body: {
				whiteSpace: 'normal',
				color: textColor,
				fontSize: 15,
				lineHeight: LINE_HEIGHT,
			},
			p: {
				marginVertical: 0,
				padding: 0,
			},
			div: {
				marginVertical: 0,
			},
		}),
		[textColor],
	);

	const maxHeight =
		(isLandscape ? landscapeLines : PORTRAIT_LINES) * LINE_HEIGHT;

	return (
		<View className="px-4 pt-4 pb-1 justify-start">
			<ThemeText
				className="text-xl font-bold mb-3"
				style={{ color: textColor }}
			>
				{title}
			</ThemeText>

			<Pressable onPress={onNavigateToDetail}>
				<View style={{ maxHeight, overflow: 'hidden' }}>
					<RenderHTML
						contentWidth={contentWidth}
						source={{ html: htmlContent }}
						tagsStyles={tagsStyles}
						defaultTextProps={{ numberOfLines: undefined }}
						ignoredDomTags={['img', 'iframe', 'video', 'source', 'br']}
					/>
				</View>
				{shouldShowSeeMore && (
					<ThemeText className="text-[#999] mt-1 font-semibold text-sm">
						See more
					</ThemeText>
				)}
			</Pressable>
		</View>
	);
};
