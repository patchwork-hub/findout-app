import { useState } from 'react';
import { Platform, View } from 'react-native';
import {
	FALLBACK_PREVIEW_IMAGE_URL,
	NEWSMAST_FALLBACK_PREVIEW_IMAGE_URL,
	CHANNELS_FALLBACK_PREVIEW_IMAGE_URL,
} from '@/util/constant';
import LinearGradient from 'react-native-linear-gradient';
import customColor from '@/util/constant/color';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { cn } from '@/util/helper/twutil';
import FastImage, { FastImageProps } from '@d11/react-native-fast-image';
import { useColorScheme } from 'nativewind';

interface ImageProps {
	uri?: string | number;
	resizeMode?: FastImageProps['resizeMode'];
	className?: string;
	fallbackType?: 'default' | 'newsmast' | 'channels';
	iconSize?: number;
}

const DefaultServerProfile = `${process.env.API_URL}/avatars/original/missing.png`;

const Image = ({
	uri = '',
	resizeMode,
	className,
	fallbackType = 'default',
	iconSize,
	...props
}: ImageProps & FastImageProps) => {
	const { colorScheme } = useColorScheme();
	const [loading, setLoading] = useState(false);
	const [isImageFailtoLoad, setImageError] = useState(false);

	const getFallbackImage = () => {
		switch (fallbackType) {
			case 'newsmast':
				return NEWSMAST_FALLBACK_PREVIEW_IMAGE_URL;
			case 'channels':
				return CHANNELS_FALLBACK_PREVIEW_IMAGE_URL;
			case 'default':
			default:
				return FALLBACK_PREVIEW_IMAGE_URL;
		}
	};

	const realUri =
		typeof uri === 'string' && uri.length > 0
			? uri
			: typeof props.source === 'object' && props.source?.uri
			? props.source.uri
			: '';

	const isRemoteUrl = realUri && typeof realUri === 'string';
	const isInvalidImage =
		!isRemoteUrl || (typeof realUri === 'string' && !realUri.includes('https'));

	const imageUrl =
		isImageFailtoLoad || isInvalidImage ? getFallbackImage() : realUri;

	const onLoadStart = () => setLoading(true);
	const onLoadEnd = () => setLoading(false);
	const onError = () => setImageError(true);

	const isImageMissing = imageUrl.includes('original/missing.png');
	if (isImageMissing) {
		return (
			<View
				className={cn(
					'w-[36] h-[36] rounded-full overflow-hidden items-center justify-center',
				)}
				{...props}
			>
				<LinearGradient
					colors={
						colorScheme == 'dark'
							? [
									customColor['patchwork-secondary'],
									customColor['patchwork-secondary'],
							  ]
							: [
									customColor['patchwork-secondary'],
									customColor['patchwork-secondary'],
							  ]
					}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="w-full h-full justify-center items-center"
				>
					<FontAwesomeIcon
						icon={AppIcons.avatar}
						size={iconSize || 35}
						color="#fff"
					/>
				</LinearGradient>
			</View>
		);
	}

	return (
		<>
			<FastImage
				className={`w-36 h-36 bg-slate-200 dark:bg-patchwork-dark-50`}
				source={{
					uri: imageUrl,
					priority: FastImage.priority.high,
					cache: FastImage.cacheControl.immutable,
				}}
				resizeMode={resizeMode ?? 'cover'}
				onLoadStart={onLoadStart}
				onLoadEnd={onLoadEnd}
				onError={onError}
				fallback={Platform.OS === 'android'}
				{...props}
			/>
		</>
	);
};

export default Image;
