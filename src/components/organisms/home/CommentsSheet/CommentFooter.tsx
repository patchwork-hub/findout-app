import React from 'react';
import { View, Pressable } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CommentFooterProps {
	onFocusInput: () => void;
	bottomInset: number;
}

export const CommentFooter = ({
	onFocusInput,
	bottomInset,
}: CommentFooterProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<View
			className="px-4 pt-2.5 border-t border-gray-100/10 bg-[#fff] dark:bg-[#1a1a1a]"
			style={{
				paddingBottom: bottomInset,
			}}
		>
			<View className="flex-row items-center rounded-full px-1 py-1 h-11 bg-[#f0f0f0] dark:bg-[#333333]">
				<BottomSheetTextInput
					placeholder="Add comment..."
					placeholderTextColor={isDark ? '#999' : '#666'}
					style={{
						color: isDark ? 'white' : 'black',
						flex: 1,
						height: 40,
						marginLeft: 12,
					}}
					onFocus={onFocusInput}
				/>
				<Pressable className="w-8 h-8 rounded-full bg-black dark:bg-white items-center justify-center mr-1">
					<FontAwesomeIcon
						icon={faChevronRight}
						color={isDark ? 'black' : 'white'}
						size={16}
					/>
				</Pressable>
			</View>
		</View>
	);
};
