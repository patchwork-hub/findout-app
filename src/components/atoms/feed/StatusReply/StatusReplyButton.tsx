import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { safeUseComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useStatusContext } from '@/context/statusItemContext/statusItemContext';
import {
	useStatusReplyAction,
	useStatusReplyStore,
} from '@/store/compose/statusReply/statusReplyStore';
import { useActiveFeedAction } from '@/store/feed/activeFeed';
import { HomeStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { getComeFromByPage } from '@/util/helper/feed';
import { formatNumber } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { AppIcons } from '@/util/icons/icon.common';
import { StatusReplyIcon } from '@/util/svg/icon.status_actions';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';
import { Pressable, ViewProps } from 'react-native';

type Props = {
	count: number;
	status: Patchwork.Status;
} & ViewProps;

const StatusReplyButton = ({ count, status, ...props }: Props) => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { textInputRef, currentFocusStatus } = useStatusReplyStore();
	const { setActiveFeed, setFeedDetailExtraPayload } = useActiveFeedAction();
	const composeStatus = safeUseComposeStatus();
	const { changeCurrentStatus } = useStatusReplyAction();
	const { currentPage, extraPayload } = useStatusContext();
	const { colorScheme } = useColorScheme();

	const handlePress = () => {
		if (currentPage !== 'FeedDetail') {
			setActiveFeed(status.reblog ? status.reblog : status);

			const comeFrom = getComeFromByPage(currentPage);
			if (comeFrom) {
				setFeedDetailExtraPayload({
					comeFrom,
					carriedPayload: extraPayload,
				});
			}

			return navigation.push('FeedDetail', {
				id: status.reblog ? status.reblog.id : status.id,
				openKeyboardAtMount: true,
			});
		}
		openKeyboardAndChangeReplyId();
	};

	const openKeyboardAndChangeReplyId = () => {
		if (composeStatus) {
			composeStatus.composeDispatch({
				type: 'reply_id_change',
				payload: status.id,
			});
			// composeStatus.composeDispatch({
			// 	type: 'text',
			// 	payload: {
			// 		count: status.account.acct.length,
			// 		raw: '@' + status.account.acct + ' ',
			// 	},
			// });
			// composeStatus.composeDispatch({
			// 	type: 'disableUserSuggestionsModal',
			// 	payload: true,
			// });
		}

		changeCurrentStatus(status);
		return textInputRef?.current?.focus();
	};

	return (
		<Pressable
			className={cn('flex flex-row items-center gap-1 active:opacity-80')}
			onPress={handlePress}
			{...props}
		>
			<StatusReplyIcon
				fill={
					currentFocusStatus &&
					currentPage == 'FeedDetail' &&
					currentFocusStatus.id == status.id &&
					colorScheme == 'dark'
						? customColor['patchwork-soft-primary']
						: currentFocusStatus &&
						  currentPage == 'FeedDetail' &&
						  currentFocusStatus.id == status.id &&
						  colorScheme == 'light'
						? customColor['patchwork-primary']
						: colorScheme == 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
			<ThemeText variant="textGrey">{formatNumber(count)}</ThemeText>
		</Pressable>
	);
};

export default StatusReplyButton;
