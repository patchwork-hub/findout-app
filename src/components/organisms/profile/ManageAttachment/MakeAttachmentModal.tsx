import React from 'react';
import { Platform, View } from 'react-native';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import {
	hasCameraPermission,
	hasMediaPermissions,
} from '@/util/helper/permission';
import {
	ComposeCameraIcon,
	ComposeOpenGalleryIcon,
} from '@/util/svg/icon.compose';
import { useColorScheme } from 'nativewind';
import { useProfileMediaActions } from '@/store/profile/useProfileMediaStore';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { PreviewImageIcon } from '@/util/svg/icon.profile';
import { useNavigation } from '@react-navigation/native';
import { DeleteIcon } from '@/util/svg/icon.common';
import { Asset } from 'react-native-image-picker';
import { cn } from '@/util/helper/twutil';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';

type ManageAttachmentModalProps = {
	type: 'header' | 'avatar';
	onToggleMediaModal: () => void;
	imageUrl: string | null | Asset[];
	handleOnPressDelete: () => void;
};
const ManageAttachmentModal = ({
	type,
	onToggleMediaModal,
	imageUrl,
	handleOnPressDelete,
}: ManageAttachmentModalProps) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { onSelectMedia } = useProfileMediaActions();
	const navigation = useNavigation();

	const onPressCamera = async () => {
		if (Platform.OS === 'android' && !(await hasCameraPermission())) {
			return;
		}
		ImagePicker.openCamera({
			width: type === 'avatar' ? 300 : 1600,
			height: type === 'avatar' ? 300 : 700,
			cropping: true,
		})
			.then(response => {
				onToggleMediaModal();
				onSelectMedia(type, [
					{
						uri: response.path,
						type: response.mime,
						fileName: response.path.split('/').pop(),
					},
				]);
			})
			.catch(error => {
				Toast.show({
					type: 'errorToast',
					text1: error?.message || t('common.error'),
					position: 'top',
					visibilityTime: 1000,
					onHide: () => {},
				});
			});
	};

	const onPressGallery = async () => {
		if (Platform.OS === 'android' && !(await hasMediaPermissions())) {
			return;
		}
		ImagePicker.openPicker({
			width: type === 'avatar' ? 300 : 1600,
			height: type === 'avatar' ? 300 : 700,
			cropping: true,
		})
			.then(response => {
				onToggleMediaModal();
				onSelectMedia(type, [
					{
						uri: response.path,
						type: response.mime,
						fileName: response.path.split('/').pop(),
					},
				]);
			})
			.catch(error => {
				if (error.message.includes('User cancelled image selection')) {
					return;
				}
				Toast.show({
					type: 'errorToast',
					text1: error?.message || t('common.error'),
					position: 'top',
					visibilityTime: 1000,
					onHide: () => {},
				});
			});
	};

	const onPressPreview = () => {
		if (typeof imageUrl === 'string') {
			navigation.navigate('LocalImageViewer', {
				imageUrl: {
					url: imageUrl,
				},
			});
		}
		onToggleMediaModal();
	};

	return (
		<View>
			<View className="flex-row items-center justify-between mb-3">
				<View className="w-1/2 gap-2">
					<Button
						className="flex-row items-center"
						variant={'outline'}
						onPress={onPressCamera}
					>
						<FontAwesomeIcon
							icon={AppIcons.camera}
							size={16}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
						<ThemeText className="dark:text-white pl-2">
							{t('compose.take_a_photo')}
						</ThemeText>
					</Button>
				</View>
				<View className="w-1/2 gap-2">
					<Button
						className="flex-row items-center"
						variant={'outline'}
						onPress={onPressGallery}
					>
						<FontAwesomeIcon
							icon={AppIcons.images}
							size={16}
							color={colorScheme == 'dark' ? '#fff' : '#000'}
						/>
						<ThemeText className="dark:text-white pl-2">
							{t('compose.open_gallery')}
						</ThemeText>
					</Button>
				</View>
			</View>
			{!imageUrl?.includes('/original/missing.png') && imageUrl && (
				<View className="flex-row justify-between items-center mb-5">
					{typeof imageUrl === 'string' && (
						<View className="w-1/2 gap-2">
							<Button
								className="flex-row items-center"
								variant="outline"
								onPress={onPressPreview}
							>
								<FontAwesomeIcon
									icon={AppIcons.preview}
									size={14}
									color={colorScheme == 'dark' ? '#fff' : '#000'}
								/>
								<ThemeText className="dark:text-white pl-2">
									{t('compose.preview_image')}
								</ThemeText>
							</Button>
						</View>
					)}
					<View
						className={cn(
							`${typeof imageUrl === 'string' ? 'w-1/2 gap-2' : 'w-full'}`,
						)}
					>
						<Button
							className="flex-row items-center"
							variant={'outline'}
							onPress={handleOnPressDelete}
						>
							<FontAwesomeIcon
								icon={AppIcons.delete}
								size={14}
								color={colorScheme == 'dark' ? '#fff' : '#000'}
							/>
							<ThemeText className="dark:text-white pl-2">
								{t('compose.delete_image')}
							</ThemeText>
						</Button>
					</View>
				</View>
			)}
		</View>
	);
};

export default ManageAttachmentModal;
