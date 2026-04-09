import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import customColor from '@/util/constant/color';
import {
	defaultSystemFonts,
	MixedStyleDeclaration,
	RenderHTMLProps,
} from 'react-native-render-html';
import RenderHTML from 'react-native-render-html';
import { formatShortDate } from '@/util/helper/helper';

export type ProcessedComment = Patchwork.WPComment & { depth?: number };

interface CommentItemProps {
	item: ProcessedComment;
}

export const CommentItem = ({ item }: CommentItemProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	const baseTextColor = isDark ? '#fff' : '#000';
	const primaryColor = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const handleLinkPress = useCallback((evt: any, href: string) => {
		console.log('Link pressed:', href);
	}, []);

	const tagsStyles = useMemo<Record<string, MixedStyleDeclaration>>(
		() => ({
			a: {
				textDecorationLine: 'none',
				color: primaryColor,
				fontWeight: '500',
			},
			p: {
				marginBottom: 0,
				marginTop: 0,
			},
		}),
		[primaryColor],
	);

	const renderersProps = useMemo<RenderHTMLProps['renderersProps']>(
		() => ({
			a: {
				onPress: handleLinkPress,
			},
		}),
		[handleLinkPress],
	);

	const depth = item.depth || 0;
	const isReply = depth > 0;

	return (
		<View
			className={`flex-row relative ${isReply ? 'mt-2 mb-4' : 'mt-4 mb-4'}`}
		>
			{isReply && (
				<View
					className="absolute w-[2px] bg-gray-300 dark:bg-[#444]"
					style={{
						left: 15,
						top: -50,
						bottom: 0,
						zIndex: 0,
					}}
				/>
			)}

			<View style={{ zIndex: 1, elevation: 1 }}>
				<Image
					source={{ uri: item.author_avatar_urls['48'] }}
					className="w-8 h-8 rounded-full mr-3 bg-[#eee] dark:bg-[#444]"
				/>
			</View>
			<View className="flex-1">
				<View className="flex-row items-baseline mb-1">
					<ThemeText className="font-semibold font-NewsCycle_Bold text-[13px] text-[#333] dark:text-white mr-2">
						{item.author_name}
					</ThemeText>
					<ThemeText className="text-[11px] text-[#888]">
						• {formatShortDate(item.date_gmt)}
					</ThemeText>
				</View>
				<RenderHTML
					source={{ html: item.content.rendered }}
					renderersProps={renderersProps}
					tagsStyles={tagsStyles}
					systemFonts={[...defaultSystemFonts, 'Inter_Regular']}
					baseStyle={{
						fontSize: 14,
						color: baseTextColor,
						lineHeight: 22,
					}}
				/>
				{/* <View className="flex-row gap-4">
					<ThemeText className="text-xs text-[#888]">
						{formatShortDate(item.date_gmt)}
					</ThemeText>
				</View> */}
			</View>
		</View>
	);
};
