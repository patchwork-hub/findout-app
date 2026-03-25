import Underline from '@/components/atoms/common/Underline/Underline';
import { useColorScheme } from 'nativewind';
import { View, Pressable, Image as RNImage } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Image from '@/components/atoms/common/Image/Image';
import { useCurrentTabScrollY } from 'react-native-collapsible-tab-view';
import Animated, {
	interpolate,
	useAnimatedStyle,
} from 'react-native-reanimated';
import { useState } from 'react';
import FilterTimelineModal from '../../home/FilterTimelineModal/FilterTimelineModal';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faBell as faBellSolid,
	faGear,
	faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import customColor from '@/util/constant/color';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useOpenNotifications } from '@/hooks/custom/useOpenNotifications';
import { useNotificationBadgeSync } from '@/hooks/custom/useNotificationBadgeSync';

type Props = {
	account: Patchwork.Account;
	showUnderLine?: boolean;
};

const HomeFeedHeader = ({ account, showUnderLine = true }: Props) => {
	const { t } = useTranslation();
	const navigation = useNavigation<any>();
	const { colorScheme } = useColorScheme();
	const scrollY = useCurrentTabScrollY();
	const [showFilterModal, setShowFilterModal] = useState(false);

	const { notiCount, latestNotificationId, lastReadId } =
		useNotificationBadgeSync();

	const { handleOpenNotifications } = useOpenNotifications({
		notiCount,
		latestNotificationId,
		lastReadId,
	});

	const primaryColor =
		colorScheme === 'dark'
			? customColor['patchwork-soft-primary']
			: customColor['patchwork-primary'];
	const animatedHeaderStyle = useAnimatedStyle(() => {
		const alphaValue = interpolate(scrollY.value, [0, 50], [1, 0]);

		return {
			opacity: alphaValue,
		};
	});

	return (
		<View
			className="pt-4"
			style={{
				backgroundColor:
					colorScheme === 'dark' ? customColor['patchwork-dark-100'] : '#fff',
			}}
		>
			<Animated.View
				className="flex flex-row items-center mx-6 pb-2"
				style={animatedHeaderStyle}
			>
				<View className="flex-1 justify-center">
					<ThemeText className="font-BBHSansBogle_Regular text-3xl mr-3">
						Patchwork
					</ThemeText>
				</View>

				<View className="flex-row items-center">
					<Pressable
						accessibilityLabel="Info"
						className="p-3 active:opacity-80"
						onPress={() => {
							navigation.navigate('HowToUseApp');
						}}
					>
						<View
							className="rounded-full items-center justify-center"
							style={{
								width: 20,
								height: 20,
								borderWidth: 1.8,
								borderColor: primaryColor,
							}}
						>
							<FontAwesomeIcon icon={faInfo} size={10} color={primaryColor} />
						</View>
					</Pressable>

					<Pressable
						accessibilityLabel={t('setting.notifications')}
						className="p-3 active:opacity-80 relative"
						onPress={handleOpenNotifications}
					>
						<FontAwesomeIcon
							icon={notiCount > 0 ? faBellSolid : faBell}
							size={18}
							color={primaryColor}
						/>
						{notiCount > 0 && (
							<View className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center bg-patchwork-primary dark:bg-patchwork-primary-dark">
								<ThemeText size="xs_12" className="text-white">
									{notiCount > 99 ? '99+' : notiCount}
								</ThemeText>
							</View>
						)}
					</Pressable>

					<Pressable
						accessibilityLabel="Settings"
						className="mr-1 p-2 active:opacity-80"
						onPress={() => {
							navigation.navigate('SettingStack', {
								screen: 'Settings',
							});
						}}
					>
						<FontAwesomeIcon icon={faGear} size={18} color={primaryColor} />
					</Pressable>

					<Pressable
						accessibilityLabel={t('screen.profile_setting')}
						className="ml-1 active:opacity-80"
						onPress={() => {
							navigation.navigate('Profile', {
								id: account?.id,
							});
						}}
					>
						<Image
							className="w-[35] h-[35] rounded-full"
							style={{
								backgroundColor:
									colorScheme === 'dark'
										? customColor['patchwork-dark-50']
										: customColor['patchwork-grey-100'],
							}}
							uri={account?.avatar}
						/>
					</Pressable>
				</View>
			</Animated.View>
			{showUnderLine && <Underline className="mt-2" />}
			{showFilterModal && (
				<FilterTimelineModal
					onClose={() => {
						setShowFilterModal(false);
					}}
				/>
			)}
		</View>
	);
};

export default HomeFeedHeader;
