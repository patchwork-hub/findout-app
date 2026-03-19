import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useUserRelationshipMutation } from '@/hooks/mutations/profile.mutation';
import { CheckRelationshipQueryKey } from '@/types/queries/profile.type';
import { queryClient } from '@/App';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';

const FollowMenuOption = ({
	accountId,
	relationships,
	isLoadingAccId,
	status,
	statusType,
	goBackToPreviousPage,
	handleGoBack,
}: {
	accountId: Patchwork.Account['id'];
	relationships: Patchwork.RelationShip[] | undefined;
	isLoadingAccId: boolean;
	status: Patchwork.Status;
	statusType: string;
	goBackToPreviousPage: boolean;
	handleGoBack: () => void;
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { mutate, isPending } = useUserRelationshipMutation({
		onSuccess: (newRelationship, { accountId }) => {
			const relationshipQueryKey: CheckRelationshipQueryKey = [
				'check-relationship-to-other-accounts',
				{
					accountIds: [accountId],
				},
			];

			queryClient.setQueryData<Patchwork.RelationShip[]>(
				relationshipQueryKey,
				old => {
					if (!old) return [newRelationship];
					return old.map(rel => {
						return rel.id === accountId ? { ...rel, ...newRelationship } : rel;
					});
				},
			);
		},
	});

	const onMakeRelationship = () => {
		mutate({
			accountId:
				statusType === 'channel-feed' ? status?.account?.id! : accountId,
			isFollowing: relationships
				? relationships[0]?.following || relationships[0]?.requested
				: false,
		});
	};

	const displayRelationshipText = useMemo(() => {
		const relationship = relationships?.[0];
		const isLocked = status?.account?.locked;

		if (relationship?.following) return t('timeline.unfollow');
		if (relationship?.requested && isLocked)
			return t('timeline.cancel_request');
		if (relationship?.requested) return t('timeline.requested');
		if (isLocked) return t('timeline.request_follow');
		return t('timeline.follow');
	}, [
		relationships?.[0]?.following,
		relationships?.[0]?.requested,
		status?.account?.locked,
		t,
	]);

	const followMenuLoading = isPending;

	return (
		<MenuOption
			onSelect={onMakeRelationship}
			disabled={followMenuLoading || isLoadingAccId}
		>
			<View className="flex-row items-center ">
				<View className="w-9 h-9 items-center justify-center">
					{relationships && relationships[0]?.following ? (
						<FontAwesomeIcon
							icon={AppIcons.followed}
							size={18}
							color={
								colorScheme == 'dark'
									? '#fff'
									: customColor['patchwork-grey-100']
							}
						/>
					) : (
						<FontAwesomeIcon
							icon={AppIcons.follow}
							size={18}
							color={
								colorScheme == 'dark'
									? '#fff'
									: customColor['patchwork-grey-100']
							}
						/>
					)}
				</View>
				{followMenuLoading ? (
					<Flow
						size={25}
						color={
							colorScheme === 'dark'
								? '#fff'
								: customColor['patchwork-dark-100']
						}
						className="ml-1"
					/>
				) : (
					<ThemeText
						size={'sm_14'}
						className="font-Inter_Regular ml-1 text-black dark:text-white"
					>
						{displayRelationshipText}
					</ThemeText>
				)}
			</View>
		</MenuOption>
	);
};

export default FollowMenuOption;
