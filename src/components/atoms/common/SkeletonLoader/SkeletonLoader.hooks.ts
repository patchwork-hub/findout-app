import { useColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { SKELETON_COLORS } from './SkeletonLoader.theme';

export const useSkeletonAnimation = () => {
	const { colorScheme } = useColorScheme();
	const opacity = useRef(new Animated.Value(0.4)).current;
	const isDark = colorScheme === 'dark';
	const theme = isDark ? SKELETON_COLORS.dark : SKELETON_COLORS.light;

	useEffect(() => {
		const anim = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 700,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 0.4,
					duration: 700,
					useNativeDriver: true,
				}),
			]),
		);
		anim.start();
		return () => anim.stop();
	}, [opacity]);

	return { opacity, theme, isDark };
};
