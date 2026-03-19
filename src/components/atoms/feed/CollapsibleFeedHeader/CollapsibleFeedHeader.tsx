import { Platform, Pressable, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useCurrentTabScrollY } from 'react-native-collapsible-tab-view';
import { cn } from '@/util/helper/twutil';
import { Button } from '../../common/Button/Button';
import VerticalInfo from '@/components/molecules/account/UserAccountInfo/UserAccountInfo';
import dayjs from 'dayjs';
import Animated, { useAnimatedReaction } from 'react-native-reanimated';
import { useSharedScrollY } from '@/context/sharedScrollContext/sharedScroll.context';
import UserStats from '@/components/molecules/profile/UserStats/UserStats';
import Underline from '../../common/Underline/Underline';
import { useNavigation } from '@react-navigation/native';
import {
	useUpdateAccNoti,
	useUserRelationshipMutation,
} from '@/hooks/mutations/profile.mutation';
import { createRelationshipQueryKey } from '@/hooks/queries/profile.queries';
import { queryClient } from '@/App';
import { CircleFade, Flow, Pulse } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import {
	AccountInfoQueryKey,
	GetSuggestedPeopleQueryKey,
} from '@/types/queries/profile.type';
import { useAuthStore } from '@/store/auth/authStore';
import { FavStarIcon, UnfavStarIcon } from '@/util/svg/icon.profile';
import { useColorScheme } from 'nativewind';
import { useGetConversationByUserId } from '@/hooks/queries/conversations.queries';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import {
	useBlockUnBlockUserMutation,
	useMuteUnmuteUserMutation,
} from '@/hooks/queries/feed.queries';
import {
	updateBlockState,
	updateMuteState,
} from '@/util/cache/statusActions/muteblockCache';
import AccountShield from '@/components/organisms/profile/AccountShield/AccountShield';
import {
	CHANNEL_INSTANCE,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import { checkIsAccountVerified } from '@/util/helper/helper';
import { useMemo } from 'react';
import {
	useDeleteFavouriteChannelMutation,
	useFavouriteChannelMutation,
} from '@/hooks/mutations/channel.mutation';
import {
	GetChannelDetailQueryKey,
	GetFavouriteChannelListsQueryKey,
} from '@/types/queries/channel.type';
import Toast from 'react-native-toast-message';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import Image from '../../common/Image/Image';
import { useTranslation } from 'react-i18next';
import { EnableNotiBellIcon } from '@/util/svg/icon.status_actions';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import SocialSection from '@/components/molecules/profile/SocialSection/SocialSection';

type ChannelProps = {
	type: 'Channel';
	channel: Patchwork.ChannelAbout;
	channelInfo: {
		avatar_image_url: string;
		banner_image_url: string;
		channel_name: string;
		channel_admin: string;
		created_at: string;
	};
	isFavouritedChannel?: boolean;
	channelId?: string;
	isOwnChannel?: boolean;
};

type ProfileProps = {
	type: 'Profile';
	profile: Patchwork.Account;
	is_my_account?: boolean;
	relationships?: Patchwork.RelationShip[];
	myAcctId?: string;
	specifyServerAccId?: string;
	otherUserId?: string;
	isFromNoti?: boolean;
	isOwnChannelFeed?: boolean;
};

const CollapsibleFeedHeader = (props: ChannelProps | ProfileProps) => {
	const { top } = useSafeAreaInsets();
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
	const sharedScrollYOffset = useSharedScrollY('Channel');
	const scrollY = useCurrentTabScrollY();
	const { colorScheme } = useColorScheme();
	const { userInfo, userOriginInstance } = useAuthStore();

	const domain_name = useSelectedDomain();

	const isChannel = props.type == 'Channel';
	const isProfile = props.type == 'Profile';
	const acctId = isProfile && props.otherUserId;

	useAnimatedReaction(
		() => scrollY.value,
		() => (sharedScrollYOffset.value = scrollY.value),
	);

	const { data: userConversation } = useGetConversationByUserId({
		id: props.type == 'Profile' ? props.profile.id : '',
		options: {
			enabled:
				props.type == 'Profile' &&
				!props.is_my_account &&
				[
					DEFAULT_INSTANCE,
					MO_ME_INSTANCE,
					NEWSMAST_INSTANCE_V1,
					CHANNEL_INSTANCE,
				].includes(userOriginInstance),
		},
	});

	const { mutate, isPending } = useUserRelationshipMutation({
		onSuccess: (newRelationship, { accountId }) => {
			const acctInfoQueryKey: AccountInfoQueryKey = [
				'get_account_info',
				{
					id: acctId as string,
					domain_name: domain_name,
				},
			];
			const myAcctInfoQueryKey: AccountInfoQueryKey = [
				'get_account_info',
				{
					id: userInfo?.id!,
					domain_name: domain_name,
				},
			];
			const suggestedPeopleQueryKey: GetSuggestedPeopleQueryKey = [
				'suggested-people',
				{ limit: 10 },
			];
			queryClient.invalidateQueries({ queryKey: acctInfoQueryKey });
			queryClient.invalidateQueries({ queryKey: myAcctInfoQueryKey });
			queryClient.invalidateQueries({ queryKey: suggestedPeopleQueryKey });

			const relationshipQueryKey = createRelationshipQueryKey([accountId]);

			queryClient.setQueryData<Patchwork.RelationShip[]>(
				relationshipQueryKey,
				old => {
					if (!old) return [newRelationship];
					return old.map(rel =>
						rel.id === accountId ? { ...rel, ...newRelationship } : rel,
					);
				},
			);
		},
	});

	const { mutate: toggleBlock, isPending: isBlockInProgress } =
		useBlockUnBlockUserMutation({
			onSuccess: (response, { accountId }) => {
				updateBlockState(response);
				const relationshipQueryKey = createRelationshipQueryKey([accountId]);

				queryClient.setQueryData<Patchwork.RelationShip[]>(
					relationshipQueryKey,
					old => {
						if (!old) return [response];
						return old.map(rel =>
							rel.id === accountId ? { ...rel, ...response } : rel,
						);
					},
				);
			},
		});

	const { mutate: toggleMute, isPending: isMuteInProgress } =
		useMuteUnmuteUserMutation({
			onSuccess: (response, { accountId }) => {
				updateMuteState(response);
				const relationshipQueryKey = createRelationshipQueryKey([accountId]);

				queryClient.setQueryData<Patchwork.RelationShip[]>(
					relationshipQueryKey,
					old => {
						if (!old) return [response];
						return old.map(rel =>
							rel.id === accountId ? { ...rel, ...response } : rel,
						);
					},
				);
			},
		});

	const {
		mutate: favouriteChannelMutate,
		isPending: isFavouriteChannelPending,
	} = useFavouriteChannelMutation({
		onSuccess(data) {
			const channelDetailQueryKey: GetChannelDetailQueryKey = [
				'channel-detail',
				{ id: isChannel ? props.channelId ?? '' : '' },
			];
			queryClient.setQueryData<Patchwork.ChannelList>(
				channelDetailQueryKey,
				old => {
					if (!old) return;
					return {
						...old,
						attributes: {
							...old.attributes,
							favourited: !old.attributes.favourited,
						},
					};
				},
			);

			const favouriteChannelListsQueryKey: GetFavouriteChannelListsQueryKey = [
				'favourite-channel-lists',
			];
			queryClient.invalidateQueries({
				queryKey: favouriteChannelListsQueryKey,
			});

			// Toast.show({
			// 	type: 'success',
			// 	text1: data.message,
			// 	position: 'top',
			// 	topOffset: 50,
			// });
		},
		onError(error) {
			Toast.show({
				type: 'errorToast',
				text1: error.message,
				position: 'top',
				topOffset: 50,
			});
		},
	});

	const {
		mutate: deleteFavouriteChannelMutate,
		isPending: isDeleteFavouriteChannelPending,
	} = useDeleteFavouriteChannelMutation({
		onSuccess(data, variables) {
			const channelDetailQueryKey: GetChannelDetailQueryKey = [
				'channel-detail',
				{ id: isChannel ? props.channelId ?? '' : '' },
			];
			queryClient.setQueryData<Patchwork.ChannelList>(
				channelDetailQueryKey,
				old => {
					if (!old) return;
					return {
						...old,
						attributes: {
							...old.attributes,
							favourited: !old.attributes.favourited,
						},
					};
				},
			);

			const favouriteChannelListsQueryKey: GetFavouriteChannelListsQueryKey = [
				'favourite-channel-lists',
			];

			queryClient.setQueryData<Patchwork.ChannelList[]>(
				favouriteChannelListsQueryKey,
				oldList => {
					if (!oldList) return;
					return oldList.filter(item => item.attributes.slug !== variables.id);
				},
			);

			// Toast.show({
			// 	type: 'success',
			// 	text1: data.message,
			// 	position: 'top',
			// 	topOffset: 50,
			// });
		},
		onError(error) {
			Toast.show({
				type: 'errorToast',
				text1: error.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const onMakeRelationship = () => {
		if (isProfile) {
			mutate({
				accountId: props.specifyServerAccId ?? props.profile.id,
				isFollowing: props.relationships
					? props.relationships[0]?.following ||
					  props.relationships[0]?.requested
					: false,
			});
		} else {
			if (isChannel) {
				props.isFavouritedChannel
					? deleteFavouriteChannelMutate({ id: props.channelId! })
					: favouriteChannelMutate({ id: props.channelId! });
			}
		}
	};

	const { mutate: updateAccNoti, isPending: isUpdatingAccNoti } =
		useUpdateAccNoti({
			onSuccess: (newRelationship, { accountId }) => {
				const relationshipQueryKey = createRelationshipQueryKey([accountId]);

				queryClient.setQueryData<Patchwork.RelationShip[]>(
					relationshipQueryKey,
					old => {
						if (!old) return [newRelationship];
						return old.map(rel =>
							rel.id === accountId ? { ...rel, ...newRelationship } : rel,
						);
					},
				);
			},
		});

	const onToggleBlock = () => {
		if (isProfile && props.specifyServerAccId) {
			toggleBlock({
				accountId: props.specifyServerAccId,
				toBlock: props.relationships
					? !props.relationships[0]?.blocking
					: false,
			});
		}
	};

	const onToggleMute = () => {
		if (isProfile && props.specifyServerAccId) {
			toggleMute({
				accountId: props.specifyServerAccId,
				toMute: props.relationships ? !props.relationships[0]?.muting : false,
			});
		}
	};

	const displayFollowActionText = () => {
		if (isProfile) {
			if (props.relationships && props.relationships[0]?.blocking) {
				return t('common.unblock');
			} else if (props.relationships && props.relationships[0]?.muting) {
				return t('common.unmute');
			} else if (props.relationships && props.relationships[0]?.following) {
				return t('timeline.following');
			} else if (props.relationships && props.relationships[0]?.requested) {
				return t('timeline.requested');
			}
			return t('timeline.follow');
		}
	};

	const onPressPreview = (imageUrl: string) => {
		if (!imageUrl.includes('/original/missing.png')) {
			navigation.navigate('LocalImageViewer', {
				imageUrl: {
					url: imageUrl,
				},
			});
		}
	};

	const renderChannelProfileActions = () => {
		if (
			isChannel &&
			!props.isOwnChannel &&
			userOriginInstance == CHANNEL_INSTANCE
		) {
			return (
				<Button
					variant="outline"
					size="sm"
					className="rounded-full aspect-square p-5 mt-5"
					onPress={onMakeRelationship}
				>
					{isFavouriteChannelPending || isDeleteFavouriteChannelPending ? (
						<Pulse size={18} color={customColor['patchwork-light-100']} />
					) : props.isFavouritedChannel ? (
						<FavStarIcon width={30} height={30} colorScheme={colorScheme} />
					) : (
						<UnfavStarIcon colorScheme={colorScheme} />
					)}
				</Button>
			);
		}

		return null;
	};

	const renderNotificationBell = () => {
		if (props.type == 'Profile') {
			const rel = props.relationships?.[0];
			const canShow = rel && rel.following && rel.muting === false;

			if (isUpdatingAccNoti) {
				return (
					<View className="w-8 h-8 rounded-full items-center justify-center border-[1px] border-gray-500 dark:border-gray-600 ml-2 active:opacity-80 mt-5 aspect-square">
						<CircleFade
							size={18}
							color={colorScheme === 'dark' ? '#fff' : '#000'}
						/>
					</View>
				);
			}

			if (!canShow) return null;

			return rel.notifying === false ? (
				<Pressable
					onPress={() => {
						updateAccNoti({
							accountId: props.profile.id,
							notify: true,
						});
					}}
					className="w-8 h-8 rounded-full items-center justify-center border-[1px] border-gray-500 dark:border-gray-600 ml-2 active:opacity-80 mt-5 aspect-square"
				>
					<EnableNotiBellIcon colorScheme={colorScheme} />
				</Pressable>
			) : (
				<Pressable
					onPress={() => {
						updateAccNoti({
							accountId: props.profile.id,
							notify: false,
						});
					}}
					className="w-8 h-8 rounded-full items-center justify-center border-[1px] border-gray-500 dark:border-gray-600 ml-2 active:opacity-80 mt-5 aspect-square"
				>
					<FontAwesomeIcon
						icon={AppIcons.noNotification}
						color={colorScheme == 'dark' ? '#fff' : '#000'}
						size={18}
					/>
				</Pressable>
			);
		}
	};

	const renderProfileActions = () => {
		if (isProfile && props.is_my_account) {
			return (
				<Button
					variant="default"
					size="sm"
					pointerEvents="auto"
					className="bg-transparent border-slate-300 dark:border-white border rounded-3xl px-6 mt-5 z-50"
					onPress={() => navigation.navigate('EditProfile')}
				>
					<ThemeText size={'fs_13'}>{t('edit_account')}</ThemeText>
				</Button>
			);
		}

		return (
			<View>
				{isProfile && !props.isOwnChannelFeed && (
					<View className="flex-row items-center justify-center">
						{[
							DEFAULT_INSTANCE,
							MO_ME_INSTANCE,
							NEWSMAST_INSTANCE_V1,
							CHANNEL_INSTANCE,
						].includes(userOriginInstance) && renderChatIcon()}
						<Button
							variant="default"
							size="sm"
							className="bg-gray-200 dark:bg-white rounded-3xl px-6 mt-5"
							onPress={() => {
								if (props.relationships && props.relationships[0]?.blocking) {
									return onToggleBlock();
								}
								if (props.relationships && props.relationships[0]?.muting) {
									return onToggleMute();
								}
								return onMakeRelationship();
							}}
						>
							{isPending ||
							isBlockInProgress ||
							isMuteInProgress ||
							!props.relationships ? (
								<Flow size={25} color={customColor['patchwork-dark-900']} />
							) : (
								<ThemeText className="text-black" size={'fs_13'}>
									{displayFollowActionText()}
								</ThemeText>
							)}
						</Button>
						{renderNotificationBell()}
						<View className="w-8 h-8 rounded-full items-center justify-center border-[1px] border-gray-500 dark:border-gray-600 ml-2 active:opacity-80 mt-5">
							<AccountShield account={props.profile} />
						</View>
					</View>
				)}
			</View>
		);
	};

	const renderChatIcon = () => {
		return (
			<Pressable
				className="w-8 h-8 rounded-full items-center justify-center border-[1px] border-gray-600 mr-2 active:opacity-80 mt-5"
				onPress={handleChatIconPress}
			>
				<FontAwesomeIcon
					icon={AppIcons.conversationRegular}
					size={18}
					color={
						colorScheme == 'dark'
							? customColor['patchwork-light-100']
							: customColor['patchwork-dark-100']
					}
				/>
			</Pressable>
		);
	};

	const handleChatIconPress = () => {
		if (props.type == 'Profile') {
			if (userConversation?.last_status) {
				navigation.navigate('ConversationsStack', {
					screen: 'ConversationDetail',
					params: {
						id: userConversation.last_status.id,
						isFromProfile: true,
					},
				});
			} else {
				navigation.navigate('ConversationsStack', {
					screen: 'InitiateNewConversation',
					params: {
						account: props.profile,
					},
				});
			}
		}
	};

	const isAccVerified =
		props?.type === 'Profile' && props.profile
			? checkIsAccountVerified(props.profile.fields)
			: false;

	return (
		<View
			className="bg-white dark:bg-patchwork-dark-100"
			pointerEvents="box-none"
		>
			<Pressable
				pointerEvents="auto"
				onPress={() =>
					onPressPreview(
						isChannel
							? props.channelInfo?.banner_image_url
							: props.profile?.header,
					)
				}
			>
				<FastImage
					className="bg-patchwork-grey-400 dark:bg-patchwork-dark-50 h-[140]"
					source={{
						uri: isChannel
							? props.channelInfo?.banner_image_url
							: props.profile?.header,
						priority: FastImage.priority.high,
					}}
					resizeMode={FastImage.resizeMode.cover}
				/>
			</Pressable>
			<View className="flex-row mx-4" pointerEvents="auto">
				<Animated.View className="flex-1">
					<Pressable
						onPress={() =>
							onPressPreview(
								isChannel
									? props.channelInfo?.avatar_image_url
									: props.profile?.avatar,
							)
						}
						pointerEvents="auto"
					>
						<Image
							uri={
								isChannel
									? props.channelInfo?.avatar_image_url
									: props.profile?.avatar
							}
							className={cn(
								'w-[70] h-[70] mt-[-25] bg-slate-400 dark:bg-patchwork-dark-50 border-white dark:border-patchwork-dark-100 border-4',
								isChannel ? 'rounded-md' : 'rounded-full',
							)}
							iconSize={62}
						/>
					</Pressable>
				</Animated.View>
				{isProfile ? renderProfileActions() : renderChannelProfileActions()}
			</View>
			{isChannel ? (
				<>
					<VerticalInfo
						accountName={props.channelInfo.channel_name}
						username={props.channelInfo.channel_admin}
						joinedDate={dayjs(props.channelInfo.created_at).format('MMM YYYY')}
						userBio={props.channel?.description}
					/>
					<Underline className="mt-4 border-white dark:border-black" />
				</>
			) : (
				<View>
					<VerticalInfo
						hasRedMark={isAccVerified}
						accountName={
							props.profile?.display_name
								? props.profile?.display_name
								: props.profile?.username
						}
						username={props.profile?.acct}
						joinedDate={dayjs(props.profile?.created_at).format('MMM YYYY')}
						userBio={props.profile?.note}
						emojis={props.profile.emojis}
					/>
					<SocialSection
						isMyAccount={props.is_my_account}
						accountInfo={props?.profile}
					/>
					<UserStats
						posts={props.profile.statuses_count}
						following={props.profile?.following_count}
						followers={props.profile?.followers_count}
						isMainChannel={props.isFromNoti}
						accountId={props.profile?.id}
						isUserFromSameServer={
							!props?.profile.acct.match(/@[\w.-]+\.[a-z]{2,}$/)
						}
						userAccHandle={props?.profile.acct}
					/>
					<Underline className="mt-4 border-white dark:border-black" />
					{/* <View className="mt-[17]" /> */}
				</View>
			)}
		</View>
	);
};
export default CollapsibleFeedHeader;
