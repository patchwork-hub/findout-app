import Image from '@/components/atoms/common/Image/Image';
import { Image as RNImage, StyleSheet, View } from 'react-native';

type EventImageViewProps = {
	width: number;
	height: number;
	isCsidInternal: boolean;
	isLoadingOg: boolean;
	faviconUrl?: string;
	primaryImageUrl?: string;
	cardBg?: string;
	csidLogoWidth?: number;
	csidLogoHeight?: number;
	faviconFrameSize?: number;
	faviconIconSize?: number;
	csidLogoBg?: string;
};

const EventImageView = ({
	width,
	height,
	isCsidInternal,
	isLoadingOg,
	faviconUrl,
	primaryImageUrl,
	cardBg = '#033E45',
	csidLogoWidth = 130,
	csidLogoHeight = 50,
	faviconFrameSize = 88,
	faviconIconSize = 64,
	csidLogoBg,
}: EventImageViewProps) => {
	if (isCsidInternal) {
		return (
			<View
				style={{
					width,
					height,
					backgroundColor: csidLogoBg,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<RNImage
					source={require('../../../../assets/images/CSIDSlogan.png')}
					style={{ width: csidLogoWidth, height: csidLogoHeight }}
					resizeMode="contain"
				/>
			</View>
		);
	}

	if (isLoadingOg) {
		return <View style={{ width, height, backgroundColor: cardBg }} />;
	}

	if (faviconUrl) {
		const frameRadius = Math.round(faviconFrameSize * 0.18);
		return (
			<View
				style={[styles.faviconCon, { width, height, backgroundColor: cardBg }]}
			>
				<View
					style={[
						styles.faviconImg,
						{
							width: faviconFrameSize,
							height: faviconFrameSize,
							borderRadius: frameRadius,
						},
					]}
				>
					<Image
						uri={faviconUrl}
						style={{ width: faviconIconSize, height: faviconIconSize }}
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
			style={{ width, height }}
			resizeMode="cover"
			fallbackType="channels"
		/>
	);
};

const styles = StyleSheet.create({
	faviconCon: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	faviconImg: {
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.4)',
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default EventImageView;
