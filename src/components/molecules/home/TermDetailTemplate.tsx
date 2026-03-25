import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { getTermAccentColor } from '@/components/molecules/home/cardTheme';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faArrowUpRightFromSquare,
	faFileLines,
	faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import {
	Alert,
	Linking,
	Pressable,
	ScrollView,
	StatusBar,
	View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { normalizeUrl, stripHtml } from '@/util/helper/helper';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const BG = '#F6F8FA';
const SURFACE = '#FFFFFF';
const TEXT = '#1D2530';
const MUTED = '#5D6775';

type Props = {
	name: string;
	description?: string;
	link?: string;
	slug?: string;
	image?: string;
	icon: IconProp;
};

const getDomain = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

const TermDetailTemplate = ({
	name,
	description,
	link,
	slug,
	image,
	icon,
}: Props) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const accentColor = getTermAccentColor({ slug, name });
	const cleanDescription = stripHtml(description ?? '');
	const hasDescription = cleanDescription.length > 0;
	const websiteUrl = normalizeUrl(link);
	const hasWebsite = websiteUrl.length > 0;
	const domain = hasWebsite ? getDomain(websiteUrl) : 'No website available';
	const statusBarBackgroundColor = image ? 'transparent' : accentColor;
	const bgColor = isDark ? customColor['patchwork-dark-100'] : BG;
	const surfaceBg = isDark ? customColor['patchwork-dark-400'] : SURFACE;
	const textColor = isDark ? '#ECF4F7' : TEXT;
	const mutedColor = isDark ? '#B8C7CE' : MUTED;

	const onPressWebsite = async () => {
		if (!hasWebsite) return;
		const supported = await Linking.canOpenURL(websiteUrl);
		if (!supported) {
			Alert.alert('Invalid link', 'This website link is not available.');
			return;
		}
		await Linking.openURL(websiteUrl);
	};

	return (
		<SafeScreen style={{ backgroundColor: bgColor }}>
			<StatusBar
				barStyle="light-content"
				translucent
				backgroundColor={statusBarBackgroundColor}
			/>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
			>
				<View style={{ height: 250 }}>
					{image ? (
						<Image
							uri={image}
							style={{ width: '100%', height: '100%', position: 'absolute' }}
							resizeMode="cover"
							fallbackType="channels"
						/>
					) : (
						<LinearGradient
							colors={[accentColor, `${accentColor}C9`]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{ width: '100%', height: '100%', position: 'absolute' }}
						/>
					)}

					<LinearGradient
						colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.55)']}
						style={{ width: '100%', height: '100%', position: 'absolute' }}
					/>

					<View style={{ paddingTop: 8, paddingHorizontal: 12 }}>
						<BackButton />
					</View>

					<View className="absolute left-5 right-5 bottom-5">
						<View
							className="self-start items-center justify-center rounded-full mb-3"
							style={{ backgroundColor: 'rgba(255,255,255,0.24)' }}
						>
							<View
								style={{
									width: 34,
									height: 34,
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<FontAwesomeIcon icon={icon} size={13} color="#FFFFFF" />
							</View>
						</View>
						<ThemeText
							className="font-Oswald_Bold text-white"
							size="xl_24"
							numberOfLines={3}
							style={{ lineHeight: 31 }}
						>
							{name}
						</ThemeText>
					</View>
				</View>

				<View
					className="mx-4 rounded-2xl px-4 pt-4 pb-5"
					style={{
						backgroundColor: surfaceBg,
						marginTop: -14,
						shadowColor: '#000',
						shadowOpacity: 0.08,
						shadowRadius: 8,
						shadowOffset: { width: 0, height: 2 },
						elevation: 3,
					}}
				>
					<ThemeText
						className="font-Oswald_Bold mb-3"
						size="md_16"
						style={{ color: textColor }}
					>
						About
					</ThemeText>

					{hasDescription ? (
						<ThemeText
							className="font-OpenSans_Regular"
							size="sm_14"
							style={{ color: mutedColor, lineHeight: 24 }}
						>
							{cleanDescription}
						</ThemeText>
					) : (
						<View className="items-center py-3">
							<FontAwesomeIcon icon={faFileLines} size={28} color="#C6CEDA" />
							<ThemeText
								className="font-OpenSans_Regular mt-2"
								size="sm_14"
								style={{ color: isDark ? '#9FB3BC' : '#8E97A5' }}
							>
								No description available.
							</ThemeText>
						</View>
					)}

					{hasWebsite ? (
						<>
							<View
								className="flex-row items-center rounded-xl px-3 py-3 mt-5 mb-3"
								style={{ backgroundColor: isDark ? '#23363D' : '#F8FAFC' }}
							>
								<FontAwesomeIcon icon={faGlobe} size={14} color={accentColor} />
								<ThemeText
									className="font-OpenSans_Regular ml-2 flex-1"
									size="sm_14"
									numberOfLines={1}
									style={{ color: textColor }}
								>
									{domain}
								</ThemeText>
							</View>

							<Pressable
								onPress={onPressWebsite}
								className="flex-row items-center justify-center rounded-xl py-3"
								style={{ backgroundColor: accentColor }}
							>
								<ThemeText
									className="font-OpenSans_SemiBold text-white"
									size="sm_14"
								>
									Visit Website
								</ThemeText>
								<FontAwesomeIcon
									icon={faArrowUpRightFromSquare}
									size={11}
									color="#FFFFFF"
									style={{ marginLeft: 8 }}
								/>
							</Pressable>
						</>
					) : null}
				</View>
			</ScrollView>
		</SafeScreen>
	);
};

export default TermDetailTemplate;
