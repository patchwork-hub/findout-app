import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useBookmarkStatusMutation } from '@/hooks/mutations/statusActions.mutation';
import { updateStatusBookmarkCache } from '@/util/cache/feed/feedCache';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import customColor from '@/util/constant/color';
import { cn } from '@/util/helper/twutil';
import { StatusBookmarkIcon } from '@/util/svg/icon.status_actions';

type Props = {
	status: Patchwork.Status;
	isFromNoti?: boolean;
} & PressableProps;

const StatusBookmarkButton: React.FC<Props> = ({
	status,
	isFromNoti,
	...props
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	const toggleBookmarkStatus = useBookmarkStatusMutation({
		onMutate: async variables => {
			updateStatusBookmarkCache(variables.status.id);
		},
	});

	const onBookmarkStatus = () => {
		const stat = status.reblog ? status.reblog : status;
		toggleBookmarkStatus.mutate({
			status: stat,
		});
	};

	const isBookmarked = status.reblog
		? status.reblog.bookmarked
		: status.bookmarked;

	return (
		<Pressable
			className={cn(
				'flex flex-row items-center gap-1 active:opacity-80 mb-0.5',
				props.className,
			)}
			onPress={onBookmarkStatus}
			disabled={toggleBookmarkStatus.isPending}
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			{...props}
		>
			<StatusBookmarkIcon
				fill={
					status?.bookmarked || isBookmarked
						? colorScheme === 'dark'
							? customColor['patchwork-soft-primary']
							: customColor['patchwork-primary']
						: colorScheme === 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		</Pressable>
	);
};

export default StatusBookmarkButton;
