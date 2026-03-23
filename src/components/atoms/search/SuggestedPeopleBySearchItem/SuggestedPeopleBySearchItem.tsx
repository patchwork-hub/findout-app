import AccountAvatar from '@/components/molecules/feed/AccountAvatar/AccountAvatar';
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Platform } from 'react-native';
import { Button } from '../../common/Button/Button';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useUserRelationshipMutation } from '@/hooks/mutations/profile.mutation';
import { CheckRelationshipQueryKey } from '@/types/queries/profile.type';
import { queryClient } from '@/App';
import Toast from 'react-native-toast-message';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

interface SuggestedPeopleBySearchItemProps {
	item: Patchwork.SuggestedPeople;
	relationship: Patchwork.RelationShip | undefined;
	accountIds: string[];
}

const SuggestedPeopleBySearchItem = ({
	item,
	relationship,
	accountIds,
}: SuggestedPeopleBySearchItemProps) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const { colorScheme } = useColorScheme();

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
					return old.map(rel =>
						rel.id === acctId ? { ...rel, ...newRelationship } : rel,
					);
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
		if (!isPending) {
			mutate({
				accountId: item.account.id,
				isFollowing:
					relationship?.following || relationship?.requested || false,
			});
		}
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
		<View className="items-center mr-4 my-1">
			<AccountAvatar
				account={item.account}
				size={'md'}
				className="w-[110]"
				onPress={() =>
					navigation.navigate('ProfileOther', {
						id: item.account.id,
					})
				}
			/>
			<Button
				size="sm"
				variant={'outline'}
				onPress={onMakeRelationship}
				className="mt-2 rounded-3xl"
			>
				{isPending ? (
					<Flow
						size={25}
						color={
							colorScheme == 'dark' ? customColor['patchwork-light-50'] : '#000'
						}
					/>
				) : (
					<ThemeText size={'fs_13'}>{displayRelationshipText}</ThemeText>
				)}
			</Button>
		</View>
	);
};

export default SuggestedPeopleBySearchItem;
