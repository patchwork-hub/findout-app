import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useEventImage } from '@/hooks/queries/wpFeed.queries';
import { HomeStackParamList } from '@/types/navigation';
import { stripHtml } from '@/util/helper/helper';
import {
	getDateRange,
	getEventWebsiteUrl,
	getEventLocationLabel,
	isZoomLink,
	parseExcerpt,
} from '@/util/helper/wpContent';
import {
	faArrowUpRightFromSquare,
	faCalendarDays,
	faChevronLeft,
	faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import {
	Alert,
	Image as RNImage,
	Linking,
	Pressable,
	ScrollView,
	StatusBar,
	View,
	useWindowDimensions,
	StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import customColor from '@/util/constant/color';

const PRIMARY = '#033E45';
const ACCENT = '#C8E45A';
const CSID_LOGO = require('../../../assets/images/CSIDSlogan.png') as number;

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

type RouteProps = RouteProp<HomeStackParamList, 'ProjectsEventsDetail'>;

const toEventItem = (params: {
	imageUrl?: string;
	excerpt: string;
	content: string;
}): Patchwork.WPPost =>
	({
		id: 0,
		_embedded: params.imageUrl
			? { 'wp:featuredmedia': [{ source_url: params.imageUrl }] }
			: undefined,
		excerpt: { rendered: params.excerpt },
		content: { rendered: params.content },
		title: { rendered: '' },
	} as unknown as Patchwork.WPPost);

const ProjectsEventsDetail = () => {
	const route = useRoute<RouteProps>();
	const navigation = useNavigation();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const { title, date, excerpt, content, imageUrl, acf, meta } = route.params;

	const eventItem = useMemo(
		() => toEventItem({ imageUrl, excerpt, content: content || '' }),
		[imageUrl, excerpt, content],
	);
	const { isCsidInternal, isLoadingOg, faviconUrl, primaryImageUrl } =
		useEventImage(eventItem);

	const dateRange = useMemo(
		() => getDateRange(date, acf, meta),
		[date, acf, meta],
	);
	const { description, location } = useMemo(
		() => parseExcerpt(excerpt),
		[excerpt],
	);
	const websiteUrl = useMemo(
		() => getEventWebsiteUrl(excerpt, content),
		[excerpt, content],
	);
	const displayLocation = useMemo(
		() => getEventLocationLabel(location, websiteUrl),
		[location, websiteUrl],
	);
	const learnMoreLabel = useMemo(
		() =>
			isZoomLink(websiteUrl)
				? t('home.join_zoom', { defaultValue: 'Join Zoom' })
				: t('home.visit_website', { defaultValue: 'Visit Website' }),
		[websiteUrl, t],
	);

	const heroHeight = clamp(Math.round(width * 0.72), 260, 400);
	const cleanTitle = useMemo(() => stripHtml(title), [title]);
	const hasPhotoHero =
		!isCsidInternal && !isLoadingOg && Boolean(primaryImageUrl);
	const isDark = colorScheme === 'dark';

	const handleLearnMore = useCallback(async () => {
		if (!websiteUrl) return;
		let url = websiteUrl.trim();
		if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
		try {
			const supported = await Linking.canOpenURL(url);
			if (!supported) {
				Alert.alert(
					t('common.error', { defaultValue: 'Error' }),
					t('common.could_not_open_link', {
						defaultValue: 'Could not open this link.',
					}),
				);
				return;
			}
			await Linking.openURL(url);
		} catch {
			Alert.alert(
				t('common.error', { defaultValue: 'Error' }),
				t('common.could_not_open_link', {
					defaultValue: 'Could not open this link.',
				}),
			);
		}
	}, [websiteUrl, t]);

	const renderHeroImage = () => {
		if (isCsidInternal) {
			return (
				<View style={[styles.faviconCon, { width, height: heroHeight }]}>
					<RNImage
						source={CSID_LOGO}
						style={{ width: width * 0.5, height: 80 }}
						resizeMode="contain"
					/>
				</View>
			);
		}
		if (isLoadingOg) {
			return (
				<View style={{ width, height: heroHeight, backgroundColor: PRIMARY }} />
			);
		}
		if (faviconUrl && !primaryImageUrl) {
			const frameSize = Math.round(heroHeight * 0.32);
			return (
				<View style={[styles.faviconCon, { width, height: heroHeight }]}>
					<View
						style={[
							styles.faviconImg,
							{
								width: frameSize,
								height: frameSize,
								borderRadius: Math.round(frameSize * 0.18),
							},
						]}
					>
						<Image
							uri={faviconUrl}
							style={{
								width: Math.round(frameSize * 0.72),
								height: Math.round(frameSize * 0.72),
							}}
							resizeMode="contain"
							fallbackType="channels"
						/>
					</View>
				</View>
			);
		}
		return (
			<Image
				uri={primaryImageUrl}
				style={{ width, height: heroHeight }}
				resizeMode="cover"
				fallbackType="channels"
			/>
		);
	};

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: isDark
					? customColor['patchwork-dark-100']
					: customColor['patchwork-light-900'],
			}}
		>
			<StatusBar
				barStyle={isDark ? 'light-content' : 'dark-content'}
				translucent
				backgroundColor="transparent"
			/>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={{ height: heroHeight }}>
					{renderHeroImage()}

					{hasPhotoHero && (
						<LinearGradient
							colors={['transparent', 'rgba(3,62,69,0.92)']}
							start={{ x: 0.5, y: 0.25 }}
							end={{ x: 0.5, y: 1 }}
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								top: 0,
								bottom: 0,
							}}
						/>
					)}

					{/* Back button */}
					<Pressable
						onPress={() => navigation.goBack()}
						style={[styles.backButton, { top: insets.top + 3 }]}
					>
						<FontAwesomeIcon icon={faChevronLeft} size={16} color="#FFFFFF" />
					</Pressable>

					{/* Date badge + title */}
					<View style={styles.contentCon}>
						{dateRange ? (
							<View style={styles.dateRange}>
								<FontAwesomeIcon
									icon={faCalendarDays}
									size={11}
									color={PRIMARY}
									style={{ marginRight: 5 }}
								/>
								<ThemeText
									className="font-OpenSans_SemiBold"
									size="xs_12"
									style={{ color: PRIMARY }}
								>
									{dateRange}
								</ThemeText>
							</View>
						) : null}

						<ThemeText
							className="font-Oswald_Bold"
							size="xl_24"
							style={{ color: '#FFFFFF', lineHeight: 32 }}
							numberOfLines={4}
						>
							{cleanTitle}
						</ThemeText>
					</View>
				</View>

				{/* ── Content card: ---*/}
				<View style={{ marginTop: -24 }}>
					<View
						style={[
							styles.cardCon,
							{
								backgroundColor: isDark
									? customColor['patchwork-dark-400']
									: '#FFFFFF',
							},
						]}
					>
						{displayLocation ? (
							<View
								style={[
									styles.locationRow,
									{
										borderBottomColor: isDark ? '#2A3E45' : '#F0F0F0',
									},
								]}
							>
								<View
									style={[
										styles.locationIcon,
										{
											backgroundColor: isDark
												? 'rgba(111,209,203,0.16)'
												: `${PRIMARY}12`,
										},
									]}
								>
									<FontAwesomeIcon
										icon={faLocationDot}
										size={13}
										color={
											isDark ? customColor['patchwork-soft-primary'] : PRIMARY
										}
									/>
								</View>
								<ThemeText
									className="font-OpenSans_Regular flex-1"
									size="sm_14"
									style={{
										color: isDark ? '#D6E3E8' : '#334155',
										lineHeight: 22,
									}}
								>
									{displayLocation}
								</ThemeText>
							</View>
						) : null}
						{description ? (
							<ThemeText
								className="font-OpenSans_Regular"
								size="fs_13"
								style={{
									color: isDark ? '#C3D2D9' : '#334155',
									lineHeight: 26,
								}}
							>
								{description}
							</ThemeText>
						) : (
							<View style={{ alignItems: 'center', paddingVertical: 20 }}>
								<FontAwesomeIcon
									icon={faCalendarDays}
									size={32}
									color="#CBD5E1"
									style={{ marginBottom: 10 }}
								/>
								<ThemeText
									className="font-OpenSans_Regular"
									size="sm_14"
									style={[
										styles.noContentText,
										{ color: isDark ? '#9FB3BC' : '#94A3B8' },
									]}
								>
									{t('home.no_event_description', {
										defaultValue: 'More event details will be shared soon.',
									})}
								</ThemeText>
							</View>
						)}

						{/* Visit Website / Join Zoom button */}
						{websiteUrl ? (
							<Pressable onPress={handleLearnMore} style={styles.link}>
								<FontAwesomeIcon
									icon={faArrowUpRightFromSquare}
									size={12}
									style={{ marginRight: 8 }}
									color={
										isDark ? customColor['patchwork-soft-primary'] : '#010101'
									}
								/>
								<ThemeText
									className="font-Oswald"
									size="fs_13"
									style={{
										color: isDark
											? customColor['patchwork-soft-primary']
											: '#0000EE',
										letterSpacing: 0.5,
									}}
								>
									{learnMoreLabel}
									{/* {websiteUrl} */}
								</ThemeText>
							</Pressable>
						) : null}
					</View>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	backButton: {
		position: 'absolute',
		left: 16,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(0,0,0,0.28)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	contentCon: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 20,
		paddingBottom: 56,
	},
	dateRange: {
		alignSelf: 'flex-start',
		backgroundColor: ACCENT,
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 4,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	cardCon: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 8,
		// shadowColor: '#000',
		// shadowOffset: { width: 0, height: -2 },
		// shadowOpacity: 0.06,
		// shadowRadius: 8,
		// elevation: 4,
	},
	locationRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	locationIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: `${PRIMARY}12`,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 10,
	},
	noContentText: {
		color: '#94A3B8',
		textAlign: 'center',
		lineHeight: 22,
	},
	link: {
		marginTop: 20,
		// backgroundColor: PRIMARY,
		borderRadius: 14,
		paddingVertical: 15,
		flexDirection: 'row',
		alignItems: 'center',
		// justifyContent: 'center',
		// opacity: pressed ? 0.82 : 1,
	},
	faviconCon: {
		backgroundColor: PRIMARY,
		alignItems: 'center',
		justifyContent: 'center',
	},
	faviconImg: {
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.35)',
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default ProjectsEventsDetail;
