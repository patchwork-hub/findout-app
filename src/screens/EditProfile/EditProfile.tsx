import React from 'react';
import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Button } from '@/components/atoms/common/Button/Button';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import ManageAttachmentModal from '@/components/organisms/profile/ManageAttachment/MakeAttachmentModal';
import LoadingModal from '@/components/atoms/common/LoadingModal/LoadingModal';
import Animated from 'react-native-reanimated';
import { ProfileBackIcon } from '@/util/svg/icon.profile';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import { useEditProfile } from '@/hooks/custom/useEditProfile';
import ProfileForm from '@/components/molecules/editProfile/ProfileForm';
import AvatarMedia from '@/components/molecules/editProfile/AvatarMedia';
import HeaderMedia from '@/components/molecules/editProfile/HeaderMedia';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/types/navigation';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;

const EditProfile = () => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const route = useRoute<EditProfileRouteProp>();
	const fromVerification = route?.params?.fromVerification;
	const {
		profile,
		setProfile,
		userInfo,
		header,
		avatar,
		actions,
		top,
		delConfAction,
		setDelConfAction,
		handleUpdateProfile,
		handlePressDelConf,
		isUpdatingProfile,
		isDeletingMedia,
		virtualKeyboardContainerStyle,
	} = useEditProfile(fromVerification);

	if (!userInfo) return null;
	return (
		<SafeScreen isBottomSafe={true} isTopSafe={false}>
			<View className="flex-1 bg-white dark:bg-patchwork-dark-100">
				<View
					className={'flex-row items-center absolute px-5 z-40 py-2 top-11'}
				>
					<Pressable
						onPress={() => {
							actions.onSelectMedia('header', []);
							actions.onSelectMedia('avatar', []);
							navigation.goBack();
						}}
						className="w-9 h-9 items-center justify-center rounded-full bg-patchwork-dark-100 opacity-50 active:opacity-35 mr-1"
					>
						<ProfileBackIcon forceLight />
					</Pressable>
				</View>
				<KeyboardAwareScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					enableOnAndroid={true}
					enableResetScrollToCoords={false}
					extraScrollHeight={100}
				>
					<View className="flex-1 -mt-2">
						<HeaderMedia header={header} actions={actions} />
						<AvatarMedia avatar={avatar} actions={actions} />
						<ThemeText
							emojis={userInfo.emojis}
							className="mx-auto font-NewsCycle_Bold mb-3 mt-1"
						>
							{userInfo.display_name || userInfo.username}
						</ThemeText>
						<ProfileForm
							profile={profile}
							onChangeName={name =>
								setProfile(prev => {
									if (!prev) return prev;
									return {
										...prev,
										display_name: name,
									};
								})
							}
							onChangeBio={bio =>
								setProfile(prev => {
									if (!prev) return prev;
									return {
										...prev,
										bio: bio,
									};
								})
							}
							onChangeMetaLink={(index, field, value) =>
								setProfile(prev => {
									if (!prev) return prev;
									const newMetadata = [...prev.metadata];
									if (newMetadata[index]) {
										newMetadata[index] = {
											...newMetadata[index],
											[field]: value,
										};
									}
									return {
										...prev,
										metadata: newMetadata,
									};
								})
							}
						/>
					</View>
				</KeyboardAwareScrollView>
				<Button
					className={cn(
						'mx-6 bottom-0 left-0 right-0 mb-5 mt-3',
						isTablet ? 'w-[50%] self-center' : '',
					)}
					onPress={handleUpdateProfile}
				>
					<ThemeText className="text-white">{t('common.save')}</ThemeText>
				</Button>
			</View>
			{/* Header Media Modal */}
			<ThemeModal
				type="custom"
				position="bottom"
				visible={header.mediaModal}
				onClose={() => {
					actions.onToggleMediaModal('header');
				}}
				customModalContainterStyle={{
					bottom: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				<ManageAttachmentModal
					type="header"
					onToggleMediaModal={() => actions.onToggleMediaModal('header')}
					imageUrl={header.selectedMedia}
					handleOnPressDelete={() => {
						actions.onToggleMediaModal('header');
						setTimeout(() => {
							setDelConfAction({ visible: true, title: 'header' });
						}, 100);
					}}
				/>
			</ThemeModal>
			{/* Avatar Media Modal */}
			<ThemeModal
				type="custom"
				position="bottom"
				visible={avatar.mediaModal}
				onClose={() => {
					actions.onToggleMediaModal('avatar');
				}}
				customModalContainterStyle={{
					bottom: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				<ManageAttachmentModal
					type="avatar"
					onToggleMediaModal={() => actions.onToggleMediaModal('avatar')}
					imageUrl={avatar.selectedMedia}
					handleOnPressDelete={() => {
						actions.onToggleMediaModal('avatar');
						setTimeout(() => {
							setDelConfAction({ visible: true, title: 'avatar' });
						}, 100);
					}}
				/>
			</ThemeModal>
			{delConfAction.visible && (
				<CustomAlert
					isVisible={delConfAction.visible}
					message={`Are you sure you want to delete the ${delConfAction?.title}?`}
					hasCancel
					extraOkBtnStyle="text-patchwork-red-50"
					handleCancel={() => setDelConfAction({ visible: false })}
					handleOk={() => {
						if (delConfAction.title) handlePressDelConf();
					}}
					type="error"
				/>
			)}
			<LoadingModal isVisible={isDeletingMedia || isUpdatingProfile} />
		</SafeScreen>
	);
};

export default EditProfile;
