import { MenuOption } from 'react-native-popup-menu';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useBookmarkStatusMutation } from '@/hooks/mutations/statusActions.mutation';
import { updateStatusBookmarkCache } from '@/util/cache/feed/feedCache';
import MenuOptionIcon from '../MenuOptionIcon/MenuOptionIcon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import customColor from '@/util/constant/color';

const BookmarkMenuOption = ({
	status,
	hideMenu,
}: {
	status: Patchwork.Status;
	hideMenu: () => void;
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	const toggleBookmarkStatus = useBookmarkStatusMutation({
		onMutate: async variables => {
			updateStatusBookmarkCache(variables.status.id);
		},
	});

	const onBookmarkStatus = (status: Patchwork.Status) => {
		const stat = status.reblog ? status.reblog : status;
		toggleBookmarkStatus.mutate({
			status: stat,
		});

		hideMenu();
	};

	const isBookmarked = status.reblog
		? status.reblog.bookmarked
		: status.bookmarked;

	return (
		<MenuOption
			onSelect={() => onBookmarkStatus(status)}
			disabled={toggleBookmarkStatus.isPending}
		>
			<MenuOptionIcon
				name={
					status?.bookmarked || isBookmarked
						? t('timeline.remove_bookmark')
						: t('timeline.bookmark')
				}
				icon={
					<FontAwesomeIcon
						icon={
							status?.bookmarked || isBookmarked
								? AppIcons.bookmarkSolid
								: AppIcons.bookmarkRegular
						}
						size={18}
						color={
							colorScheme === 'dark'
								? '#fff'
								: customColor['patchwork-grey-100']
						}
					/>
				}
			/>
		</MenuOption>
	);
};

export default BookmarkMenuOption;
