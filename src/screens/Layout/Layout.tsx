import { queryClient } from '@/App';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useChangeUserSetting } from '@/hooks/mutations/profile.mutation';
import { useUserSetting } from '@/hooks/queries/profile.queries';
import { useAuthStore, useAuthStoreAction } from '@/store/auth/authStore';
import customColor from '@/util/constant/color';
import { cn } from '@/util/helper/twutil';
import { AppIcons } from '@/util/icons/icon.common';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';

/** 1 = default (Find Out | Main Feed | Channels)
 *  2= alternative (Main Feed | Find Out | Channels) */
export type HomeLayoutOption = 1 | 2;

const LAYOUT_OPTIONS: {
	value: HomeLayoutOption;
	labelKey: string;
	labelFallback: string;
	tabs: string[];
}[] = [
	{
		value: 1,
		labelKey: 'layout.option_default',
		labelFallback: 'Default',
		tabs: ['Find Out', 'Main Feed', 'Channels'],
	},
	{
		value: 2,
		labelKey: 'layout.option_main_feed_first',
		labelFallback: 'Main Feed First',
		tabs: ['Main Feed', 'Find Out', 'Channels'],
	},
];

const Layout = () => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { homeLayout } = useAuthStore();
	const { setHomeLayout } = useAuthStoreAction();

	const hasSynced = useRef(false);
	const [hasRefetched, setHasRefetched] = useState(false);

	const { data: userSetting, isFetching, isLoading } = useUserSetting();

	const { mutate: changeLayout } = useChangeUserSetting({
		onMutate(variables) {
			const prev = queryClient.getQueryData<Patchwork.UserSetting>([
				'user-setting',
			]);
			if (!prev) return;
			queryClient.setQueryData(['user-setting'], {
				...prev,
				settings: {
					...prev.settings,
					user_timeline: variables.user_timeline,
				},
			});
		},
		onError: async error => {
			Toast.show({
				type: 'errorToast',
				text1: error?.message || t('common.error'),
				position: 'top',
				topOffset: Platform.OS === 'android' ? 25 : 50,
			});
		},
	});

	const handleLayoutChange = (option: HomeLayoutOption) => {
		setHomeLayout(option);
		const currentTimeline = userSetting?.settings?.user_timeline?.[0] ?? 2;
		changeLayout({ user_timeline: [currentTimeline, option] });
	};

	useEffect(() => {
		if (!userSetting || isLoading) return;

		if (isFetching) {
			setHasRefetched(true);
			return;
		}

		if (hasSynced.current || !hasRefetched) return;

		const apiLayout = (userSetting.settings?.user_timeline?.[1] ??
			1) as HomeLayoutOption;
		if (apiLayout !== homeLayout) {
			setHomeLayout(apiLayout);
		}

		hasSynced.current = true;
	}, [userSetting, isFetching, isLoading, homeLayout]);

	return (
		<SafeScreen>
			<Header
				title={t('setting.layout', 'Layout')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="mt-3 mx-5">
				<View className="flex-row items-center mb-5">
					<FontAwesomeIcon
						icon={AppIcons.layout}
						size={20}
						color={
							colorScheme === 'dark'
								? customColor['patchwork-light-50']
								: customColor['patchwork-dark-50']
						}
					/>
					<ThemeText className="ml-3 flex-1">
						{t(
							'layout.select_layout_message',
							'Select the layout you want to use for your Home screen.',
						)}
					</ThemeText>
				</View>
				{isLoading ? (
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
					<View className="gap-y-4 mt-1">
						{LAYOUT_OPTIONS.map(option => {
							const isActive = homeLayout === option.value;
							return (
								<Pressable
									className="mb-4"
									key={option.value}
									onPress={() => handleLayoutChange(option.value)}
								>
									<View className="flex-row items-center mb-3">
										<View
											className={cn(
												'w-5 h-5 rounded-full border-2 items-center justify-center mr-3',
												isActive
													? 'border-patchwork-primary dark:border-patchwork-primary-dark'
													: 'border-slate-400 dark:border-gray-500',
											)}
										>
											{isActive && (
												<View className="w-2.5 h-2.5 rounded-full bg-patchwork-primary dark:bg-patchwork-primary-dark" />
											)}
										</View>
										<ThemeText className="font-semibold">
											{t(option.labelKey, option.labelFallback)}
										</ThemeText>
									</View>
									<View
										className={cn(
											'border rounded-xl p-4 active:opacity-70',
											isActive
												? 'border-patchwork-primary dark:border-white bg-patchwork-primary/5'
												: 'border-slate-200 dark:border-gray-600',
										)}
									>
										<View className="flex-row gap-x-1">
											{option.tabs.map((tab, index) => (
												<View
													key={index}
													className={cn(
														'flex-1 items-center py-1.5 rounded',
														isActive
															? 'bg-patchwork-primary/20 dark:bg-gray-600'
															: 'bg-slate-100 dark:bg-gray-700',
													)}
												>
													<ThemeText
														size={'xs_12'}
														className={cn(
															isActive
																? 'text-patchwork-primary dark:text-white font-medium'
																: 'text-patchwork-grey-400',
														)}
														numberOfLines={1}
													>
														{tab}
													</ThemeText>
												</View>
											))}
										</View>
									</View>
								</Pressable>
							);
						})}
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

export default Layout;
