import React from 'react';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	useAnimatedReaction,
	withTiming,
} from 'react-native-reanimated';
import { useSharedScrollY } from '@/context/sharedScrollContext/sharedScroll.context';

export const AnimatedFabWrapper = ({
	children,
	isVisible,
}: {
	children: React.ReactNode;
	isVisible: boolean;
}) => {
	const scrollY = useSharedScrollY('Channel');
	const translateY = useSharedValue(0);

	useAnimatedReaction(
		() => scrollY.value,
		(current, previous) => {
			if (previous === null) return;
			const diff = current - previous;

			if (current < 100) {
				translateY.value = withTiming(0, { duration: 250 });
				return;
			}

			if (diff > 5) {
				translateY.value = withTiming(100, { duration: 250 });
			} else if (diff < -5) {
				translateY.value = withTiming(0, { duration: 250 });
			}
		},
	);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: translateY.value }],
			opacity: isVisible
				? withTiming(1, { duration: 300 })
				: withTiming(0, { duration: 300 }),
		};
	});

	return (
		<Animated.View
			pointerEvents={isVisible ? 'box-none' : 'none'}
			style={[
				{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 100,
				},
				animatedStyle,
			]}
		>
			{children}
		</Animated.View>
	);
};
