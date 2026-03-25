import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { buildLautiMediaUrl } from '@/services/calendar.service';
import customColor from '@/util/constant/color';
import { LautiGroupDocument } from '@/types/calendar.type';

type GroupCardProps = {
	item: LautiGroupDocument;
	isDark: boolean;
	cardWidth: number;
	onPress?: () => void;
};

const GroupCard = ({ item, isDark, cardWidth, onPress }: GroupCardProps) => {
	const imageUrl = buildLautiMediaUrl(item.image);

	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.groupCard,
				{
					width: cardWidth,
					shadowOpacity: isDark ? 0.2 : 0.08,
				},
			]}
		>
			<View
				style={[
					styles.groupInnerCard,
					{
						backgroundColor: isDark
							? customColor['patchwork-dark-400']
							: '#FFFFFF',
						borderColor: isDark ? '#2A3A40' : '#D5DEE2',
					},
				]}
			>
				<Image
					source={imageUrl ? { uri: imageUrl } : undefined}
					style={styles.groupImage}
					className="w-full h-full rounded-t-lg"
				/>
				<View
					style={[
						styles.groupBody,
						{ borderTopColor: isDark ? '#2A3A40' : '#D5DEE2' },
					]}
				>
					<ThemeText
						className="font-OpenSans_Regular"
						size="xs_12"
						numberOfLines={2}
						ellipsizeMode="tail"
						style={{
							alignSelf: 'center',
							textAlign: 'center',
						}}
					>
						{item.name || 'Untitled Organiser'}
					</ThemeText>
				</View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	groupCard: {
		borderRadius: 10,
		marginTop: 12,
		height: 196,
		shadowColor: '#033E45',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		elevation: 3,
	},
	groupInnerCard: {
		flex: 1,
		borderRadius: 10,
		borderWidth: 1,
		overflow: 'hidden',
	},
	groupImage: {
		width: '100%',
		height: 124,
	},
	groupBody: {
		flex: 1,
		paddingHorizontal: 10,
		borderTopWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default GroupCard;
