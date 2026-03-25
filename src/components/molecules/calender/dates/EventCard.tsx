import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { TFunction } from 'i18next';
import { LautiEventDocument } from '@/types/calendar.type';
import { buildLautiMediaUrl } from '@/services/calendar.service';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendarDays } from '@fortawesome/free-regular-svg-icons';
import customColor from '@/util/constant/color';
import Image from '@/components/atoms/common/Image/Image';
import EventActionButton from '@/components/molecules/calender/EventActionButton';
import {
	getEventBookingUrl,
	getEventDateLabel,
	getEventLocationLabel,
} from '@/util/helper/event';
import { openEventRegistration } from '@/services/calendarEvent.service';

type EventCardProps = {
	item: LautiEventDocument;
	isDark: boolean;
	t: TFunction;
	onPress?: () => void;
};

const EventCard = React.memo(({ item, isDark, t, onPress }: EventCardProps) => {
	const imageUrl = buildLautiMediaUrl(item.image);
	const hasImage = Boolean(item.image);
	const dateLabel = getEventDateLabel(item);
	const metaColor = isDark ? '#9CB0B7' : '#6A7A81';
	const bookingUrl = getEventBookingUrl(item);
	const canRegister = Boolean(bookingUrl);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.85}
			style={[
				styles.eventCard,
				{
					backgroundColor: isDark
						? customColor['patchwork-dark-400']
						: '#FFFFFF',
				},
			]}
		>
			{hasImage ? (
				<Image
					uri={imageUrl}
					className="w-full h-full rounded-lg"
					style={styles.cardImage}
					fallbackType="channels"
				/>
			) : null}

			<View style={styles.cardBody}>
				<ThemeText
					className="font-OpenSans_Bold"
					numberOfLines={2}
					style={styles.cardTitle}
				>
					{item?.name || 'Untitled Event'}
				</ThemeText>

				<ThemeText
					className="mt-1 font-OpenSans_Regular"
					size="fs_13"
					numberOfLines={3}
					style={{ color: isDark ? '#9CB0B7' : '#5D6E74', fontWeight: '400' }}
				>
					{item?.description || 'No description available.'}
				</ThemeText>
				<View style={styles.divider} />

				<View style={styles.metaRow}>
					<FontAwesomeIcon icon={faCalendarDays} size={12} color={metaColor} />
					<ThemeText
						className="ml-2"
						size="fs_13"
						numberOfLines={1}
						style={{ color: metaColor }}
					>
						{dateLabel}
					</ThemeText>
				</View>

				{/* <View style={[styles.metaRow, { marginTop: 6 }]}>
					<ThemeText
						className="ml-2"
						size="fs_13"
						numberOfLines={1}
						style={{ color: metaColor }}
					></ThemeText>
				</View> */}

				{/* <EventActionButton
					label="Register"
					containerStyle={styles.registerButton}
					onPress={() => void openEventRegistration(item)}
					disabled={!canRegister}
				/> */}
			</View>
		</TouchableOpacity>
	);
});

const styles = StyleSheet.create({
	eventCard: {
		borderRadius: 12,
		marginTop: 12,
		overflow: 'hidden',
	},
	cardImage: {
		width: '100%',
		height: 160,
	},
	cardBody: {
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
	},
	registerButton: {
		marginTop: 12,
	},
	cardTitle: { fontSize: 15, fontWeight: '700' },
	divider: {
		height: 0.5,
		width: '100%',
		backgroundColor: '#E0E0E0',
		marginVertical: 12,
	},
});
export default EventCard;
