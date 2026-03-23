import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import StatusHeader from '@/components/atoms/feed/StatusHeader/StatusHeader';
import StatusActionBar from '@/components/molecules/feed/StatusActionBar/StatusActionBar';
import {
	StatusBlockIcon,
	StatusMuteIcon,
	QuotePlaceholderIcon,
	RemoveCrossIcon,
} from '@/util/svg/icon.status_actions';
import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import { useAuthStore } from '@/store/auth/authStore';
import { Image } from 'react-native';
import { cn } from '@/util/helper/twutil';
import Underline from '@/components/atoms/common/Underline/Underline';
import StatusContent from '@/components/atoms/feed/StatusContent/StatusContent';
import { useTranslation } from 'react-i18next';
import { toggleForceShowHiddenQuoteCache } from '@/util/cache/feed/feedCache';
import customColor from '@/util/constant/color';
import { StatusSocialCounts } from '@/components/atoms/feed/StatusSocialCounts/StatusSocialCounts';
import { useColorScheme } from 'nativewind';

const shouldHidePost = [
	'blocked_account',
	'blocked_domain',
	'muted_account',
	'unauthorized',
	'rejected',
	'revoked',
	'deleted',
	'pending',
];

interface QuotePlaceholderProps {
	state: Patchwork.QuoteState | undefined;
	url?: string;
	status?: Patchwork.Status;
	isFromNoti?: boolean;
	isFromCompose?: boolean;
	isFeedDetail?: boolean;
}

