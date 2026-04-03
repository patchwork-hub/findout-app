import Underline from '@/components/atoms/common/Underline/Underline';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import Image from '@/components/atoms/common/Image/Image';
import { useCurrentTabScrollY } from 'react-native-collapsible-tab-view';
import Animated, {
	interpolate,
	useAnimatedStyle,
} from 'react-native-reanimated';
import { AppIcons } from '@/util/icons/icon.common';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import InAppBrowser from 'react-native-inappbrowser-reborn';

type Props = {
	account: Patchwork.Account;
	showUnderLine?: boolean;
};

const HomeFeedHeader = ({ account, showUnderLine = true }: Props) => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { colorScheme } = useColorScheme();
	const scrollY = useCurrentTabScrollY();

	const animatedHeaderStyle = useAnimatedStyle(() => {
		const alphaValue = interpolate(scrollY.value, [0, 50], [1, 0]);

		return {
			opacity: alphaValue,
		};
	});

	const openGuide = async (url: string) => {
		try {
			if (await InAppBrowser.isAvailable()) {
				await InAppBrowser.open(url, {
					dismissButtonStyle: 'cancel',
					readerMode: false,
					animated: true,
				});
			} else {
				navigation.navigate('WebViewer', {
					url: url,
				});
			}
		} catch (error) {
			console.error('Failed to open URL: ', error);
		}
	};

	return (
		<View className="pt-4 bg-white dark:bg-patchwork-dark-100">
			<Animated.View
				className="flex flex-row items-center mx-6 pb-2"
				style={animatedHeaderStyle}
			>
				<View className="flex-row flex-1 items-center">
					<Pressable
						className="active:opacity-80"
						onPress={() => {
							navigation.navigate('Profile', {
								id: account?.id,
							});
						}}
					>
						<Image
							className="bg-patchwork-dark-50 w-[40] h-[40] rounded-full"
							uri={account?.avatar}
							iconSize={40}
						/>
					</Pressable>

					<View className="flex flex-1 mx-3 text-center items-center">
						<ThemeText className="font-BBHSansBogle_Regular text-3xl">
							Find Out Media
						</ThemeText>
					</View>
				</View>

				<Pressable
					className="w-10 h-10 aspect-square justify-center items-center p-3 border border-patchwork-grey-100 rounded-full active:opacity-80"
					// onPress={() => openGuide('https://wearefindout.com/')}
					onPress={() => navigation.navigate('HowToUseApp')}
				>
					<FontAwesomeIcon
						icon={AppIcons.info}
						color={colorScheme == 'dark' ? '#fff' : '#000'}
						size={14}
					/>
				</Pressable>
			</Animated.View>
			{showUnderLine && <Underline className="mt-2" />}
		</View>
	);
};

export default HomeFeedHeader;
