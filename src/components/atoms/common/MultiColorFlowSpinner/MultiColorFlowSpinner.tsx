import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native'; // <-- Make sure to import Easing

interface MultiColorFlowSpinnerProps {
	size?: number;
	colors?: string[];
	dotSize?: number;
}

const MultiColorFlowSpinner = ({
	size = 50,
	colors = ['#cf4af0', '#3fa7e8', '#45e67a'],
	dotSize = 15,
}: MultiColorFlowSpinnerProps) => {
	const animations = useRef(colors.map(() => new Animated.Value(0))).current;

	useEffect(() => {
		const createSinglePulse = (animationValue: Animated.Value) => {
			return Animated.sequence([
				Animated.timing(animationValue, {
					toValue: 1,
					duration: 600,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(animationValue, {
					toValue: 0,
					duration: 600,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			]);
		};

		const runningAnimations = animations.map((animation, index) => {
			const loop = Animated.loop(createSinglePulse(animation));
			const timer = setTimeout(() => {
				loop.start();
			}, index * 300);

			return { loop, timer };
		});

		return () => {
			runningAnimations.forEach(({ loop, timer }) => {
				clearTimeout(timer);
				loop.stop();
			});
		};
	}, [animations]);

	return (
		<View style={[styles.container, { height: size, width: size * 2.5 }]}>
			{animations.map((animation, index) => {
				const scale = animation.interpolate({
					inputRange: [0, 1],
					outputRange: [0.4, 1],
				});

				return (
					<Animated.View
						key={index}
						style={[
							{
								backgroundColor: colors[index % colors.length],
								width: dotSize,
								height: dotSize,
								borderRadius: dotSize / 2,
								transform: [{ scale }],
							},
						]}
					/>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
	},
});

export default MultiColorFlowSpinner;
