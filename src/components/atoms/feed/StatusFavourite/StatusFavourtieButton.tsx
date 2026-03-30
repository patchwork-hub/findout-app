import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useFavouriteMutation } from '@/hooks/mutations/feed.mutation';
import { updateStatusFaouriteCache } from '@/util/cache/feed/feedCache';
import customColor from '@/util/constant/color';
import { formatNumber } from '@/util/helper/helper';
import { StatusFavouriteIcon } from '@/util/svg/icon.status_actions';
import { useColorScheme } from 'nativewind';
import { TouchableOpacity, ViewProps } from 'react-native';

type Props = {
	status: Patchwork.Status;
	isFromNoti?: boolean;
} & ViewProps;

const StatusFavourtieButton = ({ status, isFromNoti, ...props }: Props) => {
	const { colorScheme } = useColorScheme();

	const { mutate } = useFavouriteMutation({
		onMutate: async variables => {
			updateStatusFaouriteCache(variables.status);
		},
	});

	const handleFavourite = () => {
		const stat = status.reblog ? status.reblog : status;
		mutate({ status: stat });
	};

	const isFavourited = status.reblog
		? status.reblog.favourited
		: status.favourited;

	const favouritesCount = status.reblog
		? status.reblog.favourites_count
		: status.favourites_count;

	return (
		<TouchableOpacity
			activeOpacity={0.8}
			className="flex flex-row items-center gap-1 p-1.5"
			{...props}
			onPress={handleFavourite}
		>
			<StatusFavouriteIcon
				isFavourited={isFavourited}
				fill={
					isFavourited && colorScheme == 'dark'
						? customColor['patchwork-soft-primary']
						: isFavourited && colorScheme == 'light'
						? customColor['patchwork-primary']
						: colorScheme == 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
			<ThemeText variant="textGrey">{formatNumber(favouritesCount)}</ThemeText>
		</TouchableOpacity>
	);
};

export default StatusFavourtieButton;
