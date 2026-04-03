import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { HomeStackParamList } from '@/types/navigation';
import {
	checkIsAccountVerified,
	formatFollowersCount,
} from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Image from '@/components/atoms/common/Image/Image';
import { ProfileNameRedMark } from '@/util/svg/icon.profile';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '@/store/auth/authStore';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';

interface Props {
	item: Patchwork.Account;
}

const UserListItem = ({ item }: Props) => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { colorScheme } = useColorScheme();
	const { userInfo } = useAuthStore();
	const isAuthor = useMemo(() => {
		return userInfo?.id === item.id;
	}, [item.id, userInfo?.id]);

	const isAccVerified = useMemo(() => {
		return checkIsAccountVerified(item.fields);
	}, [item.fields]);

	const platformIcon = useMemo(() => {
		const domain = item.domain?.toLowerCase() || item.acct?.toLowerCase();
		if (
			domain?.includes('bsky.social') ||
			domain?.includes('bluesky') ||
			domain?.includes('bsky.brid.gy')
		) {
			return { icon: AppIcons.bluesky, type: 'bluesky' };
		}
		if (domain?.includes('threads.net') || domain?.includes('threads')) {
			return { icon: AppIcons.threads, type: 'threads' };
		}
		return null;
	}, [item.domain, item.acct]);

	return (
		<Pressable
			hitSlop={{ left: 16, right: 16, top: 8, bottom: 8 }}
			className="flex-row px-3 py-3"
			onPress={() => {
				isAuthor
					? navigation.navigate('Profile', { id: item.id })
					: navigation.push('ProfileOther', {
							id: item.id,
					  });
			}}
		>
			<View className="flex-row items-center justify-between gap-3 flex-1">
				<View className="flex-row flex-shrink">
					<Image
						className={cn(
							'w-10 h-10 border-patchwork-grey-400 border rounded-full',
						)}
						uri={item.avatar}
					/>
					<View className="ml-3 flex-shrink max-w-[280]">
						<View className="flex-row flex-wrap items-center">
							<ThemeText
								emojis={item.emojis}
								numberOfLines={1}
								className="flex-shrink mr-1"
							>
								{item.display_name ? item.display_name : '@' + item.username}
							</ThemeText>
							<ThemeText variant={'textGrey'}>
								{item.display_name ? '@' + item.username : ''}
							</ThemeText>
							{isAccVerified && (
								<ProfileNameRedMark
									style={{ flexShrink: 0 }}
									className="ml-2 mb-[2]"
									colorScheme={colorScheme}
								/>
							)}
							{platformIcon && (
								<View
									className={`ml-1.5 mb-[1] justify-center items-center aspect-square p-1.5 rounded-full ${
										platformIcon.type === 'bluesky'
											? 'bg-blue-50 dark:bg-blue-950/30'
											: 'bg-slate-200 dark:bg-neutral-800'
									}`}
								>
									<FontAwesomeIcon
										icon={platformIcon.icon}
										size={13}
										color={
											platformIcon.type === 'bluesky'
												? '#0085ff'
												: colorScheme === 'dark'
												? '#fff'
												: '#000'
										}
									/>
								</View>
							)}
						</View>
						<ThemeText variant={'textGrey'}>
							{formatFollowersCount(item.followers_count)} follower
							{item.followers_count > 0 ? 's' : ''}
						</ThemeText>
					</View>
				</View>
			</View>
		</Pressable>
	);
};

export default UserListItem;
