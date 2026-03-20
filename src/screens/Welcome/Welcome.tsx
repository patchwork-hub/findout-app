import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { GuestStackScreenProps } from '@/types/navigation';
import { CustomCurveIcon } from '@/util/svg/icon.common';
import { Image, View } from 'react-native';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import { Trans, useTranslation } from 'react-i18next';
import LanguageSelectorModal from '@/components/molecules/account/LanguageSelectorModal/LanguageSelectorModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStoreAction } from '@/store/auth/authStore';
import { verifyAuthToken } from '@/services/auth.service';
import { Alert } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import AccountSwitchingModal from '@/components/organisms/switchingAccounts/AccountSwitchingModal/AccountSwitchingModal';
import { DEFAULT_API_URL } from '@/util/constant';
import { addOrUpdateAccount, AuthState } from '@/util/storage';
import { useColorScheme } from 'nativewind';

const Welcome: React.FC<GuestStackScreenProps<'Welcome'>> = ({
	navigation,
}) => {
	const { colorScheme } = useColorScheme();
	const { t, i18n } = useTranslation();
	const { top } = useSafeAreaInsets();
	const lineHeightStyle = i18n.language === 'my' ? { lineHeight: 32 } : {};
	const { setAuthState, setUserInfo } = useAuthStoreAction();

	return (
		<SafeScreen className="pt-0">
			<View className="flex-1 justify-center mb-9">
				<View className="bg-patchwork-primary pt-10 px-6">
					<AccountSwitchingModal isWelcome />
				</View>
				<View className="h-[45%] items-center justify-center bg-primary bg-patchwork-primary">
					<View className="-mt-14 items-center justify-center">
						<Image
							source={require('../../../assets/images/FOMW.png')}
							style={{ width: 150, height: 150 }}
						/>
						<View className="items-center">
							<ThemeText className="text-zinc-200 text-center">
								Rebuilding the influence of the left demands
							</ThemeText>
							<ThemeText className="text-zinc-200">
								honest, real, uncomfortable conversations...
							</ThemeText>
						</View>
						<View className="my-3 items-center">
							<ThemeText className="text-zinc-200 text-center">
								Luckily for us,
							</ThemeText>
							<ThemeText className="text-zinc-200">
								that’s what we’re known for.
							</ThemeText>
						</View>
					</View>
					<View className="absolute bottom-[43] left-0">
						<CustomCurveIcon width={45} height={65} colorScheme={colorScheme} />
					</View>
				</View>
				<View className="flex-1 rounded-tr-[50] -mt-[56] bg-white dark:bg-patchwork-dark-100 p-6 pb-10">
					<View className="flex-grow items-center mx-3">
						<Button
							variant="default"
							className={cn(
								'w-full h-12 mb-4 mt-6 bg-patchwork-primary dark:bg-white',
								isTablet ? 'w-[50%]' : 'w-full',
							)}
							onPress={() => navigation.navigate('SignUp')}
						>
							<ThemeText className="ml-2 text-white dark:text-black">
								{t('login.sign_up')}
							</ThemeText>
						</Button>
						<View className="flex flex-row items-center mt-3 justify-center">
							<ThemeText className="text-zinc-500 dark:text-zinc-200">
								{t('login.have_account')}
							</ThemeText>
							<Button
								variant="outline"
								size={'sm'}
								className="border-slate-400 ml-2 px-4"
								onPress={() => navigation.navigate('Login')}
							>
								<View className="flex-row justify-center items-center">
									<ThemeText
										size={'fs_13'}
										className="leading-5 text-black dark:text-white"
									>
										{t('login.sign_in')}
									</ThemeText>
								</View>
							</Button>
						</View>
					</View>
				</View>

				<View className="flex-1 justify-end mx-5">
					<ThemeText
						className="text-center text-zinc-500 dark:text-zinc-200"
						style={lineHeightStyle}
					>
						<Trans
							i18nKey="login.welcome_page_agreement"
							components={{
								terms: (
									<ThemeText
										key={'terms'}
										className="my-4 active:opacity-80"
										onPress={() => {
											navigation.navigate('WebViewer', {
												url: 'https://thebristolcable.org/terms/',
												customTitle: 'Terms & Conditions',
											});
										}}
									/>
								),
								privacy: (
									<ThemeText
										key={'privacy'}
										className="my-4 active:opacity-80"
										onPress={() => {
											navigation.navigate('WebViewer', {
												url: 'https://thebristolcable.org/privacy-policy/',
												customTitle: 'Privacy Policy',
											});
										}}
									/>
								),
							}}
						/>
					</ThemeText>
				</View>
			</View>
			<View style={{ paddingTop: top + 16 }} className="absolute right-4">
				<LanguageSelectorModal />
			</View>
		</SafeScreen>
	);
};

export default Welcome;
