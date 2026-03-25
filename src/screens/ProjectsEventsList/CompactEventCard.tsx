import { View, Pressable, StyleSheet } from 'react-native';
import { useEventImage } from '@/hooks/queries/wpFeed.queries';
import { getEventLocationLabel, parseExcerpt } from '@/util/helper/wpContent';
import EventImageView from '@/components/molecules/home/EventImageView';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faCalendarDays,
	faChevronRight,
	faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { stripHtml } from '@/util/helper/helper';

type CompactCardProps = {
	item: Patchwork.WPPost;
	cardWidth: number;
	onPress: () => void;
};

const CompactEventCard = ({ item, cardWidth, onPress }: CompactCardProps) => {
	const {
		isCsidInternal,
		isLoadingOg,
		faviconUrl,
		primaryImageUrl,
		websiteUrl,
	} = useEventImage(item);
	const { location } = parseExcerpt(item.excerpt?.rendered ?? '');
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
			className="mb-4 rounded-2xl overflow-hidden active:opacity-90 flex-row"
			style={[styles.container, { width: cardWidth }]}
		>
			<EventImageView
				width={120}
				height={120}
				isCsidInternal={isCsidInternal}
				isLoadingOg={isLoadingOg}
				faviconUrl={faviconUrl}
				primaryImageUrl={primaryImageUrl}
				csidLogoBg="#F0F0F0"
				csidLogoWidth={96}
				csidLogoHeight={36}
				faviconFrameSize={76}
				faviconIconSize={54}
			/>

			<View className="flex-1 px-3 py-3 justify-between">
				<View>
					{dateStr ? (
						<View className="flex-row items-center mb-1.5">
							<FontAwesomeIcon
								icon={faCalendarDays}
								size={11}
								color="#999"
								style={{ marginRight: 5 }}
							/>
							<ThemeText
								className="font-OpenSans_Regular"
								size="xs_12"
								style={{ color: '#999' }}
							>
								{dateStr}
							</ThemeText>
						</View>
					) : null}

					<ThemeText
						className="font-Oswald_Bold"
						size="md_16"
						style={styles.title}
						numberOfLines={2}
					>
						{title}
					</ThemeText>
				</View>

				{displayLocation ? (
					<View className="flex-row items-center mt-1">
						<FontAwesomeIcon
							icon={faLocationDot}
							size={11}
							color="#999"
							style={{ marginRight: 5 }}
						/>
						<ThemeText
							className="font-OpenSans_Regular flex-1"
							size="xs_12"
							style={{ color: '#888' }}
							numberOfLines={1}
						>
							{displayLocation}
						</ThemeText>
					</View>
				) : null}
			</View>

			<View className="justify-center pr-3">
				<FontAwesomeIcon icon={faChevronRight} size={12} color="#CCC" />
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
		height: 120,
	},
	title: { color: '#033E45', lineHeight: 20 },
});

export default CompactEventCard;
