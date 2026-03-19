import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import AccountName from '@/components/atoms/profile/AccountName/AccountName';
import Bio from '@/components/atoms/profile/Bio/Bio';
import UserName from '@/components/atoms/profile/UserName/UserName';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import HandleInfoBottomSheet from '@/components/atoms/profile/HandleInfoBottomSheet/HandleInfoBottomSheet';
import { useSelectedDomain } from '@/store/feed/activeDomain';

type UserAccountInfoProps = {
	accountName: string;
	username: string;
	joinedDate?: string;
	userBio: string;
	userBioTextStyle?: string;
	hasRedMark?: boolean;
	acctNameTextStyle?: string;
	emojis?: Patchwork.Emoji[];
	userRoles?: Patchwork.Role[] | undefined;
	locked?: boolean;
};

const UserAccountInfo = ({
	accountName,
	username,
	joinedDate,
	userBio,
	userBioTextStyle,
	hasRedMark,
	acctNameTextStyle,
	emojis,
	userRoles,
	locked,
}: UserAccountInfoProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const handlePress = useCallback(() => {
		bottomSheetRef.current?.present();
	}, []);
	const domain = useSelectedDomain();

	return (
		<View className="flex-1 flex-col px-4">
			<AccountName
				{...{
					accountName,
					acctNameTextStyle,
					hasRedMark,
					emojis,
					userRoles,
					locked,
				}}
				onPress={handlePress}
			/>
			<UserName {...{ username, joinedDate }} onPress={handlePress} />
			{userBio && <Bio {...{ userBio, userBioTextStyle, emojis }} />}
			<HandleInfoBottomSheet
				ref={bottomSheetRef}
				username={username}
				domain={domain ?? ''}
				joinedDate={joinedDate}
			/>
		</View>
	);
};

export default UserAccountInfo;
