import { SettingStackScreenProps } from '@/types/navigation';
import { View, Pressable, Platform, StatusBar } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { CloseIcon } from '@/util/svg/icon.common';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { useAccountsStore } from '@/store/auth/accountsStore';
import { EmailRoute } from '@/components/organisms/switchingAccounts/EmailRoute/EmailRoute';

const LoginAnotherAccount = ({
	navigation,
	route,
}: SettingStackScreenProps<'LoginAnotherAccount'>) => {
	const { colorScheme } = useColorScheme();

	const openAccSwitcher =
		useAccountsStore(state => state.openAccSwitcher) ?? (() => {});

	return (
		<SafeScreen
			style={{
				flex: 1,
				backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff',
				paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
			}}
		>
			<View className="items-center px-8 py-5">
				<ThemeText variant={'textBold'} size={'fs_15'} className="text-center">
					Add another account
				</ThemeText>
				<Pressable
					className={
						'h-8 w-8 items-center justify-center rounded-full right-3 top-3 absolute'
					}
					onPress={() => navigation.goBack()}
				>
					<CloseIcon stroke={colorScheme === 'dark' ? '#fff' : '#000'} />
				</Pressable>
			</View>
			<EmailRoute openAccSwitcher={openAccSwitcher} />
		</SafeScreen>
	);
};

export default LoginAnotherAccount;
