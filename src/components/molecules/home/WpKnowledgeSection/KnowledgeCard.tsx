import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { formatDate, SCREEN_WIDTH, stripHtml } from '@/util/helper/helper';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const CARD_WIDTH = SCREEN_WIDTH - 32;

const KnowledgeCard = ({
	item,
	onPress,
}: {
	item: Patchwork.WPPost;
	onPress: () => void;
}) => {
	const { colorScheme } = useColorScheme();
	const title = stripHtml(item.title.rendered);
	const excerpt = stripHtml(item.excerpt?.rendered ?? '');
	const typeLabel =
		(item.type?.charAt(0).toUpperCase() ?? '') + (item.type?.slice(1) ?? '');
	const isDark = colorScheme === 'dark';

	return (
		<Pressable
			style={[
				styles.container,
				{
					backgroundColor: isDark ? customColor['patchwork-dark-400'] : '#FFFFFF',
				},
			]}
			onPress={onPress}
		>
			<View
				style={[
					styles.contentContainer,
					{
						backgroundColor: isDark ? customColor['patchwork-dark-400'] : '#FFFFFF',
						borderLeftColor: isDark
							? customColor['csid-primary-dark']
							: customColor['csid-primary'],
					},
				]}
			>
				<View style={{ padding: 16, paddingBottom: 12 }}>
					<View style={styles.dateLabel}>
						<ThemeText
							style={{ fontSize: 11, color: isDark ? '#9FB3BC' : undefined }}
						>
							{formatDate(item.date)}
						</ThemeText>
						<View
							style={[
								styles.typeBadge,
								{
									backgroundColor: isDark ? '#23363D' : '#F3F4F6',
								},
							]}
						>
							<ThemeText
								className="font-OpenSans_SemiBold"
								style={{ fontSize: 10, color: isDark ? '#D8E2E6' : undefined }}
							>
								{typeLabel}
							</ThemeText>
						</View>
					</View>

					<ThemeText
						className="font-OpenSans_Bold"
						numberOfLines={3}
						style={{
							fontSize: 15,
							lineHeight: 22,
							color: isDark ? '#ECF4F7' : '#1F2937',
						}}
					>
						{title}
					</ThemeText>

					{excerpt ? (
						<ThemeText
							numberOfLines={2}
							style={{
								fontSize: 12,
								lineHeight: 18,
								marginTop: 8,
								color: isDark ? '#B8C7CE' : undefined,
							}}
						>
							{excerpt}
						</ThemeText>
					) : null}
				</View>

				<View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
					<View
						style={{
							height: 1,
							backgroundColor: isDark ? '#2A3E45' : '#F3F4F6',
							marginBottom: 10,
						}}
					/>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<ThemeText
							style={{ fontSize: 12, color: isDark ? '#D8E2E6' : undefined }}
						>
							Open resource
						</ThemeText>
						<ThemeText
							style={{
								fontSize: 13,
								color: isDark
									? customColor['csid-primary-dark']
									: customColor['csid-primary'],
							}}
						>
							→
						</ThemeText>
					</View>
				</View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		width: CARD_WIDTH,
		marginBottom: 12,
		borderRadius: 14,
		backgroundColor: 'transparent',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOpacity: 0.08,
				shadowRadius: 8,
				shadowOffset: { width: 0, height: 3 },
			},
			android: { elevation: 3 },
		}),
	},
	contentContainer: {
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		borderLeftWidth: 4,
		borderLeftColor: customColor['csid-primary'],
	},
	dateLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	metaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	knowledgeLabel: {
		backgroundColor: '#F0FDFA',
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	typeBadge: {
		backgroundColor: '#F3F4F6',
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
});

export default KnowledgeCard;
