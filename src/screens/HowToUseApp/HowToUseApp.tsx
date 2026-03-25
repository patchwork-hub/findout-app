import {
	ScrollView,
	View,
	Text,
	StyleSheet,
	Image as RNImage,
	StatusBar,
} from 'react-native';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Underline from '@/components/atoms/common/Underline/Underline';
import Header from '@/components/atoms/common/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

const HowToUseApp = () => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const screenBg = isDark
		? customColor['patchwork-dark-100']
		: customColor['patchwork-grey-50'];
	const contentBg = screenBg;
	const primary = isDark
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];
	const titleColor = isDark ? '#ECF4F7' : primary;
	const bodyColor = isDark ? '#D8E2E6' : '#333333';
	const subtitleColor = isDark ? '#B8C7CE' : '#333333';
	const dividerColor = isDark ? '#2A3E45' : '#D6D8DF';
	const tipBg = isDark ? '#23363D' : '#F0F0F0';
	const tipTextColor = isDark ? '#D8E2E6' : '#444444';
	const badgeBg = isDark ? '#2F4B50' : '#DCEFF0';
	const badgeTextColor = isDark ? '#EAF8FB' : customColor['patchwork-primary'];

	return (
		<SafeScreen style={{ backgroundColor: screenBg }}>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				translucent
				backgroundColor={screenBg}
			/>
			<View style={{ backgroundColor: screenBg }}>
				<Header
					leftCustomComponent={<BackButton />}
					// titleComponent={
					// 	<RNImage
					// 		source={
					// 			isDark
					// 				? require('../../../assets/images/CSIDSlogan-darkmode-6FD1CB.png')
					// 				: require('../../../assets/images/CSIDSlogan.png')
					// 		}
					// 		style={{ width: 130, height: 40 }}
					// 		resizeMode="contain"
					// 	/>
					// }
					titleComponent={
						<ThemeText className="font-BBHSansBogle_Regular text-2xl mr-3">
							Find Out Media
						</ThemeText>
					}
					style={styles.header}
				/>
			</View>
			<Underline />
			<ScrollView
				contentContainerStyle={[
					styles.container,
					{ backgroundColor: contentBg },
				]}
				showsVerticalScrollIndicator={false}
			>
				<Text style={[styles.title, { color: titleColor }]}>
					How to Use This App
				</Text>
				<Text style={[styles.subtitle, { color: subtitleColor }]}>
					Lorem ipsum dolor sit amet consectetur. Tortor enim nibh phasellus
					quam sed in tristique.
				</Text>

				<View style={[styles.divider, { backgroundColor: dividerColor }]} />

				{/* Section 1: Exploring Content */}
				<View style={styles.sectionHeader}>
					<View style={[styles.badge, { backgroundColor: badgeBg }]}>
						<Text style={[styles.badgeText, { color: badgeTextColor }]}>1</Text>
					</View>
					<Text style={[styles.sectionTitle, { color: primary }]}>
						Exploring Content
					</Text>
				</View>
				<Text style={[styles.body, { color: bodyColor }]}>
					Odio arcu in sed ornare. Ut tincidunt ultrices condimentum massa
					dictum. Ac pharetra tincidunt consectetur fringilla natoque vitae
					quisque mi. Mi feugiat consequat mattis leo.
				</Text>
				<View style={[styles.tipBox, { backgroundColor: tipBg }]}>
					<Text style={[styles.tipText, { color: tipTextColor }]}>
						Tip: Lorem ipsum dolor sit amet consectetur.
					</Text>
				</View>

				{/* Section 2: Following People */}
				<View style={styles.sectionHeader}>
					<View style={[styles.badge, { backgroundColor: badgeBg }]}>
						<Text style={[styles.badgeText, { color: badgeTextColor }]}>2</Text>
					</View>
					<Text style={[styles.sectionTitle, { color: primary }]}>
						Following People
					</Text>
				</View>
				<Text style={[styles.body, { color: bodyColor }]}>
					Odio arcu in sed ornare. Ut tincidunt ultrices condimentum massa
					dictum. Ac pharetra tincidunt consectetur fringilla natoque vitae
					quisque mi. Mi feugiat consequat mattis leo.
				</Text>
				{[
					'View profiles and expertise',
					'Follow to retrieve updates',
					'Message for collaboration',
				].map(item => (
					<View key={item} style={styles.bulletRow}>
						<FontAwesomeIcon icon={faCheckCircle} size={18} color={primary} />
						<Text style={[styles.bulletText, { color: bodyColor }]}>
							{item}
						</Text>
					</View>
				))}

				{/* Section 3: Navigation */}
				<View style={styles.sectionHeader}>
					<View style={[styles.badge, { backgroundColor: badgeBg }]}>
						<Text style={[styles.badgeText, { color: badgeTextColor }]}>3</Text>
					</View>
					<Text style={[styles.sectionTitle, { color: primary }]}>
						Navigation
					</Text>
				</View>
				<Text style={[styles.body, { color: bodyColor }]}>
					Lorem ipsum dolor sit amet consectetur. Aliquet id mauris pulvinar
					urna at blandit ipsum nec facilisis. Odio tellus netus elit integer
					lorem at. Amet vel rhoncus non vivamus morbi tempor.
				</Text>
			</ScrollView>
		</SafeScreen>
	);
};

const styles = StyleSheet.create({
	header: {
		marginHorizontal: 16,
		marginTop: 12,
		marginBottom: 12,
	},
	container: { padding: 20 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
	subtitle: { fontSize: 14, marginBottom: 16 },
	divider: { height: 1, marginBottom: 20 },
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		marginTop: 16,
	},
	badge: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	badgeText: { fontWeight: '700', fontSize: 14 },
	sectionTitle: { fontSize: 16, fontWeight: '700' },
	body: {
		fontSize: 14,
		lineHeight: 22,
		marginBottom: 12,
	},
	tipBox: {
		borderRadius: 8,
		padding: 12,
		marginBottom: 8,
	},
	tipText: { fontSize: 13 },
	bulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	bulletText: { fontSize: 14, marginLeft: 10 },
});

export default HowToUseApp;
