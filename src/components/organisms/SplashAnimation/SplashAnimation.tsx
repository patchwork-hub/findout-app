import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import {
	Bounce,
	Chase,
	Plane,
	Swing,
	Wander,
} from 'react-native-animated-spinkit';
import customColor from '../../../util/constant/color';

interface SplashAnimationProps {
	onFinishAnimation: () => void;
}

const SplashAnimation: React.FC<SplashAnimationProps> = ({
	onFinishAnimation,
}) => {
	const [showSpinner, setShowSpinner] = useState(false);

	const animationValue = useRef(new Animated.Value(0)).current;
	const logoScale = useRef(new Animated.Value(0)).current;
	const logoOpacity = useRef(new Animated.Value(0)).current;
	const logoSquash = useRef(new Animated.Value(1)).current;
	const containerTranslateY = useRef(new Animated.Value(0)).current;
	const spinnerOpacity = useRef(new Animated.Value(0)).current;
	const spinnerTranslateY = useRef(new Animated.Value(20)).current;

	useEffect(() => {
		Animated.timing(animationValue, {
			toValue: 1,
			duration: 2000,
			easing: Easing.bezier(0.4, 0, 0.2, 1),
			useNativeDriver: true,
		}).start();

		Animated.sequence([
			// 1. Square logo scales up with bounce
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
			]),
		]).start(() => {
			setShowSpinner(true);
			// Breathing squash on logo while loading
			Animated.loop(
				Animated.sequence([
					Animated.timing(logoSquash, {
						toValue: 0.95,
						duration: 1000,
						easing: Easing.inOut(Easing.sin),
						useNativeDriver: true,
					}),
					Animated.timing(logoSquash, {
						toValue: 1,
						duration: 1000,
						easing: Easing.inOut(Easing.sin),
						useNativeDriver: true,
					}),
				]),
			).start();

			Animated.parallel([
				Animated.timing(containerTranslateY, {
					toValue: -30,
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
				onFinishAnimation();
			});
		});
	}, []);

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
						transform: [{ scale: logoScale }, { scaleY: logoSquash }],
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
					<Swing size={40} color="white" />
				</Animated.View>
			)}
		</View>
	);
};

export default SplashAnimation;
