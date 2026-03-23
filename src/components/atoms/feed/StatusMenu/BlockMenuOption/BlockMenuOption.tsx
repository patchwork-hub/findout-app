import React from 'react';
import { Platform, View } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';
import MenuOptionIcon from '../MenuOptionIcon/MenuOptionIcon';
import { useBlockUnBlockUserMutation } from '@/hooks/mutations/feed.mutation';
import Toast from 'react-native-toast-message';
import { updateBlockCache } from '@/util/cache/feed/feedCache';
import { Flow } from 'react-native-animated-spinkit';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import customColor from '@/util/constant/color';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

const BlockMenuOption = ({
	status,
	specifyServerAccId,
	relationships,
	hideMenu,
	extraPayload,
	statusType,
	goBackToPreviousPage,
	handleGoBack,
}: {
	status: Patchwork.Status;
	specifyServerAccId: Patchwork.Account['id'];
	relationships: Patchwork.RelationShip[] | undefined;
	hideMenu: () => void;
	extraPayload: Record<string, any> | undefined;
	statusType: string;
	goBackToPreviousPage: boolean;
	handleGoBack: () => void;
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { mutate, isPending } = useBlockUnBlockUserMutation({
		onSuccess: () => {
			updateBlockCache(status);
			const actionText = `${
				status?.account?.display_name ?? status.account.username
			} has been blocked.`;

			Toast.show({
				type: 'successToast',
				text1: actionText,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			hideMenu();
			if (goBackToPreviousPage) {
				handleGoBack();
			}
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			hideMenu();
		},
	});

	const onMakeBlockUnBlockUser = () => {
		mutate({
			accountId:
				statusType === 'channel-feed'
					? status.account?.id!
					: specifyServerAccId,
			toBlock: true,
		});
	};

	const blockMenuDisabled = isPending;

	return (
		<MenuOption
			onSelect={onMakeBlockUnBlockUser}
			disableTouchable={blockMenuDisabled}
		>
			<View className="flex-row items-center">
				<View className="w-9 h-9 items-center justify-center mr-1">
					<FontAwesomeIcon
						icon={AppIcons.block}
						size={18}
						color={
							colorScheme == 'dark' ? '#fff' : customColor['patchwork-grey-100']
						}
					/>
				</View>
				{isPending ? (
					<Flow
						size={25}
						color={
							colorScheme == 'dark'
								? 'white'
								: customColor['patchwork-grey-100']
						}
					/>
				) : (
					<ThemeText
						size={'sm_14'}
						variant={blockMenuDisabled ? 'textGrey' : 'default'}
						className="font-Inter_Regular text-black dark:text-white flex-1 flex-shrink"
						numberOfLines={2}
					>
						{t('timeline.block')}
					</ThemeText>
				)}
			</View>
		</MenuOption>
	);
};

export default BlockMenuOption;
