import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { NotificationPeopleFollowIcon } from '@/util/svg/icon.notification';
import Image from '@/components/atoms/common/Image/Image';
import { useNavigation } from '@react-navigation/native';
import { NotificationScreenNavigationProp } from '@/types/navigation';
import { Button } from '@/components/atoms/common/Button/Button';
import { useFollowRequestsMutation } from '@/hooks/mutations/profile.mutation';
import { FollowRequestQueryKey } from '@/services/notification.service';
import { queryClient } from '@/App';
import { useTranslation } from 'react-i18next';

const NotiFollowRequestTabItem = ({ item }: { item: Patchwork.Account }) => {
	const { t } = useTranslation();
	const navigation = useNavigation<NotificationScreenNavigationProp>();
	const displayAcct = item.url.includes(process.env.API_URL ?? '')
		? `${item.acct}@channel.org`
		: item.acct;

	const { mutate, isPending } = useFollowRequestsMutation({
		onSuccess: () => {
			const followRequestNotQueryKey: FollowRequestQueryKey = [
				'follow-request-query-key',
			];
			queryClient.invalidateQueries({ queryKey: followRequestNotQueryKey });
		},
	});

	const handleFollowRequest = (type: 'authorize' | 'reject') => {
		mutate({
			accountId: item.id,
			requestType: type,
		});
	};
	return (
		<View className="items-start gap-2 px-4 py-3 flex-row">
			<View className="w-9 h-9 items-center justify-center">
				<NotificationPeopleFollowIcon />
			</View>
			<View className="flex-auto">
				<View>
					<Pressable
						className="flex-row"
						onPress={() => {
							navigation.navigate('ProfileOther', {
								id: item.id,
								isFromNoti: true,
							});
						}}
					>
						<View>
							<Image
								uri={item.avatar}
								className="w-10 h-10 rounded-full mx-[2px]"
							/>
						</View>
						<View className="ml-3 flex-1">
							<ThemeText
								emojis={item.emojis}
								size={'md_16'}
								className="opacity-80 font-NewsCycle_Bold"
							>
								{item.display_name || item.username}{' '}
								<ThemeText>{t('timeline.requested_to_follow_you')}</ThemeText>
							</ThemeText>
							<ThemeText className="opacity-50">@{displayAcct}</ThemeText>
						</View>
					</Pressable>

					{/* Follow Request Accept/Reject Actions */}
					<View className="flex-1 flex-row justify-end mt-3">
						<Button
							variant={'outline'}
							size={'sm'}
							className="px-10 mr-3"
							onPress={() => handleFollowRequest('reject')}
							disabled={isPending}
						>
							<ThemeText>{t('common.reject')}</ThemeText>
						</Button>
						<Button
							className="px-10"
							size={'sm'}
							onPress={() => handleFollowRequest('authorize')}
							disabled={isPending}
						>
							<ThemeText className="text-white">{t('common.accept')}</ThemeText>
						</Button>
					</View>
				</View>
			</View>
		</View>
	);
};

export default NotiFollowRequestTabItem;
