import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import EventImageView from '@/components/molecules/home/EventImageView';
import { useEventImage } from '@/hooks/queries/wpFeed.queries';
import { stripHtml } from '@/util/helper/helper';
import { getEventLocationLabel, parseExcerpt } from '@/util/helper/wpContent';
import {
	faCalendarDays,
	faChevronRight,
	faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Pressable, View } from 'react-native';

type FeaturedCardProps = {
	item: Patchwork.WPPost;
	cardWidth: number;
	imageHeight: number;
	onPress: () => void;
};

const CARD_BG = '#033E45';
const ACCENT = '#C8E45A';

const FeaturedEventCard = ({
	item,
	cardWidth,
	imageHeight,
	onPress,
}: FeaturedCardProps) => {
	const {
		isCsidInternal,
		isLoadingOg,
		faviconUrl,
		primaryImageUrl,
		websiteUrl,
	} = useEventImage(item);
	const { location, description } = parseExcerpt(item.excerpt?.rendered ?? '');
	const displayLocation = getEventLocationLabel(location, websiteUrl);
	const dateStr = item.date
		? new Date(item.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
		  })
		: '';
	const title = stripHtml(item.title?.rendered ?? '');

	return (
		<Pressable
			onPress={onPress}
			className="mb-5 rounded-2xl overflow-hidden active:opacity-90"
			style={{ width: cardWidth, backgroundColor: CARD_BG }}
		>
			<View style={{ height: imageHeight }}>
				<EventImageView
					width={cardWidth}
					height={imageHeight}
					isCsidInternal={isCsidInternal}
					isLoadingOg={isLoadingOg}
					faviconUrl={faviconUrl}
					primaryImageUrl={primaryImageUrl}
					csidLogoWidth={cardWidth * 0.55}
					csidLogoHeight={64}
					faviconFrameSize={108}
					faviconIconSize={80}
				/>
				{!isCsidInternal && !faviconUrl && !isLoadingOg && (
					<View
						className="absolute bottom-0 left-0 right-0"
						style={{ height: 120, backgroundColor: 'rgba(3,62,69,0.5)' }}
					/>
				)}
			</View>

			<View className="px-5 pt-4 pb-5">
				{dateStr ? (
					<View className="flex-row items-center mb-2">
						<View
							className="self-start rounded-full px-3 py-1 flex-row items-center"
							style={{ backgroundColor: ACCENT }}
						>
							<FontAwesomeIcon
								icon={faCalendarDays}
								size={11}
								color={CARD_BG}
								style={{ marginRight: 5 }}
							/>
							<ThemeText
								className="font-OpenSans_SemiBold"
								size="xs_12"
								style={{ color: CARD_BG }}
							>
								{dateStr}
							</ThemeText>
						</View>
					</View>
				) : null}

				<ThemeText
					className="font-Oswald_Bold mb-2"
					size="xl_20"
					style={{ color: '#FFFFFF', lineHeight: 26 }}
					numberOfLines={3}
				>
					{title}
				</ThemeText>

				{description ? (
					<ThemeText
						className="font-OpenSans_Regular mb-3"
						size="fs_13"
						style={{ color: 'rgba(255,255,255,0.75)' }}
						numberOfLines={2}
					>
						{description}
					</ThemeText>
				) : null}

				<View className="flex-row items-center justify-between">
					{displayLocation ? (
						<View className="flex-row items-center flex-1 mr-3">
							<FontAwesomeIcon
								icon={faLocationDot}
								size={12}
								color={ACCENT}
								style={{ marginRight: 6 }}
							/>
							<ThemeText
								className="font-OpenSans_Regular flex-1"
								size="xs_12"
								style={{ color: 'rgba(255,255,255,0.7)' }}
								numberOfLines={1}
							>
								{displayLocation}
							</ThemeText>
						</View>
					) : (
						<View className="flex-1" />
					)}
					<View
						className="rounded-full items-center justify-center"
						style={{ width: 32, height: 32, backgroundColor: ACCENT }}
					>
						<FontAwesomeIcon icon={faChevronRight} size={12} color={CARD_BG} />
					</View>
				</View>
			</View>
		</Pressable>
	);
};

export default FeaturedEventCard;
