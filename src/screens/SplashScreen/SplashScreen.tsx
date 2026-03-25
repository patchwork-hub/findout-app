import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { Image } from 'react-native';
import { View } from 'react-native';
import { Wander } from 'react-native-animated-spinkit';

export default function SplashScreen() {
	const { colorScheme } = useColorScheme();
	return (
		<View className={`flex-1 items-center justify-center`}>
			<Image
				source={require('../../../assets/images/patchwork_logo.png')}
				style={{ width: 150, height: 150, marginTop: -14 }}
			/>
			<View className="mt-5">
				<ThemeText className="" size={'fs_15'}>
					Your account is on the way ...
				</ThemeText>
			</View>
			<View className="mt-8">
				<Wander
					color={
						colorScheme == 'dark'
							? customColor['patchwork-primary-dark']
							: customColor['patchwork-primary']
					}
					size={50}
				/>
			</View>
		</View>
	);
}
