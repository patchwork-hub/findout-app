import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { SettingToggleItem } from '@/components/molecules/settings/SettingToggleItem/SettingToggleItem';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import {
	useChangeEmailNotiSetting,
	useMutePushNotification,
} from '@/hooks/mutations/pushNoti.mutation';
import {
	useCheckEmailNotiSetting,
	useGetNotificationMuteStatus,
} from '@/hooks/queries/feed.queries';
import { useAuthStore } from '@/store/auth/authStore';
import {
	updateEmailNotiSetting,
	updateNotiMuteUnMuteCache,
} from '@/util/cache/channel/channelCache';
import { CHANNEL_INSTANCE, DEFAULT_INSTANCE } from '@/util/constant';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

const ENABLED_INSTANCES = [DEFAULT_INSTANCE, CHANNEL_INSTANCE];

const NotificationSettingsScreen = () => {
	const { t } = useTranslation();
	const { userOriginInstance } = useAuthStore();
	const isEnabledInstance = ENABLED_INSTANCES.includes(userOriginInstance);

	const { data: notiMuteStatus } =
		useGetNotificationMuteStatus(isEnabledInstance);

	const { data: emailNotiSetting } = useCheckEmailNotiSetting({
		options: { enabled: isEnabledInstance },
	});

	const { mutate: mutatePushNotification } = useMutePushNotification({
		onMutate: ({ mute }) => updateNotiMuteUnMuteCache(mute),
	});

	const { mutate: changeEmailNotiSetting } = useChangeEmailNotiSetting({
		onMutate: ({ allowed }) => updateEmailNotiSetting(allowed),
	});

	return (
		<SafeScreen>
			<Header
				title={t('setting.notification_settings', 'Notification settings')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-1 mx-4 mt-4">
				{isEnabledInstance && (
					<SettingToggleItem
						icon={AppIcons.notiRegular}
						text={t('setting.receive_push_notification')}
						isEnabled={!notiMuteStatus?.mute}
						onToggle={value => mutatePushNotification({ mute: !value })}
						isLoading={!notiMuteStatus}
					/>
				)}
				{isEnabledInstance && (
					<SettingToggleItem
						icon={AppIcons.email}
						text={t('setting.receive_email_notification')}
						isEnabled={emailNotiSetting?.data}
						onToggle={value => changeEmailNotiSetting({ allowed: value })}
						isLoading={!emailNotiSetting}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

export default NotificationSettingsScreen;
