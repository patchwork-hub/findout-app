import { Pressable, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { cn } from '@/util/helper/twutil';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import moment from 'moment';
import { useColorScheme } from 'nativewind';
import { VerifyIcon } from '@/util/svg/icon.conversations';
import { useAuthStore } from '@/store/auth/authStore';
import { appendInstance } from '@/util/helper/appendInstance';
import { getInstanceName } from '@/util/helper/getInstanceName';
import Image from '@/components/atoms/common/Image/Image';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { useMemo } from 'react';

type Props = {
	userInfo: Patchwork.Account;
	isAccountVerified: boolean;
};

const ProfileInfo = ({ userInfo, isAccountVerified }: Props) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const { colorScheme } = useColorScheme();
	const { userOriginInstance } = useAuthStore();
	const defaultInstance = getInstanceName(userOriginInstance);

	const platformIcon = useMemo(() => {
		const domain =
			userInfo?.domain?.toLowerCase() || userInfo?.acct?.toLowerCase();
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
	}, [userInfo?.domain, userInfo?.acct]);

	const handleAvatarPress = () => {
		navigation.navigate('ProfileOther', {
			id: userInfo?.id,
		});
	};

	return (
		<View className="mt-20">
			<Pressable
				className={cn(
					'w-[80] h-[80] mt-[-50] bg-slate-100 rounded-full mx-auto',
				)}
				onPress={handleAvatarPress}
			>
				<Image
					className={cn(
						'w-[80] h-[80] border-patchwork-grey-50 border rounded-full',
					)}
					resizeMode={FastImage.resizeMode.contain}
					uri={userInfo?.avatar}
					iconSize={78}
				/>
			</Pressable>
			<View className="mx-auto items-center px-5">
				<View className="flex-row my-3 items-center mb-0">
					<ThemeText
						emojis={userInfo.emojis}
						className="font-NewsCycle_Bold text-lg mr-3"
					>
						{userInfo?.display_name || userInfo.username}
					</ThemeText>
					{isAccountVerified && <VerifyIcon colorScheme={colorScheme} />}
					{platformIcon && (
						<View className="ml-1.5 justify-center">
							<FontAwesomeIcon
								icon={platformIcon.icon}
								size={15}
								color={
									platformIcon.type === 'bluesky'
										? '#0F73FF'
										: colorScheme === 'dark'
										? '#fff'
										: '#000'
								}
							/>
						</View>
					)}
				</View>
				<View className="flex-row items-center mb-1 flex-wrap justify-center">
					<ThemeText>
						{appendInstance(`@${userInfo?.acct}`, defaultInstance)}
					</ThemeText>
					<ThemeText className="text-2xl align-middle mx-2">▸</ThemeText>
					<ThemeText className="">
						{t('joined_on', {
							date: moment(userInfo?.created_at).format('MM YYYY'),
						})}
					</ThemeText>
				</View>
			</View>
			<View className="bg-patchwork-light-100 dark:bg-patchwork-dark-400 rounded-xl mr-4 items-center px-4 py-4 ml-4 mt-2 mb-10">
				<ThemeText className="mb-1 font-NewsCycle_Bold">
					{t('conversation.not_end_to_end_encrypted')}
				</ThemeText>
				<ThemeText className="text-center">
					{t('conversation.unencrypted_detail')}
				</ThemeText>
			</View>
		</View>
	);
};

export default ProfileInfo;
