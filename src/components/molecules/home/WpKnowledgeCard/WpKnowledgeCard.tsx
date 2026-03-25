import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import customColor from '@/util/constant/color';
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { getWpNewsCardSize } from '../cardSizing';
import { formatDate, normalizeUrl, stripHtml } from '@/util/helper/helper';

type Props = { item: Patchwork.WPPost };

const getResourceUrl = (item: Patchwork.WPPost): string =>
	normalizeUrl(item.external_url ?? item.link);
const getResourceTitle = (item: Patchwork.WPPost): string =>
	stripHtml(item.title.rendered).trim() || 'Knowledge';

const WpKnowledgeCard = ({ item }: Props) => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { colorScheme } = useColorScheme();
	const { width: screenWidth } = useWindowDimensions();
	const { width: cardWidth, height: cardHeight } =
		getWpNewsCardSize(screenWidth);
	const title = getResourceTitle(item);
	const excerpt = stripHtml(item.excerpt?.rendered ?? '');
	const typeLabel =
		(item.type?.charAt(0).toUpperCase() ?? '') + (item.type?.slice(1) ?? '');
	const isDark = colorScheme === 'dark';

	const handlePress = () => {
		const url = getResourceUrl(item);
		if (!url) return;
		navigation.navigate('WebViewer', {
			url,
			customTitle: title,
			hideExternalOpen: true,
		});
	};

	return (
		<Pressable
			style={[styles.container, { width: cardWidth, height: cardHeight }]}
			onPress={handlePress}
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
				<View style={{ padding: 14, flex: 1 }}>
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
						numberOfLines={2}
						style={{
							color: isDark ? '#ECF4F7' : '#1F2937',
							fontSize: 14,
							lineHeight: 21,
						}}
					>
						{title}
					</ThemeText>

					{excerpt ? (
						<ThemeText
							numberOfLines={1}
							style={{
								fontSize: 12,
								lineHeight: 18,
								marginTop: 6,
								color: isDark ? '#B8C7CE' : undefined,
							}}
						>
							{excerpt}
						</ThemeText>
					) : null}
				</View>

				<View style={styles.footer}>
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
								color: isDark
									? customColor['csid-primary-dark']
									: customColor['csid-primary'],
								fontSize: 13,
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
		marginRight: 12,
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
		flex: 1,
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
		borderLeftWidth: 4,
		borderLeftColor: customColor['csid-primary'],
		justifyContent: 'space-between',
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
	footer: {
		paddingHorizontal: 14,
		paddingBottom: 12,
		paddingTop: 2,
	},
});

export default WpKnowledgeCard;
