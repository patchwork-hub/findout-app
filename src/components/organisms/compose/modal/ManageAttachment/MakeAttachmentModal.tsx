import React from 'react';
import { Platform, View } from 'react-native';
import {
	Asset,
	launchCamera,
	launchImageLibrary,
} from 'react-native-image-picker';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import {
	useManageAttachmentActions,
	useManageAttachmentStore,
} from '@/store/compose/manageAttachments/manageAttachmentStore';
import { mediaUploadAction } from '@/util/helper/mediaUploadActions';
import {
	hasCameraPermission,
	hasMediaPermissions,
} from '@/util/helper/permission';
import { ComposeAddFileIcon } from '@/util/svg/icon.compose';
import { useColorScheme } from 'nativewind';
import { cn } from '@/util/helper/twutil';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';

type ManageAttachmentModalProps = {
	onToggleMediaModal: () => void;
	hideVideoUpload?: boolean;
};
const ManageAttachmentModal = ({
	onToggleMediaModal,
	hideVideoUpload = false,
}: ManageAttachmentModalProps) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const selectedMedia = useManageAttachmentStore(state => state.selectedMedia);
	const { onSelectMedia, onAddMedia } = useManageAttachmentActions();
	const hasVideo = selectedMedia.some(media => media.type?.startsWith('video'));
	const hasImages = selectedMedia.some(media =>
		media.type?.startsWith('image'),
	);
	const onPressCamera = async () => {
		if (Platform.OS === 'android' && !(await hasCameraPermission())) {
			return;
		}

		await launchCamera(mediaUploadAction.options, response => {
			if (response.assets) {
				onToggleMediaModal();
				selectedMedia.length > 0
					? onAddMedia(response.assets)
					: onSelectMedia(response.assets as Asset[]);
			}
		});
	};

	const onPressGallery = async () => {
		if (Platform.OS === 'android' && !(await hasMediaPermissions())) {
			return;
		}
		await launchImageLibrary(
			{
				...mediaUploadAction.options,
				mediaType: 'photo',
				selectionLimit: 4 - selectedMedia.length,
			},
			response => {
				if (response.assets) {
					onToggleMediaModal();
					selectedMedia.length > 0
						? onAddMedia(response.assets)
						: onSelectMedia(response.assets as Asset[]);
				}
			},
		);
	};

	const onPressVideo = async () => {
		if (Platform.OS === 'android' && !(await hasMediaPermissions())) {
			return;
		}
		await launchImageLibrary(
			{
				...mediaUploadAction.options,
				mediaType: 'video',
				selectionLimit: 1,
				videoQuality: 'high',
			},
			response => {
				handleMediaSelection(response.assets as Asset[]);
			},
		);
	};

	const handleMediaSelection = (assets: Asset[]) => {
		if (!assets) return;
		onToggleMediaModal();
		selectedMedia.length > 0
			? onAddMedia(assets)
			: onSelectMedia(assets as Asset[]);
	};

	const onPressFile = async () => {
		if (Platform.OS === 'android' && !(await hasMediaPermissions())) {
			return;
		}
		await launchImageLibrary(
			{
				...mediaUploadAction.options,
				mediaType: 'video',
				selectionLimit: 1,
			},
			response => {
				if (response.assets) {
					onToggleMediaModal();
					selectedMedia.length > 0
						? onAddMedia(response.assets)
						: onSelectMedia(response.assets as Asset[]);
				}
			},
		);
	};

	return (
		<View>
			<View className="flex-row items-center justify-between mb-3 bg-blue">
				<View className="w-1/2 gap-2">
					<Button
						className="flex-row items-center"
						variant={'outline'}
						onPress={onPressCamera}
						disabled={hasVideo}
					>
						<FontAwesomeIcon
							icon={AppIcons.camera}
							size={18}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
						<ThemeText
							className={cn(
								'pl-2',
								colorScheme === 'dark'
									? 'text-white'
									: 'text-patchwork-dark-100',
							)}
						>
							{t('compose.take_a_photo')}
						</ThemeText>
					</Button>
				</View>
				<View className="w-1/2 gap-2">
					<Button
						className="flex-row items-center"
						variant={'outline'}
						onPress={onPressGallery}
						disabled={hasVideo}
					>
						<FontAwesomeIcon
							icon={AppIcons.images}
							size={18}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
						<ThemeText
							className={cn(
								'pl-2',
								colorScheme === 'dark'
									? 'text-white'
									: 'text-patchwork-dark-100',
							)}
						>
							{t('compose.open_gallery')}
						</ThemeText>
					</Button>
				</View>
			</View>
			{!hideVideoUpload && (
				<View className="w-full">
					<Button
						className="flex-row items-center"
						variant={'outline'}
						onPress={onPressVideo}
						disabled={hasImages || hasVideo}
					>
						<ComposeAddFileIcon {...{ colorScheme }} />
						<ThemeText
							className={cn(
								'pl-2',
								colorScheme === 'dark'
									? 'text-white'
									: 'text-patchwork-dark-100',
							)}
						>
							{t('compose.add_file')}
						</ThemeText>
					</Button>
				</View>
			)}
		</View>
	);
};

export default ManageAttachmentModal;
