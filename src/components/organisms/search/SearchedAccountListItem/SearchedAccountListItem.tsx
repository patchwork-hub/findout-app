import { useCallback, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';
import { queryClient } from '@/App';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import VerticalInfo from '@/components/molecules/account/UserAccountInfo/UserAccountInfo';
import { useUserRelationshipMutation } from '@/hooks/mutations/profile.mutation';
import { useAuthStore } from '@/store/auth/authStore';
import { SearchStackParamList } from '@/types/navigation';
import { CheckRelationshipQueryKey } from '@/types/queries/profile.type';
import customColor from '@/util/constant/color';
import { checkIsAccountVerified } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import { Platform } from 'react-native';
import Image from '@/components/atoms/common/Image/Image';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';

interface ISearchedAccountListItem {
	item: Patchwork.Account;
	relationship: Patchwork.RelationShip | undefined;
	accountIds: string[];
	q: string;
	isRelationshipInvalidating?: boolean;
}

const SearchedAccountListItem = ({
	item,
	relationship,
	accountIds,
	q,
	isRelationshipInvalidating,
}: ISearchedAccountListItem) => {
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();

	const { userInfo } = useAuthStore();

	const isAuthor = useMemo(() => {
		const currentUserAccHandle = userInfo?.acct + '@channel.org';
		return userInfo?.id == item.id || item.acct == currentUserAccHandle;
	}, [item, userInfo?.id]);

	const isAccVerified = useMemo(() => {
		return checkIsAccountVerified(item.fields);
	}, [item.fields]);

	const { mutate, isPending } = useUserRelationshipMutation({
		onSuccess: (newRelationship, { accountId: acctId }) => {
			const relationshipQueryKey: CheckRelationshipQueryKey = [
				'check-relationship-to-other-accounts',
				{ accountIds },
			];

			queryClient.setQueryData<Patchwork.RelationShip[]>(
				relationshipQueryKey,
				old => {
					if (!old) return [newRelationship];
					return old.map(rel => {
						return rel.id === acctId ? { ...rel, ...newRelationship } : rel;
					});
				},
			);
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const onMakeRelationship = useCallback(() => {
		mutate({
			accountId: item.id,
			isFollowing: relationship?.following || relationship?.requested || false,
		});
	}, [mutate, item.id, relationship]);

	const displayRelationshipText = useMemo(() => {
		if (relationship?.following) return t('timeline.unfollow');
		if (relationship?.requested && item.locked)
			return t('timeline.cancel_request');
		if (relationship?.requested) return t('timeline.requested');
		if (item.locked) return t('timeline.request_follow');
		return t('timeline.follow');
	}, [relationship?.following, relationship?.requested, item.locked, t]);

	return (
		<View>
			<Pressable
				className="flex-row px-3 py-3"
				onPress={() => {
					if (isAuthor) {
						navigation.navigate('Profile', {
							id: item.id,
						});
					} else {
						navigation.push('ProfileOther', {
							id: item.id,
						});
					}
				}}
			>
				<View className="flex-1 flex-row mr-2">
					<Pressable>
						<Image
							className={cn(
								'w-10 h-10 border-patchwork-grey-400 border rounded-full',
							)}
							uri={item.avatar}
						/>
					</Pressable>
					<VerticalInfo
						emojis={item.emojis}
						hasRedMark={isAccVerified}
						accountName={item.display_name ? item.display_name : item.username}
						username={item.acct}
						joinedDate={dayjs(item.created_at).format('MMM YYYY')}
						userBio={''}
						userRoles={item.roles}
						acctNameTextStyle="text-[14px]"
					/>
				</View>
				{!isAuthor && (
					<Button
						variant="outline"
						size="sm"
						className="rounded-3xl px-6"
						onPress={onMakeRelationship}
						disabled={isPending}
					>
						{isPending || isRelationshipInvalidating ? (
							<Flow
								size={25}
								color={
									colorScheme == 'dark'
										? customColor['patchwork-primary-dark']
										: customColor['patchwork-primary']
								}
							/>
						) : (
							<ThemeText size={'fs_13'}>{displayRelationshipText}</ThemeText>
						)}
					</Button>
				)}
			</Pressable>
		</View>
	);
};

export default SearchedAccountListItem;
