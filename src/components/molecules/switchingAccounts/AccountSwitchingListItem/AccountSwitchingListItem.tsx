import { memo } from 'react';
import { Pressable, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { RadioButtonIcon } from '@/util/svg/icon.common';
import { removeHttps } from '@/util/helper/helper';
import { AuthState } from '@/util/storage';
import customColor from '@/util/constant/color';
import Image from '@/components/atoms/common/Image/Image';

type Props = {
	account: AuthState;
	activeAccId?: string;
	isEditMode: boolean;
	isHydrating: boolean;
	onSwitch: (acc: AuthState) => void;
	onRemove: (accId: string) => void;
};

const AccountSwitchingListItem = ({
	account,
	activeAccId,
	isEditMode,
	isHydrating,
	onSwitch,
	onRemove,
}: Props) => {
	const { avatar, displayName, username } = account.userInfo || {};
	const accId = `${username}@${removeHttps(account.domain)}`;
	const isActive = accId === activeAccId;

	const handlePress = () => {
		if (!isEditMode && !isHydrating && !isActive) onSwitch(account);
	};

	return (
		<Pressable
			className="flex-row items-center justify-between p-4 rounded-lg active:bg-slate-200 dark:active:bg-gray-600/50"
			style={{ flexDirection: 'row', alignItems: 'center' }}
			disabled={activeAccId === accId || isHydrating || isEditMode}
			onPress={handlePress}
		>
			<View className="mr-3">
				{avatar ? (
					<Image
						source={{ uri: avatar }}
						className="w-10 h-10 rounded-full"
						resizeMode="cover"
						iconSize={40}
					/>
				) : (
					<View className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
						<ThemeText size="sm_14">?</ThemeText>
					</View>
				)}
			</View>
			<View className="flex-1">
				<ThemeText className="">
					{displayName ? displayName : username}
				</ThemeText>
				<ThemeText size="fs_13" className="text-gray-500 dark:text-gray-400">
					{accId}
				</ThemeText>
			</View>
			{isEditMode ? (
				activeAccId === accId ? (
					<View className="px-3 py-1 bg-slate-100 dark:bg-gray-800 active:opacity-70 rounded-xl">
						<ThemeText className="text-patchwork-primary-dark">
							Active
						</ThemeText>
					</View>
				) : (
					<Pressable
						className="px-3 py-1 bg-slate-100 dark:bg-gray-800 active:opacity-70 rounded-xl"
						onPress={() => onRemove(accId)}
					>
						<ThemeText className="text-patchwork-grey-70 dark:text-patchwork-light-100">
							Remove
						</ThemeText>
					</Pressable>
				)
			) : (
				<RadioButtonIcon
					isSelected={accId === activeAccId}
					color={customColor['patchwork-primary']}
				/>
			)}
		</Pressable>
	);
};

export default memo(AccountSwitchingListItem);
