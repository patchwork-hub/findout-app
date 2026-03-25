import { View, StyleSheet } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import VirtualGlobe from '../../../../../assets/svg/VirtualGlobe';
import InPersonPin from '../../../../../assets/svg/InPersonPin';

const EventTypesCard = () => (
	<View pointerEvents="none" style={styles.legendWrap}>
		<View style={styles.legendCard}>
			<ThemeText style={styles.legendTitle}>Event Types</ThemeText>

			<View style={styles.legendRow}>
				<View
					style={{
						width: 25,
						alignItems: 'center',
					}}
				>
					<InPersonPin />
				</View>
				<ThemeText style={styles.legendLabel}>In-Person</ThemeText>
			</View>

			<View style={styles.legendRow}>
				<View style={styles.legendVirtualIcon}>
					<VirtualGlobe />
				</View>
				<ThemeText style={styles.legendLabel}>Virtual</ThemeText>
			</View>
		</View>
	</View>
);

const styles = StyleSheet.create({
	legendWrap: {
		position: 'absolute',
		top: 18,
		left: 16,
	},
	legendCard: {
		minWidth: 150,
		borderRadius: 18,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
		paddingVertical: 14,
		shadowColor: '#000000',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.18,
		shadowRadius: 16,
		elevation: 8,
	},
	legendTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: '#0D4D57',
		marginBottom: 10,
	},
	legendRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 9,
	},
	legendLabel: {
		fontSize: 16,
		fontWeight: '500',
		color: '#3D4456',
	},
	legendVirtualIcon: {
		width: 25,
		height: 25,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: '#F6958A',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default EventTypesCard;
