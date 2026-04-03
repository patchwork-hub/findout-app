import { View, Pressable, Platform } from 'react-native';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { checkIsAccountVerified } from '@/util/helper/helper';
import { ProfileNameRedMark } from '@/util/svg/icon.profile';
import { useAuthStore } from '@/store/auth/authStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConversationsStackParamList } from '@/types/navigation';
import { useGetConversationByUserId } from '@/hooks/queries/conversations.queries';
import CustomAlert from '../../common/CustomAlert/CustomAlert';
import { useCheckRelationships } from '@/hooks/queries/profile.queries';
import {
	CHANNEL_INSTANCE,
	DEFAULT_INSTANCE,
	MO_ME_INSTANCE,
	NEWSMAST_INSTANCE_V1,
} from '@/util/constant';
import Image from '../../common/Image/Image';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { useMemo } from 'react';

type Props = {
	item: Patchwork.Account;
};
const NewMsgUserItem = ({ item }: Props) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { userInfo, userOriginInstance } = useAuthStore();
	const navigation =
		useNavigation<StackNavigationProp<ConversationsStackParamList>>();
	const { data: userConversation } = useGetConversationByUserId({
		id: item.id,
		options: {
			enabled: [
				DEFAULT_INSTANCE,
				MO_ME_INSTANCE,
				NEWSMAST_INSTANCE_V1,
				CHANNEL_INSTANCE,
			].includes(userOriginInstance),
		},
	});

	const { data: relationships } = useCheckRelationships({
		accountIds: [item.id],
		options: {
			enabled: !!item.id,
		},
	});

	const [alertState, setAlert] = useState<{
		message: string;
		isOpen: boolean;
		type?: 'existing' | 'follow_request';
	}>({
		message: '',
		isOpen: false,
	});

	const platformIcon = useMemo(() => {
		const domain = item.domain?.toLowerCase() || item.acct?.toLowerCase();
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
	}, [item.domain, item.acct]);

	return (
		<Pressable
			className="py-4 px-5 flex-row active:opacity-90"
			onPress={() => {
				if (userInfo?.acct == item.acct) {
					return Toast.show({
						type: 'errorToast',
						text1: t('toast.cant_send_to_own_account'),
						position: 'top',
						topOffset: Platform.OS == 'android' ? 25 : 50,
					});
				}
				if (userConversation && userConversation.last_status) {
					return setAlert({
						isOpen: true,
						type: 'existing',
						message: t('toast.existing_conversation', {
							user: item.display_name || item.username,
						}),
					});
				}

				const isFollowing = relationships?.[0]?.following;

				if (!isFollowing) {
					return setAlert({
						isOpen: true,
						type: 'follow_request',
						message: t('conversation.request_conversation_message', {
							user: item.display_name || item.username,
						}),
					});
				}
				navigation.navigate('InitiateNewConversation', {
					account: item,
					allowAddMoreParticipant: true,
				});
			}}
		>
			<Image
				uri={item.avatar}
				className="w-10 h-10 bg-patchwork-dark-50 rounded-full mr-3 border-patchwork-grey-50 border"
			/>
			<View>
				<View className="flex-row items-center">
					<ThemeText emojis={item.emojis} className="dark:text-white">
						{item.display_name || item.username}
					</ThemeText>
					{checkIsAccountVerified(item.fields) && (
						<ProfileNameRedMark className="ml-2" colorScheme={colorScheme} />
					)}
					{platformIcon && (
						<View className="ml-1.5 justify-center">
							<FontAwesomeIcon
								icon={platformIcon.icon}
								size={13}
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
				<ThemeText className="text-patchwork-dark-100 dark:text-white">
					@{item.acct}
				</ThemeText>
			</View>
			{alertState.isOpen && (
				<CustomAlert
					isVisible={true}
					hasCancel={true}
					extraTitleStyle="text-black dark:text-white text-center -ml-2"
					extraOkBtnStyle={colorScheme == 'dark' ? 'text-white' : 'text-black'}
					extraCancelBtnStyle={
						'text-patchwork-primary dark:text-patchwork-primary-dark mx-1'
					}
					message={alertState.message}
					cancelBtnText={
						alertState.type === 'existing'
							? t('toast.proceed_with_old_one')
							: t('common.cancel')
					}
					confirmBtnText={
						alertState.type === 'existing'
							? t('toast.create_a_new_one')
							: t('common.send')
					}
					title={
						alertState.type === 'existing'
							? t('toast.exisiting_convo_found')
							: t('conversation.request_conversation_title')
					}
					handleCancel={() => {
						if (alertState.type === 'existing') {
							navigation.navigate('ConversationDetail', {
								id: userConversation?.last_status?.id || '',
							});
						}
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}));
					}}
					handleOk={() => {
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}));
						navigation.navigate('InitiateNewConversation', {
							account: item,
							allowAddMoreParticipant: true,
						});
					}}
					type="error"
					onPressBackdrop={() =>
						setAlert(prev => ({
							...prev,
							isOpen: false,
						}))
					}
				/>
			)}
		</Pressable>
	);
};

export default NewMsgUserItem;
