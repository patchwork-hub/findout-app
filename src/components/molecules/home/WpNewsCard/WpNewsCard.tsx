import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
	Platform,
	Pressable,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';
import { getWpNewsCardSize } from '../cardSizing';
import { formatDate, stripHtml } from '@/util/helper/helper';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const NEWS_ACCENT = '#3B82F6';

type Props = {
	item: Patchwork.WPPost;
};

const WpNewsCard = ({ item }: Props) => {
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { width: screenWidth } = useWindowDimensions();
	const { width: cardWidth, height: cardHeight } =
		getWpNewsCardSize(screenWidth);
	const title = stripHtml(item.title.rendered);
	const isDark = colorScheme === 'dark';

	const onPress = () =>
		navigation.navigate('WpNewsDetail', {
			title,
			date: item.date,
			content: item.content?.rendered ?? item.excerpt?.rendered ?? '',
			link: item.link,
		});

	return (
		<Pressable
			style={[
				styles.container,
				{
					width: cardWidth,
					height: cardHeight,
					backgroundColor: isDark
						? customColor['patchwork-dark-400']
						: '#FFFFFF',
				},
			]}
			onPress={onPress}
		>
			<View
				style={[
					styles.contentContainer,
					{
						backgroundColor: isDark
							? customColor['patchwork-dark-400']
							: '#FFFFFF',
						borderLeftColor: isDark ? customColor['csid-primary-dark'] : '#9CA3AF',
					},
				]}
			>
				<View style={{ padding: 14, flex: 1 }}>
					<View style={styles.dateLabel}>
						<ThemeText style={{ fontSize: 11, color: isDark ? '#9FB3BC' : undefined }}>
							{formatDate(item.date)}
						</ThemeText>
						<View
							style={[
								styles.newsLabel,
								{
									backgroundColor: isDark ? '#23363D' : '#EFF6FF',
								},
							]}
						>
							<ThemeText
								className="font-OpenSans_SemiBold"
								style={{
									color: isDark ? customColor['csid-primary-dark'] : NEWS_ACCENT,
									fontSize: 10,
									letterSpacing: 0.5,
								}}
							>
								NEWS
							</ThemeText>
						</View>
					</View>

					<ThemeText
						className="font-OpenSans_Bold"
						numberOfLines={3}
						style={{
							color: isDark ? '#ECF4F7' : '#1F2937',
							fontSize: 14,
							lineHeight: 21,
						}}
					>
						{title}
					</ThemeText>
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
						<ThemeText style={{ fontSize: 12, color: isDark ? '#D8E2E6' : undefined }}>
							Read article
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
		backgroundColor: '#FFFFFF',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOpacity: 0.07,
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
		borderLeftColor: '#9CA3AF',
		justifyContent: 'space-between',
	},
	dateLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	newsLabel: {
		backgroundColor: '#EFF6FF',
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

export default WpNewsCard;
