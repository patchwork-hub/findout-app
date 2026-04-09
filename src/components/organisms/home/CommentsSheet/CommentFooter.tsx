import React, { useState } from 'react';
import { View, Pressable, Platform, ActivityIndicator } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '@/store/auth/authStore';
import Image from '@/components/atoms/common/Image/Image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface CommentFooterProps {
	onFocusInput: () => void;
	bottomInset: number;
	onSubmit?: (text: string) => void;
	isLoading?: boolean;
}

export const CommentFooter = ({
	onFocusInput,
	bottomInset,
	onSubmit,
	isLoading,
}: CommentFooterProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const { userInfo } = useAuthStore();
	const [text, setText] = useState('');

	const handleSend = () => {
		if (text.trim().length > 0 && onSubmit && !isLoading) {
			onSubmit(text.trim());
			setText('');
		}
	};

	return (
		<View
			className="px-4 pt-3 border-t border-gray-200 dark:border-gray-800 bg-[#fff] dark:bg-[#121212]"
			style={{
				paddingBottom: Math.max(bottomInset, 12),
			}}
		>
			<View className="flex-row items-center">
				<Image
					source={{
						uri:
							userInfo?.avatar_static ||
							userInfo?.avatar ||
							'https://ui-avatars.com/api/?name=User',
					}}
					style={{ width: 32, height: 32, borderRadius: 16, marginBottom: 4 }}
					className="bg-[#eee] dark:bg-[#333]"
					iconSize={32}
				/>

				<View className="flex-1 flex-row ml-3 bg-slate-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[44px] items-center px-4">
					<BottomSheetTextInput
						multiline
						placeholder="Post your reply"
						placeholderTextColor={isDark ? '#999' : '#666'}
						value={text}
						onChangeText={setText}
						editable={!isLoading}
						style={{
							color: isDark ? 'white' : 'black',
							flex: 1,
							minHeight: 32,
							maxHeight: 120,
							paddingTop: Platform.OS === 'ios' ? 12 : 8,
							paddingBottom: Platform.OS === 'ios' ? 12 : 8,
						}}
						onFocus={onFocusInput}
					/>
				</View>

				{(text.trim().length > 0 || isLoading) && (
					<Pressable
						onPress={handleSend}
						disabled={isLoading}
						className={`w-8 h-8 ml-3 rounded-full bg-black dark:bg-white items-center justify-center mr-1 ${
							isLoading ? 'opacity-50' : ''
						}`}
					>
						<FontAwesomeIcon
							icon={faChevronRight}
							color={isDark ? 'black' : 'white'}
							size={16}
						/>
					</Pressable>
				)}
			</View>
		</View>
	);
};
