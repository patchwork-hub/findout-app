import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import Header from '@/components/atoms/common/Header/Header';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Button } from '@/components/atoms/common/Button/Button';
import { useAuthStore } from '@/store/auth/authStore';
import { SettingStackScreenProps } from '@/types/navigation';
import { useAccountInfo } from '@/hooks/queries/profile.queries';
import { AccountInfoQueryKey } from '@/types/queries/profile.type';

const Verification: React.FC<SettingStackScreenProps<'Verification'>> = ({
	navigation,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { userInfo, mastodon } = useAuthStore();

	const accountQueryKey: AccountInfoQueryKey = [
		'get_account_info',
		{
			id: userInfo?.id || '',
			domain_name: mastodon.domain,
		},
	];

	const {
		data: accountData,
		isLoading: isLoadingAccount,
		refetch,
	} = useAccountInfo(accountQueryKey, { enabled: !!userInfo?.id });

	useFocusEffect(
		useCallback(() => {
			refetch();
		}, [refetch]),
	);

	const verificationLink = useMemo(() => {
		if (!accountData?.url) return '';
		return `<a rel="me" href="${accountData.url}">Mastodon</a>`;
	}, [accountData?.url]);

	const handleCopyLink = () => {
		if (verificationLink) {
			Clipboard.setString(verificationLink);
			Toast.show({
				type: 'successToast',
				text1: t('common.copied', 'Copied!'),
				position: 'top',
				topOffset: Platform.OS === 'android' ? 25 : 50,
				visibilityTime: 2000,
			});
		}
	};

	const handleNavigateToEditProfile = () => {
		const rootNavigation = navigation.getParent();
		if (rootNavigation) {
			rootNavigation.navigate('EditProfile', { fromVerification: true });
		}
	};

	return (
		<SafeScreen>
			<Header
				title={t('website_verification')}
				leftCustomComponent={<BackButton />}
			/>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, paddingVertical: 16 }}
				showsVerticalScrollIndicator={false}
			>
				{isLoadingAccount ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator
							size="large"
							color={colorScheme === 'dark' ? '#fff' : '#000'}
						/>
					</View>
				) : (
					<View className="flex-1 mx-4">
						<View className="mb-6">
							<ThemeText className="leading-6" size="sm_14">
								{t(
									'verification.description',
									'Verifying your identity on Mastodon is for everyone. Based on open web standards, now and forever free. All you need is a personal website that people recognize you by. When you link to this website from your profile, we will check that the website links back to your profile and show a visual indicator on it.',
								)}
							</ThemeText>
						</View>

						{/* Verification Link Section */}
						<View className="mb-6">
							<ThemeText className="mb-3 font-semibold" size="md_16">
								{t('verification.heres_how', "HERE'S HOW")}
							</ThemeText>
							<ThemeText className="mb-4 leading-6" size="sm_14">
								{t(
									'verification.instructions',
									'Copy and paste the code below into the HTML of your website. Then add the address of your website into one of the extra fields on your profile from the "Edit profile" tab and save changes.',
								)}
							</ThemeText>
							<View className="flex-row items-center bg-patchwork-grey-50 dark:bg-patchwork-grey-800 rounded-lg p-4">
								<View className="flex-1 mr-3">
									<ThemeText
										className="font-mono text-xs leading-5"
										variant="textSecondary"
										numberOfLines={2}
										ellipsizeMode="middle"
									>
										{verificationLink ||
											t('verification.loading', 'Loading...')}
									</ThemeText>
								</View>
								<Button
									variant="default"
									size="default"
									onPress={handleCopyLink}
									disabled={!verificationLink}
									className="px-6"
								>
									<ThemeText className="text-white font-medium">
										{t('common.copy', 'Copy')}
									</ThemeText>
								</Button>
							</View>
						</View>

						{/* Tip Section */}
						<View className="mb-6">
							<ThemeText className="leading-6" size="sm_14">
								<ThemeText className="font-semibold" size="sm_14">
									{t('verification.tip_label', 'Tip:')}{' '}
								</ThemeText>
								{t(
									'verification.tip_part_1',
									'The link on your website can be invisible. The important part is',
								)}{' '}
								<ThemeText className="font-mono" size="sm_14">
									rel="me"
								</ThemeText>{' '}
								{t(
									'verification.tip_part_2',
									'which prevents impersonation on websites with user-generated content. You can even use a',
								)}{' '}
								<ThemeText className="font-mono" size="sm_14">
									link
								</ThemeText>{' '}
								{t(
									'verification.tip_part_3',
									'tag in the header of the page instead of a, but the HTML must be accessible without executing JavaScript.',
								)}
							</ThemeText>
						</View>

						{/* Action Button */}
						<Button
							variant="default"
							size="lg"
							onPress={handleNavigateToEditProfile}
							className="mt-4"
						>
							<ThemeText className="text-white font-semibold">
								{t('verification.add_website_to_profile')}
							</ThemeText>
						</Button>
					</View>
				)}
			</ScrollView>
		</SafeScreen>
	);
};

export default Verification;
