import { useCallback, useMemo } from 'react';
import { View, Pressable, Platform } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';
import { queryClient } from '@/App';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import VerticalInfo from '@/components/molecules/account/UserAccountInfo/UserAccountInfo';
import { useUserRelationshipMutation } from '@/hooks/mutations/profile.mutation';
import { SearchStackParamList } from '@/types/navigation';
import { CheckRelationshipQueryKey } from '@/types/queries/profile.type';
import customColor from '@/util/constant/color';
import { checkIsAccountVerified } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import Image from '@/components/atoms/common/Image/Image';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

interface ISuggestedPeopleListItem {
	item: Patchwork.SuggestedPeople;
	relationship: Patchwork.RelationShip | undefined;
	accountIds: string[];
}

const SuggestedPeopleListItem = ({
	item,
	relationship,
	accountIds,
}: ISuggestedPeopleListItem) => {
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<SearchStackParamList>>();
	const { colorScheme } = useColorScheme();
	const isAccVerified = useMemo(() => {
		return checkIsAccountVerified(item.account.fields);
	}, [item.account.fields]);

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
			accountId: item.account.id,
			isFollowing: relationship?.following || relationship?.requested || false,
		});
	}, [mutate, item.account.id, relationship]);

	const displayRelationshipText = useMemo(() => {
		if (relationship?.following) return t('timeline.unfollow');
		if (relationship?.requested && item.account.locked)
			return t('timeline.cancel_request');
		if (relationship?.requested) return t('timeline.requested');
		if (item.account.locked) return t('timeline.request_follow');
		return t('timeline.follow');
	}, [
		relationship?.following,
		relationship?.requested,
		item.account.locked,
		t,
	]);

	return (
		<View>
			<Pressable
				className="flex-row px-3 py-3"
				onPress={() => {
					navigation.push('ProfileOther', {
						id: item.account.id,
					});
				}}
			>
				<View className="flex-1 flex-row mr-2">
					<Pressable>
						<Image
							className={cn(
								'w-10 h-10 border-patchwork-grey-400 border rounded-full',
							)}
							uri={item.account.avatar}
						/>
					</Pressable>
					<VerticalInfo
						emojis={item.account.emojis}
						hasRedMark={isAccVerified}
						userRoles={item.account.roles}
						accountName={
							item.account.display_name
								? item.account.display_name
								: item.account.username
						}
						username={item.account.acct}
						joinedDate={dayjs(item.account.created_at).format('MMM YYYY')}
						userBio={''}
						acctNameTextStyle="text-[14px]"
					/>
				</View>
				<Button
					variant="outline"
					size="sm"
					className="rounded-3xl px-6"
					onPress={onMakeRelationship}
					disabled={isPending}
				>
					{isPending ? (
						<Flow
							size={25}
							color={
								colorScheme == 'dark'
									? customColor['patchwork-primary-dark']
									: '#000'
							}
						/>
					) : (
						<ThemeText size={'fs_13'}>{displayRelationshipText}</ThemeText>
					)}
				</Button>
			</Pressable>
		</View>
	);
};

export default SuggestedPeopleListItem;
