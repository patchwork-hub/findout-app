import { Pressable, View } from 'react-native';
import StatusHeader from '../StatusHeader/StatusHeader';
import StatusContent from '../StatusContent/StatusContent';
import StatusActionBar from '@/components/molecules/feed/StatusActionBar/StatusActionBar';
import Underline from '../../common/Underline/Underline';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useActiveFeedAction } from '@/store/feed/activeFeed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import { cn } from '@/util/helper/twutil';
import { StatusSocialCounts } from '../StatusSocialCounts/StatusSocialCounts';
import { useTranslation } from 'react-i18next';
import { QuotePlaceholderIcon } from '@/util/svg/icon.status_actions';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';
import { useMemo } from 'react';
import { getQuoteInlineInfo } from '@/util/helper/helper';

const FeedDetailStatus = ({ feedDetail }: { feedDetail: Patchwork.Status }) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { setActiveFeed } = useActiveFeedAction();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

	const handleOnPress = (status: Patchwork.Status) => {
		setActiveFeed(status);
		navigation.push('FeedDetail', { id: status.id });
	};

	const content = feedDetail?.quote?.quoted_status?.content;
	const { acct, displayText } = useMemo(
		() => getQuoteInlineInfo(content ?? '', t),
		[content, t],
	);

	return (
		<View>
			<View
				className={cn(
					`m-4 mb-2 rounded-md ${
						feedDetail.visibility === 'direct'
							? 'border-l-4 border-l-patchwork-primary pl-2 ml-1 bg-patchwork-primary/10 pt-3 pb-1 pr-2 mr-2'
							: ''
					} ${
						!!feedDetail.in_reply_to_id
							? 'bg-patchwork-primary/10 rounded-lg px-4 pt-3 pb-2 mx-0 mt-0'
							: ''
					}`,
				)}
			>
				<StatusHeader status={feedDetail} imageSize="w-8 h-8" showAvatarIcon />
				<StatusContent status={feedDetail} className="mt-2" />

				{feedDetail?.quote?.quoted_status &&
					feedDetail.quote.quoted_status !== null && (
						<Pressable
							className="border w-full border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-xl"
							onPress={() => {
								const quotedStatus = feedDetail?.quote?.quoted_status;
								if (quotedStatus) {
									handleOnPress(quotedStatus);
								}
							}}
						>
							<StatusHeader
								status={feedDetail.quote.quoted_status}
								showAvatarIcon
								isQuoteView
							/>
							<StatusContent
								status={feedDetail.quote.quoted_status}
								isReposting
							/>
							{acct && (
								<Pressable
									onPress={() => {
										const quotedStatus = feedDetail?.quote?.quoted_status;
										if (quotedStatus) {
											handleOnPress(quotedStatus);
										}
									}}
								>
									<View className="flex-row items-center mb-2 p-3 bg-patchwork-primary/10 mt-2 rounded">
										<QuotePlaceholderIcon
											colorScheme={colorScheme}
											width={30}
											height={30}
											fill={customColor['patchwork-primary']}
										/>
										<ThemeText className="text-xs font-NewsCycle_Bold opacity-75 ml-2 flex-1">
											{displayText}
										</ThemeText>
									</View>
								</Pressable>
							)}
						</Pressable>
					)}
				<StatusSocialCounts status={feedDetail} />
				<StatusActionBar status={feedDetail} />
			</View>
			<Underline />
			<View className="ml-4 mt-2 pb-2">
				<ThemeText className="font-NewsCycle_Bold ml-4 my-2">
					{t('replies')}
				</ThemeText>
			</View>
		</View>
	);
};

export default FeedDetailStatus;
