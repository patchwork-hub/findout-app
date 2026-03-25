import { Platform, StatusBar, View, ViewProps } from 'react-native';
import { useContext, type PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { useColorScheme } from 'nativewind';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import { cn } from '@/util/helper/twutil';
import styles from './SafeScreen.style';
import customColor from '@/util/constant/color';

type SafeScreenProps = PropsWithChildren &
	ViewProps & {
		isBottomSafe?: boolean;
		isTopSafe?: boolean;
		statusBarBg?: string;
	};

function SafeScreen({
	children,
	className: extraClassName,
	isBottomSafe,
	isTopSafe = true,
	style,
	statusBarBg: customStatusBarBg,
	...props
}: SafeScreenProps) {
	const insets = useSafeAreaInsets();
	const tabBarHeight = useContext(BottomTabBarHeightContext);
	const { colorScheme } = useColorScheme();

	const defaultStatusBarBg =
		colorScheme === 'dark' ? customColor['patchwork-dark-100'] : '#fff';
	const statusBarBg = customStatusBarBg ?? defaultStatusBarBg;

	const shouldAddBottomPadding = isBottomSafe ?? tabBarHeight === undefined;

	return (
		<View
			style={[
				{
					paddingTop: isTopSafe ? insets.top : 0,
					paddingBottom: shouldAddBottomPadding ? insets.bottom : 0,
					paddingLeft: insets.left,
					paddingRight: insets.right,
				},
				style,
			]}
			className={cn(styles.layoutContainer, extraClassName)}
			{...props}
		>
			<StatusBar
				barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
				translucent
				backgroundColor={statusBarBg}
			/>
			{children}
		</View>
	);
}

export default SafeScreen;
