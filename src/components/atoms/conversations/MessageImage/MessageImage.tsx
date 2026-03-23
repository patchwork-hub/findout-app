import { calculateImageWidth } from '@/util/helper/compose';
import { cn } from '@/util/helper/twutil';
import { Pressable, StyleProp, View, ViewProps } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { memo, useState } from 'react';
import { Blurhash } from 'react-native-blurhash';
import { useNavigation } from '@react-navigation/native';
import { isTablet } from '@/util/helper/isTablet';
import {
	calculateHeightForBlurHash,
	isSinglePortraitImage,
	statusImageFullHeight,
	statusImageHalfHeight,
} from '@/util/helper/statusImageHelpers';
import SensitiveMedia from '../../feed/SensitiveMedia/SesitiveMedia';
import customColor from '@/util/constant/color';
import { ImageStyle } from 'react-native';
import { useSensitiveMediaStore } from '@/store/feed/sensitiveMediaStore';

type Props = {
	message: Patchwork.Status;
	isOwnMessage: boolean;
	isGroupChat: boolean;
} & ViewProps;

const MessageImage = ({
	message,
	isOwnMessage,
	isGroupChat,
	...props
}: Props) => {
	const navigation = useNavigation();
	const [imageLoaded, setImageLoaded] = useState(false);
	const { sensitiveMedia, toggleSensitiveMedia } = useSensitiveMediaStore();

	const portraitImageClassName = isSinglePortraitImage(
		message.media_attachments,
	)
		? isTablet
			? 'h-[760px]'
			: 'h-[371.2px]'
		: 'h-[232px]';
	const length = message.media_attachments.length;

	// Handlers
	const imageOnLoad = () => {
		setImageLoaded(true);
	};

	const onForceViewSensitiveMedia = (imageId: string) => {
		toggleSensitiveMedia(imageId);
	};

	const navigateToImagesViewer = (id: string) => {
		navigation.navigate('ImageViewer', {
			imageUrls: message?.media_attachments?.map(attachment => ({
				id: attachment.id,
				preview_url: attachment.preview_url,
				url: attachment.url,
				remote_url: attachment.remote_url,
				width: attachment.meta?.original?.width,
				height: attachment.meta?.original?.height,
				sensitive: attachment.sensitive,
			})),
			id,
		});
	};

	// State for sensitive media
	const imageSensitiveState = message?.media_attachments.reduce(
		(state, attachment) => {
			state[attachment.id] =
				sensitiveMedia[attachment.id] ?? attachment.sensitive;
			return state;
		},
		{} as Record<string, boolean>,
	);

	// Render Items
	const renderImage = (
		item: Patchwork.Attachment,
		imageStyle: any,
		index: number,
	) => {
		const isSensitive = message?.sensitive && !imageSensitiveState[item.id];
		const imageAttachmentUrl = {
			uri: item.url || item.remote_url,
		};

		const isPortrait = item?.meta?.original
			? item.meta.original.width < item.meta.original.height
			: item?.type === 'image';

		const explicitHeight = calculateHeightForBlurHash(
			message?.media_attachments.length,
			index,
			isPortrait,
		);

		const renderSensitiveImage = () => (
			<>
				<Blurhash
					blurhash={item.blurhash as string}
					style={{
						height: explicitHeight,
						width: '100%',
					}}
				/>
				<SensitiveMedia
					onViewSensitiveContent={() => onForceViewSensitiveMedia(item.id)}
					mediaType="photo"
				/>
			</>
		);

		const renderNonSensitiveImage = () => (
			<View
				style={[
					imageStyle,
					{
						height: explicitHeight,
						width: '100%',
						overflow: 'hidden',
						backgroundColor: customColor['patchwork-dark-50'],
					},
				]}
			>
				<>
					<FastImage
						source={{
							uri: imageAttachmentUrl.uri!,
						}}
						style={{
							width: '100%',
							height: '100%',
						}}
						resizeMode={FastImage.resizeMode.cover}
						onLoad={imageOnLoad}
					/>
					{item.blurhash && !imageLoaded && (
						<BlurHashComponent
							blurHash={item.blurhash}
							imageStyle={{ width: '100%', height: '100%' }}
						/>
					)}
				</>
			</View>
		);

		if (item.type === 'image') {
			return (
				<Pressable
					onPress={() => !isSensitive && navigateToImagesViewer(item.id)}
					style={{ flex: 1 }}
				>
					{isSensitive ? renderSensitiveImage() : renderNonSensitiveImage()}
				</Pressable>
			);
		}

		if (item.url?.match(/.(?:a?png|jpe?g|webp|avif|heic|gif|svg|ico|icns)$/i)) {
			return (
				<FastImage
					source={imageAttachmentUrl}
					resizeMode="cover"
					style={imageStyle}
				/>
			);
		} else {
			return (
				<FastImage
					source={{ uri: item.preview_url }}
					resizeMode="cover"
					style={imageStyle}
				/>
			);
		}
	};

	return (
		<View
			className={cn(
				'mb-1',
				isOwnMessage ? 'items-end' : 'items-start ml-2',
				isGroupChat && 'ml-10',
			)}
		>
			{length === 3 ? (
				<View className="flex-row w-10/12 space-x-1 rounded-xl overflow-hidden border-[0.5px] border-patchwork-grey-100">
					{renderImage(
						message.media_attachments[0],
						cn('flex-1', statusImageFullHeight),
						0,
					)}
					<View className="flex-1 space-y-1">
						{renderImage(
							message.media_attachments[1],
							cn('flex-1', statusImageHalfHeight),
							1,
						)}
						{renderImage(
							message.media_attachments[2],
							cn('flex-1', statusImageHalfHeight),
							2,
						)}
					</View>
				</View>
			) : length === 4 ? (
				<View className="flex-row w-10/12 space-x-1 rounded-xl overflow-hidden border-[0.5px] border-patchwork-grey-100">
					<View className="flex-1 space-y-1">
						{renderImage(
							message.media_attachments[0],
							cn('flex-1', statusImageHalfHeight),
							0,
						)}
						{renderImage(
							message.media_attachments[1],
							cn('flex-1', statusImageHalfHeight),
							1,
						)}
					</View>
					<View className="flex-1 space-y-1">
						{renderImage(
							message.media_attachments[2],
							cn('flex-1', statusImageHalfHeight),
							2,
						)}
						{renderImage(
							message.media_attachments[3],
							cn('flex-1', statusImageHalfHeight),
							3,
						)}
					</View>
				</View>
			) : length === 1 ? (
				<View className="w-10/12 flex-row flex-wrap rounded-xl overflow-hidden border-[0.5px] border-patchwork-grey-100">
					{renderImage(message.media_attachments[0], 'w-full', 0)}
				</View>
			) : (
				<View className="flex-row w-10/12 space-x-1 rounded-xl overflow-hidden border-[0.5px] border-patchwork-grey-100">
					{message.media_attachments.map((item, idx) => (
						<View key={item.id || idx} style={{ flex: 1 }}>
							{renderImage(item, cn('flex-1', portraitImageClassName), idx)}
						</View>
					))}
				</View>
			)}
		</View>
	);
};
export default memo(MessageImage);

const BlurHashComponent = ({
	blurHash,
	imageStyle,
}: {
	blurHash: string;
	imageStyle: StyleProp<ImageStyle>;
}) => {
	return (
		<Blurhash
			decodeAsync
			blurhash={blurHash}
			style={[
				{ position: 'absolute', width: '100%', height: '100%' },
				imageStyle,
			]}
		/>
	);
};
