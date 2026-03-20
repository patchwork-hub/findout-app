import { Platform, View } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';
import MenuOptionIcon from '../MenuOptionIcon/MenuOptionIcon';
import { useMuteUnmuteUserMutation } from '@/hooks/mutations/feed.mutation';
import Toast from 'react-native-toast-message';
import { updateMuteCache } from '@/util/cache/feed/feedCache';
import { Flow } from 'react-native-animated-spinkit';
import { useColorScheme } from 'nativewind';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import customColor from '@/util/constant/color';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

const MuteMenuOption = ({
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
	const { domain_name } = useActiveDomainStore();
	const { colorScheme } = useColorScheme();

	const { mutate, isPending } = useMuteUnmuteUserMutation({
		onSuccess: () => {
			updateMuteCache(status);

			const actionText = t('timeline.muted_message', {
				name: status?.account?.display_name ?? status.account.username,
			});

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

	const onMakeMuteUnmuteUser = () => {
		mutate({
			accountId:
				statusType === 'channel-feed'
					? status.account?.id!
					: specifyServerAccId,
			toMute: true,
		});
	};

	return (
		<MenuOption onSelect={onMakeMuteUnmuteUser} disableTouchable={isPending}>
			<View className="flex-row items-center">
				<View className="w-9 h-9 items-center mr-1 justify-center">
					<FontAwesomeIcon
						icon={AppIcons.mute}
						size={18}
						color={
							colorScheme == 'dark' ? '#fff' : customColor['patchwork-grey-100']
						}
					/>
				</View>
				{isPending ? (
					<Flow size={25} color={colorScheme === 'dark' ? 'white' : '#000'} />
				) : (
					<ThemeText
						size={'sm_14'}
						variant={isPending ? 'textGrey' : 'default'}
						className="font-Inter_Regular text-black dark:text-white flex-1 flex-shrink"
						numberOfLines={2}
					>
						{t('timeline.mute')}
					</ThemeText>
				)}
			</View>
		</MenuOption>
	);
};

export default MuteMenuOption;
