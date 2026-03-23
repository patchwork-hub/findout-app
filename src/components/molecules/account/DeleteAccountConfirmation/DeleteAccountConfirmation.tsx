import { View, Linking } from 'react-native';
import React from 'react';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useAuthStore } from '@/store/auth/authStore';
import { useTranslation } from 'react-i18next';
import { ensureHttp } from '@/util/helper/helper';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { DEFAULT_API_URL } from '@/util/constant';

const DeleteAccountConfirmation = () => {
	const { userOriginInstance } = useAuthStore();
	const { t } = useTranslation();

	const points = [
		t('delete_account_confirm.point_1'),
		t('delete_account_confirm.point_2'),
		t('delete_account_confirm.point_3'),
		t('delete_account_confirm.point_4'),
	];

	const serverName = userOriginInstance
		? userOriginInstance.replace(
				ensureHttp(userOriginInstance) ? /https?:\/\// : '',
				'',
		  )
		: 'Findout Media';

	const handlePressLink = async (url: string) => {
		try {
			if (await InAppBrowser.isAvailable()) {
				await InAppBrowser.open(url, {
					dismissButtonStyle: 'cancel',
					readerMode: false,
					animated: true,
				});
			} else {
				Linking.openURL(url);
			}
		} catch (error) {
			console.error('Failed to open link:', error);
			Linking.openURL(url);
		}
	};

	return (
		<View className="mx-5 mb-24 mt-6">
			<ThemeText className="font-NewsCycle_Bold text-xl mb-4">
				{t('delete_account_confirm.title')}
			</ThemeText>

			{/* <View className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-xl mb-6">
				<ThemeText className="leading-6">
					{t('delete_account_confirm.info_box', {
						email: userInfo?.source?.email || userOriginInstance,
						server: serverName,
					})}
				</ThemeText>
			</View> */}

			<ThemeText
				size="sm_14"
				className="mb-4 leading-relaxed font-OpenSans_Regular"
			>
				{t('delete_account_confirm.main_info')}
			</ThemeText>

			<View className="bg-slate-100 dark:bg-zinc-800 p-5 pb-1 rounded-2xl mb-7 mt-3">
				{points.map((point, index) => (
					<View key={index} className="flex-row mb-5 items-center">
						<View className="w-6 h-6 rounded-full bg-patchwork-primary dark:bg-patchwork-primary-dark items-center justify-center mr-3 mt-0.5">
							<ThemeText className="text-white text-[13px] font-NewsCycle_Bold">
								{index + 1}
							</ThemeText>
						</View>
						<ThemeText
							size="sm_14"
							className="flex-1 leading-5 font-OpenSans_Regular"
						>
							{point}
						</ThemeText>
					</View>
				))}
			</View>
			<ThemeText size="sm_14" className="mb-2">
				{t('delete_account_confirm.privacy_policy_intro')}
				<ThemeText
					className="underline text-patchwork-primary dark:text-patchwork-primary-dark active:opacity-80"
					onPress={() => handlePressLink(`${DEFAULT_API_URL}/privacy-policy/`)}
				>
					{t('delete_account_confirm.privacy_policy_text')}
				</ThemeText>
			</ThemeText>
		</View>
	);
};

export default DeleteAccountConfirmation;
