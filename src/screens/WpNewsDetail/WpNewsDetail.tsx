import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { HomeStackParamList } from '@/types/navigation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
	ScrollView,
	StyleSheet,
	View,
	useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { formatDate } from '@/util/helper/helper';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const ACCENT = '#6366F1';

const WpNewsDetail = () => {
	const { colorScheme } = useColorScheme();
	const route = useRoute<RouteProp<HomeStackParamList, 'WpNewsDetail'>>();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { width } = useWindowDimensions();
	const { title, date, content } = route.params;
	const isDark = colorScheme === 'dark';
	const surfaceBg = isDark
		? customColor['patchwork-dark-400']
		: customColor['patchwork-grey-50'];
	const headerAccent = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];
	const dividerColor = isDark ? '#23363D' : '#E0E0EA';

	const contentWidth = width - 40;

	return (
		<SafeScreen style={{ backgroundColor: surfaceBg }} statusBarBg={surfaceBg}>
			<View style={{ borderBottomWidth: 1, borderBottomColor: dividerColor }}>
				<Header
					leftCustomComponent={<BackButton />}
					titleComponent={
						<ThemeText
							className="font-OpenSans_Bold"
							style={[styles.headerTitle, { color: headerAccent }]}
						>
							NEWS
						</ThemeText>
					}
					style={[styles.header, { backgroundColor: surfaceBg }]}
				/>
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.contentContainer,
					{ backgroundColor: surfaceBg },
				]}
				showsVerticalScrollIndicator={false}
			>
				<ThemeText
					style={[styles.date, { color: isDark ? '#9FB3BC' : '#9CA3AF' }]}
				>
					{formatDate(date)}
				</ThemeText>
				<ThemeText
					className="font-OpenSans_Bold"
					style={[styles.title, { color: isDark ? '#ECF4F7' : '#111827' }]}
				>
					{title}
				</ThemeText>

				<View style={styles.divider} />

				{/* Full article content */}
				<RenderHtml
					contentWidth={contentWidth}
					source={{ html: content }}
					baseStyle={{
						...styles.barStyle,
						color: isDark ? '#D8E2E6' : '#1F2937',
					}}
					tagsStyles={{
						body: { color: isDark ? '#D8E2E6' : '#1F2937' },
						div: { color: isDark ? '#D8E2E6' : '#1F2937' },
						span: { color: isDark ? '#D8E2E6' : '#1F2937' },
						p: {
							marginTop: 0,
							marginBottom: 16,
							color: isDark ? '#D8E2E6' : '#1F2937',
						},
						strong: { color: isDark ? '#ECF4F7' : '#111827' },
						em: { fontStyle: 'italic', color: isDark ? '#D8E2E6' : '#1F2937' },
						a: {
							color: isDark ? customColor['patchwork-soft-primary'] : ACCENT,
							textDecorationLine: 'underline',
						},
						h1: {
							color: isDark ? '#ECF4F7' : '#111827',
							fontSize: 20,
							fontWeight: '700',
							marginBottom: 12,
							marginTop: 8,
						},
						h2: {
							color: isDark ? '#ECF4F7' : '#111827',
							fontSize: 18,
							fontWeight: '700',
							marginBottom: 10,
							marginTop: 8,
						},
						h3: {
							color: isDark ? '#ECF4F7' : '#111827',
							fontSize: 16,
							fontWeight: '600',
							marginBottom: 8,
							marginTop: 6,
						},
						h4: {
							color: isDark ? '#E6F0F4' : '#111827',
							fontSize: 15,
							fontWeight: '600',
							marginBottom: 8,
							marginTop: 6,
						},
						ul: { marginBottom: 12, color: isDark ? '#D8E2E6' : '#1F2937' },
						ol: { marginBottom: 12, color: isDark ? '#D8E2E6' : '#1F2937' },
						li: { marginBottom: 6, color: isDark ? '#D8E2E6' : '#1F2937' },
						blockquote: {
							borderLeftWidth: 3,
							borderLeftColor: isDark
								? customColor['patchwork-soft-primary']
								: ACCENT,
							paddingLeft: 12,
							marginLeft: 0,
							opacity: 0.9,
							color: isDark ? '#C5D5DC' : '#374151',
						},
						code: {
							color: isDark ? '#E8F4F8' : '#0F172A',
							backgroundColor: isDark ? '#24343B' : '#F3F4F6',
							paddingHorizontal: 4,
							paddingVertical: 2,
							borderRadius: 4,
						},
						pre: {
							color: isDark ? '#E8F4F8' : '#0F172A',
							backgroundColor: isDark ? '#1E2D33' : '#F8FAFC',
							padding: 12,
							borderRadius: 8,
							marginBottom: 12,
						},
						figcaption: {
							color: isDark ? '#9FB3BC' : '#6B7280',
							fontSize: 12,
							marginTop: 6,
						},
						figure: { marginLeft: 0, marginRight: 0 },
					}}
					renderersProps={{
						a: {
							onPress: (_, href) => {
								if (href) {
									navigation.navigate('WebViewer', {
										url: href,
									});
								}
							},
						},
					}}
				/>
			</ScrollView>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	header: {
		marginHorizontal: 16,
		marginTop: 0,
		marginBottom: 0,
		height: 56,
	},
	headerTitle: {
		fontSize: 10,
		letterSpacing: 1.2,
	},
	contentContainer: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 48,
	},
	date: {
		color: '#9CA3AF',
		fontSize: 12,
		marginBottom: 12,
	},
	title: {
		color: '#111827',
		fontSize: 22,
		lineHeight: 32,
		marginBottom: 20,
	},
	divider: {
		height: 3,
		width: 40,
		borderRadius: 2,
		backgroundColor: ACCENT,
		marginBottom: 24,
	},
	barStyle: {
		color: '#1F2937',
		fontSize: 15,
		lineHeight: 26,
	},
});

export default WpNewsDetail;
