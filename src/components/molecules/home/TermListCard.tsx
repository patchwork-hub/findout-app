import Image from '@/components/atoms/common/Image/Image';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { getTermAccentColor } from '@/components/molecules/home/cardTheme';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faArrowUpRightFromSquare,
	faChevronDown,
	faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { normalizeUrl, stripHtml } from '@/util/helper/helper';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

type Props = {
	item: Patchwork.WPTerm;
	icon: IconProp;
	width: number;
	height: number;
	expanded?: boolean;
	onToggleExpand: () => void;
	onPressDetail?: () => void;
	showDetailAction?: boolean;
	marginRight?: number;
	marginBottom?: number;
};

const getDomain = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

const TermListCard = ({
	item,
	icon,
	width,
	height,
	expanded = false,
	onToggleExpand,
	onPressDetail,
	showDetailAction = true,
	marginRight = 0,
	marginBottom = 16,
}: Props) => {
	const { colorScheme } = useColorScheme();
	const accentColor = getTermAccentColor(item);
	const description = stripHtml(item.description ?? '');
	const isDark = colorScheme === 'dark';
	const websiteUrl = normalizeUrl(item.link);
	const hasWebsite = websiteUrl.length > 0;
	const domain = hasWebsite ? getDomain(websiteUrl) : '';

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
		<View
			style={[
				styles.container,
				{
					width,
					marginRight,
					marginBottom,
					backgroundColor: isDark
						? customColor['patchwork-dark-400']
						: '#FFFFFF',
				},
			]}
		>
			<Pressable
				onPress={onToggleExpand}
				accessibilityLabel={item.name}
				accessibilityRole="button"
				className="active:opacity-95"
				style={{ height }}
			>
				{item.image ? (
					<Image
						uri={item.image}
						style={{ width, height, position: 'absolute' }}
						resizeMode="cover"
						fallbackType="channels"
					/>
				) : (
					<>
						<LinearGradient
							colors={[accentColor, `${accentColor}CC`]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{ width, height, position: 'absolute' }}
						/>
						<View
							className="absolute items-center justify-center"
							style={{ width, height }}
						>
							<FontAwesomeIcon
								icon={icon}
								size={48}
								color="rgba(255,255,255,0.14)"
							/>
						</View>
					</>
				)}

				<LinearGradient
					colors={['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.72)']}
					style={{ width, height, position: 'absolute' }}
				/>

				<View className="absolute bottom-0 left-0 right-0 flex-row items-end p-4">
					<View className="flex-1 mr-3">
						<ThemeText
							className="font-Oswald_Medium text-white"
							size="md_16"
							numberOfLines={2}
						>
							{item.name}
						</ThemeText>
						{description ? (
							<ThemeText
								className="font-OpenSans_Regular text-white mt-1"
								size="xs_12"
								numberOfLines={1}
								style={{ opacity: 0.9 }}
							>
								{description}
							</ThemeText>
						) : null}
					</View>
					<View
						className="rounded-full items-center justify-center"
						style={styles.icon}
					>
						<FontAwesomeIcon
							icon={faChevronDown}
							size={10}
							color="#FFFFFF"
							style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
						/>
					</View>
				</View>
			</Pressable>

			{expanded ? (
				<View
					className="px-3 pb-3 pt-3"
					style={{
						backgroundColor: isDark
							? customColor['patchwork-dark-400']
							: '#FFFFFF',
					}}
				>
					{description ? (
						<ThemeText
							className="font-OpenSans_Regular"
							size="sm_14"
							numberOfLines={4}
							style={{
								color: isDark ? '#B8C7CE' : '#5D6775',
								lineHeight: 21,
							}}
						>
							{description}
						</ThemeText>
					) : (
						<ThemeText
							className="font-OpenSans_Regular"
							size="sm_14"
							style={{ color: isDark ? '#9FB3BC' : '#8E97A5' }}
						>
							No description available.
						</ThemeText>
					)}

					{hasWebsite ? (
						<Pressable
							onPress={onPressWebsite}
							className="mt-3 flex-row items-center rounded-lg px-3 py-2.5"
							style={{ backgroundColor: isDark ? '#23363D' : '#F8FAFC' }}
						>
							<FontAwesomeIcon icon={faGlobe} size={13} color={accentColor} />
							<ThemeText
								className="font-OpenSans_Regular ml-2 flex-1"
								size="sm_14"
								numberOfLines={1}
								style={{ color: isDark ? '#ECF4F7' : '#1D2530' }}
							>
								{domain}
							</ThemeText>
							<FontAwesomeIcon
								icon={faArrowUpRightFromSquare}
								size={11}
								color={accentColor}
							/>
						</Pressable>
					) : null}

					{/* {showDetailAction && onPressDetail ? (
						<Pressable
							onPress={onPressDetail}
							className="mt-2 items-center justify-center rounded-lg py-2.5"
							style={{ backgroundColor: accentColor }}
						>
							<ThemeText
								className="font-OpenSans_SemiBold text-white"
								size="sm_14"
							>
								More details
							</ThemeText>
						</Pressable>
					) : null} */}
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignSelf: 'flex-start',
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
	},
	icon: {
		width: 34,
		height: 34,
		backgroundColor: 'rgba(255,255,255,0.25)',
		borderRadius: 100,
	},
});
export default TermListCard;