const QuotePlaceholder = ({
	state,
	url,
	status,
	isFromNoti,
	isFromCompose,
	isFeedDetail,
}: QuotePlaceholderProps) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { userInfo } = useAuthStore();

	const handleToggleHiddenQuote = (value: boolean) => {
		if (status) {
			toggleForceShowHiddenQuoteCache(status, value);
		}
	};

	const isAuthor = useMemo(() => {
		return userInfo?.id === status?.account?.id;
	}, [status, userInfo]);

	let message = '';

	let Icon = QuotePlaceholderIcon;
	switch (state) {
		case 'pending':
			message = status?.quote?.quoted_status?.account
				? t('quote.pending_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.pending');
			break;
		case 'rejected':
			message = status?.quote?.quoted_status?.account
				? t('quote.rejected_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.rejected');
			break;
		case 'revoked':
			message = status?.quote?.quoted_status?.account
				? t('quote.revoked_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.revoked');
			break;
		case 'deleted':
			message = status?.quote?.quoted_status?.account
				? t('quote.deleted_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.deleted');
			Icon = RemoveCrossIcon;
			break;
		case 'unauthorized':
			message = status?.quote?.quoted_status?.account
				? t('quote.unauthorized_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.unauthorized');
			break;
		case 'blocked_account':
			message = status?.quote?.quoted_status?.account
				? t('quote.blocked_account_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.blocked_account');
			Icon = StatusBlockIcon;
			break;
		case 'blocked_domain':
			message = status?.quote?.quoted_status?.account
				? t('quote.blocked_domain_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.blocked_domain');
			Icon = StatusBlockIcon;
			break;
		case 'muted_account':
			message = status?.quote?.quoted_status?.account
				? t('quote.muted_account_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.muted_account');
			Icon = StatusMuteIcon;
			break;
		default:
			message = status?.quote?.quoted_status?.account
				? t('quote.unavailable_with_acct', {
						acct: status.quote.quoted_status.account.acct,
				  })
				: t('quote.unavailable');
	}

	return (
		<View>
			<View
				className={cn(
					`${
						isFromCompose
							? 'border flex-1 border-slate-200 dark:border-patchwork-grey-70 my-2 p-3 rounded-xl'
							: 'm-4 mb-1 rounded-md'
					}`,
				)}
			>
				<View className="flex-row">
					{status && (
						<Pressable
							onPress={() => {
								isAuthor
									? navigation.navigate('Profile', { id: status.account.id })
									: navigation.navigate('ProfileOther', {
											id: status.account.id,
											isFromNoti: isFromNoti,
									  });
							}}
						>
							<Image
								source={{ uri: status.account.avatar }}
								className="w-[35] h-[35] mt-[1] rounded-full"
							/>
						</Pressable>
					)}
					<View className="ml-2 flex-1">
						{status && (
							<>
								<StatusHeader
									status={status}
									isFromNoti={isFromNoti}
									isFromQuoteCompose={isFromCompose}
								/>
								<View className={`${isFeedDetail ? '-ml-8' : ''}`}>
									<StatusContent status={status} />
								</View>
							</>
						)}
					</View>
				</View>
				{status?.quote?.quoted_status ? (
					<View className="ml-8 mt-3">
						{!shouldHidePost.includes(status.quote.state) ||
						status.custom?.forceShowHiddenQuote ? (
							<View className="border flex-1 border-slate-200 dark:border-patchwork-grey-70 p-3 rounded-xl">
								<StatusHeader
									status={status.quote.quoted_status}
									isFromNoti={isFromNoti}
									isFromQuoteCompose={isFromCompose}
									showAvatarIcon
									isQuoteView
								/>
								<StatusContent status={status.quote.quoted_status} />

								<Pressable
									onPress={() => handleToggleHiddenQuote(false)}
									className="bg-patchwork-primary dark:bg-patchwork-primary-dark px-3 py-1.5 rounded-lg active:scale-95 active:opacity-80 self-end mt-3"
								>
									<ThemeText className="text-white text-xs font-semibold">
										{t('compose.hide_post')}
									</ThemeText>
								</Pressable>
							</View>
						) : (
							<View className="bg-patchwork-primary/10 p-3 rounded-lg">
								<View className="flex-row items-center mb-3">
									{state === 'deleted' ? (
										<RemoveCrossIcon
											width={22}
											height={22}
											style={{ marginRight: 6 }}
											fill={
												colorScheme == 'dark'
													? '#fff'
													: customColor['patchwork-primary']
											}
										/>
									) : state === 'blocked_account' ||
									  state === 'blocked_domain' ? (
										<StatusBlockIcon
											colorScheme={colorScheme}
											width={22}
											height={22}
											style={{ marginRight: 6 }}
											stroke={
												colorScheme == 'dark'
													? '#fff'
													: customColor['patchwork-primary']
											}
										/>
									) : state === 'muted_account' ? (
										<StatusMuteIcon
											colorScheme={colorScheme}
											width={22}
											height={22}
											style={{ marginRight: 6 }}
											stroke={
												colorScheme == 'dark'
													? '#fff'
													: customColor['patchwork-primary']
											}
										/>
									) : (
										<QuotePlaceholderIcon
											colorScheme={colorScheme}
											width={22}
											height={22}
											style={{ marginRight: 6 }}
											fill={
												colorScheme == 'dark'
													? '#fff'
													: customColor['patchwork-primary']
											}
										/>
									)}
									<ThemeText
										className={
											'text-xs font-semibold text-patchwork-grey-100 dark:text-patchwork-grey-400 ml-1 flex-1'
										}
									>
										{message}
									</ThemeText>
								</View>
								<Pressable
									onPress={() => handleToggleHiddenQuote(true)}
									className="self-start ml-8 bg-patchwork-primary dark:bg-patchwork-primary-dark px-3 py-1.5 rounded-lg active:scale-95 active:opacity-80"
								>
									<ThemeText className="text-white text-xs font-bold">
										{t('compose.show_content')}
									</ThemeText>
								</Pressable>
							</View>
						)}
					</View>
				) : status?.quote && shouldHidePost.includes(status.quote.state) ? (
					<View className={`${isFeedDetail ? 'mx-1 mt-2' : 'ml-8 mt-3'}`}>
						<View className="flex-row items-center bg-patchwork-primary/10 px-3 py-2 ml-3 rounded-lg">
							{state === 'deleted' ? (
								<RemoveCrossIcon
									width={22}
									height={22}
									style={{ marginRight: 6 }}
									fill={
										colorScheme == 'dark'
											? '#fff'
											: customColor['patchwork-primary']
									}
								/>
							) : state === 'blocked_account' || state === 'blocked_domain' ? (
								<StatusBlockIcon
									colorScheme={colorScheme}
									width={22}
									height={22}
									style={{ marginRight: 6 }}
									stroke={
										colorScheme == 'dark'
											? '#fff'
											: customColor['patchwork-primary']
									}
								/>
							) : state === 'muted_account' ? (
								<StatusMuteIcon
									colorScheme={colorScheme}
									width={22}
									height={22}
									style={{ marginRight: 6 }}
									stroke={
										colorScheme == 'dark'
											? '#fff'
											: customColor['patchwork-primary']
									}
								/>
							) : (
								<QuotePlaceholderIcon
									colorScheme={colorScheme}
									width={22}
									height={22}
									style={{ marginRight: 6 }}
									fill={
										colorScheme == 'dark'
											? '#fff'
											: customColor['patchwork-primary']
									}
								/>
							)}

							<ThemeText
								className={
									'text-xs font-semibold text-patchwork-grey-100 dark:text-patchwork-grey-400 flex-1'
								}
							>
								{message || 'Quoted post is unavailable.'}
							</ThemeText>
						</View>
					</View>
				) : null}
				{status && !isFromCompose && (
					<View className={`${isFeedDetail ? 'mx-2 mt-2' : 'ml-12 mt-2 mb-3'}`}>
						{!isFromNoti && isFeedDetail && (
							<StatusSocialCounts status={status} />
						)}
						<StatusActionBar status={status} isFromNoti={isFromNoti} />
					</View>
				)}
			</View>
			{!isFromCompose && <Underline />}
			{isFeedDetail && (
				<ThemeText className="font-semibold ml-4 my-2">
					{t('replies')}
				</ThemeText>
			)}
		</View>
	);
};

export default QuotePlaceholder;
