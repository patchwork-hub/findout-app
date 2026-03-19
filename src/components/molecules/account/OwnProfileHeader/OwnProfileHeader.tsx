// src/components/organisms/profile/OwnProfileHeader/OwnProfileHeader.tsx

import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import dayjs from 'dayjs';
import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useColorScheme } from 'nativewind';

type OwnProfileHeaderProps = {
	profile: Patchwork.Account;
	onPressPreview?: (uri: string) => void;
};

const OwnProfileHeader: React.FC<OwnProfileHeaderProps> = ({
	profile,
	onPressPreview = () => {},
}) => {
	const { colorScheme } = useColorScheme();
	const cleanBio = profile.note.replace(/<[^>]*>?/gm, '');

	return (
		<View
			className="bg-white dark:bg-patchwork-dark-100"
			pointerEvents="box-none"
		>
			<Pressable
				pointerEvents="auto"
				onPress={() => onPressPreview(profile.header)}
			>
				<FastImage
					className="h-[140px] w-full bg-gray-700"
					source={{ uri: profile.header, priority: FastImage.priority.high }}
					resizeMode={FastImage.resizeMode.cover}
				/>
			</Pressable>

			<View className="items-center px-4 pb-4">
				<Pressable
					className="mt-[-45px] mb-3"
					pointerEvents="auto"
					onPress={() => onPressPreview(profile.avatar)}
				>
					<Image
						uri={profile.avatar}
						className="h-[90px] w-[90px] rounded-full border-4 border-[#1C1C1E] bg-gray-600"
					/>
				</Pressable>

				{profile.display_name && (
					<View className="flex-row items-center justify-center">
						<ThemeText className="text-2xl font-NewsCycle_Bold">
							{profile.display_name}
						</ThemeText>
						{profile.locked && (
							<View style={{ marginStart: 6 }}>
								<FontAwesomeIcon
									icon={faLock}
									color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
									size={16}
								/>
							</View>
						)}
					</View>
				)}
				<View className="flex-row items-center mt-1">
					<Text className="text-sm text-gray-400">@{profile.acct}</Text>
					<Text className="text-sm text-gray-400 mx-1">·</Text>
					<Text className="text-sm text-gray-400">
						Joined {dayjs(profile.created_at).format('MMM YYYY')}
					</Text>
				</View>
				{cleanBio ? (
					<Text className="text-white text-center my-4 mx-2">{cleanBio}</Text>
				) : null}
				<View className="flex-row w-full justify-around items-center my-3 px-4">
					<StatItem count={profile.followers_count} label="Followers" />
					<View className="h-6 w-px bg-gray-600" />
					<StatItem count={profile.following_count} label="Following" />
					<View className="h-6 w-px bg-gray-600" />
					<StatItem count={profile.statuses_count} label="Posts" />
				</View>

				{/* Tags/Fields */}
				<View className="flex-row flex-wrap justify-center mt-2">
					{profile.fields
						?.filter(field => field.name)
						.map((field, index) => (
							<TouchableOpacity
								key={index}
								className="bg-gray-800 rounded-full px-4 py-2 m-1"
							>
								<Text className="text-white font-medium text-sm">
									{field.name}
								</Text>
							</TouchableOpacity>
						))}
				</View>
			</View>
		</View>
	);
};

const StatItem = ({ count, label }: { count: number; label: string }) => (
	<View className="items-center space-x-2 mt-4">
		<Text className="text-white font-NewsCycle_Bold">{count}</Text>
		<Text className="text-gray-400 text-xs">{label}</Text>
	</View>
);

export default OwnProfileHeader;
