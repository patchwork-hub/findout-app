import { queryClient } from '@/App';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useChangeUserSetting } from '@/hooks/mutations/profile.mutation';
import { useUserSetting } from '@/hooks/queries/profile.queries';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';
import customColor from '@/util/constant/color';
import { timelineOptions } from '@/util/constant/timeline';
import { generateAppopirateColor } from '@/util/helper/helper';
import { cn } from '@/util/helper/twutil';
import { AccountListIcon } from '@/util/svg/icon.common';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';

const Timeline = () => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	const { selectedTimeline } = useAuthStore();
	const { setSelectedTimeline } = useAuthStoreAction();

	const { data: userSetting, isLoading: isLoadingUserSetting } =
		useUserSetting();

	useEffect(() => {
		if (!userSetting?.settings?.user_timeline || isLoadingUserSetting) return;
		const timelineFromAPI = userSetting.settings.user_timeline[0];

		if (timelineFromAPI !== selectedTimeline) {
			setSelectedTimeline(timelineFromAPI);
		}
	}, [userSetting, isLoadingUserSetting]);

	const { mutate: changeSetting } = useChangeUserSetting({
		onMutate: async variables => {
			const previousUserSetting = queryClient.getQueryData(['user-setting']);
			queryClient.setQueryData(['user-setting'], (oldData: any) => {
				return {
					...oldData,
					settings: {
						...oldData?.settings,
						...variables,
					},
				};
			});
			return { previousUserSetting };
		},
		onError: async error => {
			Toast.show({
				type: 'errorToast',
				text1: error?.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const handleOnSelect = (key: number) => {
		if (selectedTimeline !== key) {
			setSelectedTimeline(key);
			const currentLayout = userSetting?.settings?.user_timeline?.[1] ?? 1;
			changeSetting({ user_timeline: [key, currentLayout] });
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('setting.timeline', 'Timeline')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="mt-3 mx-5">
				<View className="flex-row items-center mb-5">
					<AccountListIcon
						width={25}
						height={25}
						stroke={generateAppopirateColor({ light: '#000', dark: '#fff' })}
					/>
					<ThemeText className="ml-3">
						{t('timeline.select_timeline_message')}
					</ThemeText>
				</View>
				{isLoadingUserSetting ? (
					<View className="flex-1 items-center justify-center mt-5">
						<Flow
							size={25}
							color={
								colorScheme === 'dark'
									? customColor['patchwork-primary-dark']
									: customColor['patchwork-primary']
							}
						/>
					</View>
				) : (
					<View className="flex-row w-full">
						{timelineOptions.map((option, idx) => (
							<Pressable
								disabled={isLoadingUserSetting}
								key={option.key}
								onPress={() => handleOnSelect(option.key)}
								className={cn(
									'h-12 flex-1 py-2 items-center justify-center border border-slate-200 dark:border-gray-600',
									idx !== 0 && 'border-l-0',
									selectedTimeline === option.key
										? colorScheme == 'dark'
											? 'bg-patchwork-primary'
											: 'bg-patchwork-primary'
										: 'bg-transparent',
									isLoadingUserSetting ? 'opacity-60' : '',
								)}
								style={{}}
							>
								<ThemeText
									size={'fs_13'}
									className={cn(
										selectedTimeline === option.key ? 'text-white' : '',
									)}
								>
									{t(option.label)}
								</ThemeText>
							</Pressable>
						))}
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

export default Timeline;
