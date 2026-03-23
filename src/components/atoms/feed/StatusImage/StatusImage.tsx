import { Pressable, View } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { Blurhash } from 'react-native-blurhash';
import SensitiveMedia from '../SensitiveMedia/SesitiveMedia';
import ThemeImage from '../../common/ThemeImage/ThemeImage';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { AltTextModal } from '../AltTextModal/AltTextModal';
import {
	updateSensitiveImageCache,
	updateShowAltTextModalCache,
	rehideSensitiveImageCache,
} from '@/util/cache/feed/feedCache';
import {
	calculateHeightForBlurHash,
	statusImageFullHeight,
	statusImageHalfHeight,
} from '@/util/helper/statusImageHelpers';
import { useState } from 'react';
import { BlurImageIcon } from '@/util/svg/icon.common';

type Props = {
	statusId: string;
	media_attachments: Patchwork.Attachment[];
	sensitive: boolean;
	isPinPost?: boolean;
	isFromQuoteCompose?: boolean;
};

type NavigationProps = StackNavigationProp<RootStackParamList>;

const StatusImage = ({
	media_attachments,
	sensitive,
	statusId,
	isPinPost = false,
	isFromQuoteCompose = false,
}: Props) => {
	const navigation = useNavigation<NavigationProps>();
	const length = media_attachments.length;
	const [showPinPostAltText, setPinPostAltText] = useState<boolean>(false);

	const showAltTextModal = (attachment: Patchwork.Attachment) => {
		isPinPost
			? setPinPostAltText(true)
			: updateShowAltTextModalCache(statusId, attachment, true);
	};
	const hideAltTextModal = (attachment: Patchwork.Attachment) => {
		isPinPost
			? setPinPostAltText(false)
			: updateShowAltTextModalCache(statusId, attachment, false);
	};

	// State for sensitive media
	const imageSensitiveState = media_attachments.reduce((state, attachment) => {
		state[attachment.id] = attachment.sensitive!;
		return state;
	}, {} as Record<string, boolean>);

	// Handlers
	const onForceViewSensitiveMedia = (attachment: Patchwork.Attachment) => {
		updateSensitiveImageCache(statusId, attachment);
	};

	const onRehideSensitiveMedia = (attachment: Patchwork.Attachment) => {
		rehideSensitiveImageCache(statusId, attachment);
	};

	const navigateToImagesViewer = (id: string) => {
		navigation.navigate('ImageViewer', {
			imageUrls: media_attachments.map(attachment => ({
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

	// Render Items
	const renderImage = (
		item: Patchwork.Attachment,
		imageStyle: any,
		index: number,
	) => {
		const isSensitive = sensitive && !imageSensitiveState[item.id];
		const imageAttachmentUrl = {
			uri: item.url || item.remote_url,
		};

		const isPortrait = item?.meta?.original
			? item.meta.original.width < item.meta.original.height
			: item?.type === 'image';

		const renderSensitiveImage = () => (
			<>
				<Blurhash
					blurhash={item.blurhash as string}
					style={{
						height: calculateHeightForBlurHash(
							media_attachments.length,
							index,
							isPortrait,
						),
					}}
				/>
				<SensitiveMedia
					mediaType="photo"
					onViewSensitiveContent={() => onForceViewSensitiveMedia(item)}
				/>
			</>
		);

		const renderNonSensitiveImage = () => (
			<View
				style={[
					imageStyle,
					item.blurhash && {
						overflow: 'hidden',
						width: '100%',
						height: '100%',
					},
				]}
			>
				<ThemeImage
					url={imageAttachmentUrl.uri!}
					blurHash={item.blurhash}
					imageStyle={{
						width: '100%',
						height: calculateHeightForBlurHash(
							media_attachments.length,
							index,
							isPortrait,
						),
						...imageStyle,
					}}
				/>
				{item.description && (
					<Pressable
						onPress={() => showAltTextModal(item)}
						className="bg-[#36466366] border border-patchwork-grey-50 px-1.5 py-0.5 flex-row items-center rounded-lg justify-center absolute left-2 bottom-2 active:opacity-40"
						disabled={isFromQuoteCompose}
					>
						<ThemeText size={'xs_12'} className="ml-1 text-white">
							ALT
						</ThemeText>
					</Pressable>
				)}
				{(isPinPost
					? showPinPostAltText
					: item?.custom?.isShowAltTextModal) && (
					<AltTextModal
						onClose={() => hideAltTextModal(item)}
						altText={item.description || ''}
					/>
				)}
				{item.sensitive && (
					<Pressable
						onPress={() => onRehideSensitiveMedia(item)}
						className="flex-row items-center space-x-1 absolute bottom-2 right-2 bg-[#00000066] px-3 py-2 rounded-md active:opacity-40"
					>
						<BlurImageIcon />
						<ThemeText size={'xs_12'} className="text-white">
							Hide again
						</ThemeText>
					</Pressable>
				)}
			</View>
		);

		if (item.type === 'image') {
			return (
				<Pressable
					onPress={() => !isSensitive && navigateToImagesViewer(item.id)}
					style={{ flex: 1 }}
					disabled={isFromQuoteCompose}
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
		<View className="flex-1 rounded-xl overflow-hidden mt-1 mb-2 border border-slate-200 dark:border-patchwork-dark-400">
			{length === 3 ? (
				<View className="flex-1 flex-row space-x-1">
					{renderImage(
						media_attachments[0],
						[{ height: statusImageFullHeight }],
						0,
					)}
					<View className="flex-1 space-y-1">
						{renderImage(
							media_attachments[1],
							[{ height: statusImageHalfHeight }],
							1,
						)}
						{renderImage(
							media_attachments[2],
							[{ height: statusImageHalfHeight }],
							2,
						)}
					</View>
				</View>
			) : length === 4 ? (
				<View className="flex-1 flex-row space-x-1">
					<View className="flex-1 space-y-1">
						{renderImage(
							media_attachments[0],
							[{ height: statusImageHalfHeight }],
							0,
						)}
						{renderImage(
							media_attachments[1],
							[{ height: statusImageHalfHeight }],
							1,
						)}
					</View>
					<View className="flex-1 space-y-1">
						{renderImage(
							media_attachments[2],
							[{ height: statusImageHalfHeight }],
							2,
						)}
						{renderImage(
							media_attachments[3],
							[{ height: statusImageHalfHeight }],
							3,
						)}
					</View>
				</View>
			) : (
				<View className="flex-1 flex-row space-x-1">
					{media_attachments.map((attachment, index) => (
						<View key={index} className="flex-1">
							{renderImage(
								attachment,
								[{ height: statusImageFullHeight }],
								index,
							)}
						</View>
					))}
				</View>
			)}
		</View>
	);
};

export default StatusImage;
