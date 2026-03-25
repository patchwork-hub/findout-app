import { ProfileBackIcon } from '@/util/svg/icon.profile';
import { Platform, TouchableOpacity } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedScrollY } from '@/context/sharedScrollContext/sharedScroll.context';
import Animated, {
	interpolate,
	useAnimatedStyle,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { truncateStr } from '@/util/helper/helper';

type Props = {
	title: string;
	emojis?: Patchwork.Emoji[];
	isOwnProfile?: boolean;
};

export const SolidHeaderDepth = Platform.OS == 'ios' ? 140 : 160;
export const TitleDepth = Platform.OS == 'ios' ? 150 : 180;

const FeedTitleHeader = ({ title, emojis, isOwnProfile = false }: Props) => {
	const { top } = useSafeAreaInsets();
	const sharedScrollYOffset = useSharedScrollY('Channel');
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

	const animatedHeaderStyle = useAnimatedStyle(() => {
		const alphaValue = interpolate(
			sharedScrollYOffset.value,
			[SolidHeaderDepth, SolidHeaderDepth + 20],
			[0, 1],
		);

		return {
			backgroundColor: getBgColorBasedOnTheme(colorScheme, alphaValue),
		};
	});

	const animatedTitleStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			sharedScrollYOffset.value,
			[TitleDepth, TitleDepth + 20],
			[0, 1],
			'clamp',
		);
		return { opacity };
	});

	const firstBackButtonStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			sharedScrollYOffset.value,
			[TitleDepth - 20, TitleDepth],
			[1, 0],
			'clamp',
		);
		return { opacity };
	});

	const secondBackButtonStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			sharedScrollYOffset.value,
			[TitleDepth, TitleDepth + 20],
			[0, 1],
			'clamp',
		);
		return { opacity };
	});

	return (
		<>
			{/* First Back Button */}
			<Animated.View
				className="absolute left-5 z-10"
				style={[{ top: top }, firstBackButtonStyle]}
			>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="w-9 h-9 items-center justify-center rounded-full bg-patchwork-dark-100 opacity-50 mr-1"
				>
					<ProfileBackIcon forceLight />
				</TouchableOpacity>
			</Animated.View>

			{/* Animated Header */}
			<Animated.View
				pointerEvents="box-none"
				className={'flex-row items-center absolute px-2 z-40 py-4'}
				style={[{ paddingTop: top + 10 }, animatedHeaderStyle]}
			>
				{/* Second Back Button */}
				<Animated.View
					className={'absolute'}
					style={[{ top: top, left: 8 }, secondBackButtonStyle]}
				>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="w-9 h-9 items-center justify-center rounded-full ml-3 mr-1 border-[1px] border-patchwork-grey-100"
					>
						<ProfileBackIcon colorScheme={colorScheme} />
					</TouchableOpacity>
				</Animated.View>

				<Animated.View
					className="flex-1 items-center justify-center"
					pointerEvents="none"
					style={animatedTitleStyle}
				>
					<ThemeText
						emojis={emojis}
						className="font-NewsCycle_Bold max-w-[70%] text-center"
						size={'md_16'}
					>
						{truncateStr(title, 28)}
					</ThemeText>
				</Animated.View>
			</Animated.View>
		</>
	);
};

const getBgColorBasedOnTheme = (
	colorScheme: 'light' | 'dark',
	alphaValue: number,
) => {
	'worklet';
	return colorScheme == 'dark'
		? `rgba(13, 13, 13, ${alphaValue})`
		: `rgba(255, 255, 255, ${alphaValue})`;
};

// ? `rgba(46, 54, 59, ${alphaValue})`

export default FeedTitleHeader;
