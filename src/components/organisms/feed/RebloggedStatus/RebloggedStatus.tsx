import { Pressable, View } from 'react-native';
import StatusHeader from '@/components/atoms/feed/StatusHeader/StatusHeader';
import StatusContent from '@/components/atoms/feed/StatusContent/StatusContent';
import Underline from '@/components/atoms/common/Underline/Underline';
import StatusActionBar from '@/components/molecules/feed/StatusActionBar/StatusActionBar';
import { useActiveFeedAction } from '@/store/feed/activeFeed';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { useStatusContext } from '@/context/statusItemContext/statusItemContext';
import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import customColor from '@/util/constant/color';

const RebloggedStatus = ({
	status,
	isFromNoti,
	reblogStatus,
}: {
	status: Patchwork.Status;
	reblogStatus: Patchwork.Status;
	isFromNoti?: boolean;
}) => {
	const { t, i18n } = useTranslation();
	const isBurmese = i18n.language === 'my';
	const burmeseLineHeight = 32;

	const { setActiveFeed, setFeedDetailExtraPayload } = useActiveFeedAction();
	const { extraPayload } = useStatusContext();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

	const handleOnPressStatus = (status: Patchwork.Status) => {
		setActiveFeed(status.reblog ? status.reblog : status);
		if (extraPayload?.profileSource && extraPayload.profileFeedQueryId) {
			setFeedDetailExtraPayload({
				comeFrom: extraPayload.profileSource == 'own' ? 'profile' : 'other',
				carriedPayload: {
					profileFeedQueryId: extraPayload.profileFeedQueryId,
				},
			});
		}
		navigation.push('FeedDetail', {
			id: status.reblog ? status.reblog.id : status.id,
		});
	};

	if (!status?.account) {
		return null;
	}

	return (
		<View>
			<View className="m-4">
				{/* <View className="flex-row">
					<Pressable disabled>
						<Image
							uri={status.account.avatar}
							className="w-[33] h-[33] rounded-full bg-slate-300"
						/>
					</Pressable>
					<Pressable
						className="ml-2 flex-1"
						onPress={() => handleOnPressStatus(status)}
					>
						<StatusHeader status={status} />
						<StatusContent status={status} />
					</Pressable>
				</View> */}
				{status.reblog && (
					<Pressable
						className=" dark:border-patchwork-grey-70 rounded-xl"
						onPress={() => {
							handleOnPressStatus(status.reblog!);
						}}
					>
						<View className="flex-row items-center mb-3">
							<FontAwesomeIcon
								icon={AppIcons.share}
								size={17}
								color={customColor['patchwork-grey-400']}
							/>
							<ThemeText
								variant={'textGrey'}
								emojis={status.account.emojis}
								className="text-xs ml-3"
								style={isBurmese ? { lineHeight: burmeseLineHeight } : {}}
							>
								{status.account.display_name || status.account?.username}{' '}
								{t('timeline.boosted')}
							</ThemeText>
						</View>

						<View className="flex-row mb-1 justify-between items-center">
							<Pressable className="mr-1">
								<Image
									source={{ uri: reblogStatus.account.avatar }}
									className="w-[36] h-[36] rounded-full opacity-90"
								/>
								<Image
									source={{ uri: status.account.avatar }}
									className="w-[22] h-[22] rounded-full absolute top-4 left-5  border-patchwork-grey-50 border"
									iconSize={20}
								/>
							</Pressable>
							<View className="flex-1 ml-2">
								<StatusHeader status={reblogStatus} isFromNoti={isFromNoti} />
							</View>
						</View>

						<View className="ml-12">
							<StatusContent status={reblogStatus} />
						</View>
					</Pressable>
				)}
				<View className="ml-12">
					<StatusActionBar status={reblogStatus} isFromNoti={isFromNoti} />
				</View>
			</View>
			<Underline />
		</View>
	);
};

export default RebloggedStatus;
