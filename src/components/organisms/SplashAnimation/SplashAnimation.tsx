import MultiColorFlowSpinner from '@/components/atoms/common/MultiColorFlowSpinner/MultiColorFlowSpinner';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';

interface SplashAnimationProps {
	onFinishAnimation: () => void;
}

const SplashAnimation: React.FC<SplashAnimationProps> = ({
	onFinishAnimation,
}) => {
	const [showSpinner, setShowSpinner] = useState(false);

	const animationValue = useRef(new Animated.Value(0)).current;
	const logoScale = useRef(new Animated.Value(0)).current;
	const logoRotation = useRef(new Animated.Value(0)).current;
	const logoOpacity = useRef(new Animated.Value(0)).current;
	const containerTranslateY = useRef(new Animated.Value(0)).current;
	const spinnerOpacity = useRef(new Animated.Value(0)).current;
	const spinnerTranslateY = useRef(new Animated.Value(20)).current;

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		// 1. Background expansion
		Animated.timing(animationValue, {
			toValue: 1,
			duration: 2000,
			easing: Easing.bezier(0.4, 0, 0.2, 1),
			useNativeDriver: true,
		}).start();

		// 2. Logo Rotation (spin continuously)
		Animated.loop(
			Animated.timing(logoRotation, {
				toValue: 1,
				duration: 3000,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		).start();

		// 3. Entrance Sequence
		Animated.parallel([
			Animated.timing(logoScale, {
				toValue: 1,
				duration: 700,
				easing: Easing.back(1.5),
				useNativeDriver: true,
			}),
			Animated.timing(logoOpacity, {
				toValue: 1,
				duration: 400,
				useNativeDriver: true,
			}),
		]).start(() => {
			setShowSpinner(true);

			Animated.parallel([
				Animated.timing(containerTranslateY, {
					toValue: 0,
					duration: 800,
					easing: Easing.out(Easing.quad),
					useNativeDriver: true,
				}),
				Animated.timing(spinnerOpacity, {
					toValue: 1,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(spinnerTranslateY, {
					toValue: 0,
					duration: 800,
					easing: Easing.out(Easing.quad),
					useNativeDriver: true,
				}),
			]).start(() => {
				timeoutId = setTimeout(onFinishAnimation, 1500);
			});
		});

		// Cleanup function to prevent memory leaks and stop animations if the component unmounts
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			animationValue.stopAnimation();
			logoRotation.stopAnimation();
			logoScale.stopAnimation();
			logoOpacity.stopAnimation();
			containerTranslateY.stopAnimation();
			spinnerOpacity.stopAnimation();
			spinnerTranslateY.stopAnimation();
		};
	}, []);

	const rotateInterpolate = logoRotation.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<View className="flex-1 bg-white items-center justify-center overflow-hidden">
			{/* Expanding background circle */}
			<Animated.View
				style={{
					position: 'absolute',
					width: 100,
					height: 100,
					borderRadius: 100,
					backgroundColor: '#000',
					transform: [
						{
							scale: animationValue.interpolate({
								inputRange: [0, 0.2, 1],
								outputRange: [0, 1, 20],
							}),
						},
					],
				}}
			/>

			{/* Logo + MEDIA text group */}
			<Animated.View
				style={{ transform: [{ translateY: containerTranslateY }] }}
				className="items-center"
			>
				{/* Square Patchwork logo scales in from center */}
				<Animated.View
					style={{
						opacity: logoOpacity,
						transform: [{ scale: logoScale }, { rotate: rotateInterpolate }],
					}}
				>
					<Image
						source={require('../../../../assets/images/PatchworkColorful.png')}
						style={{ width: 160, height: 160 }}
						resizeMode="contain"
					/>
				</Animated.View>
			</Animated.View>

			{showSpinner && (
				<Animated.View
					style={{
						opacity: spinnerOpacity,
						transform: [{ translateY: spinnerTranslateY }],
					}}
				>
					<MultiColorFlowSpinner size={25} dotSize={12} />
				</Animated.View>
			)}
		</View>
	);
};

export default SplashAnimation;
