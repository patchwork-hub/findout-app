import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Button } from '@/components/atoms/common/Button/Button';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { layoutAnimation } from '@/util/helper/timeline';
import { slides } from '@/util/constant/howToUseTheApp';

const HowToUseApp = () => {
	const navigation = useNavigation<any>();
	const { colorScheme } = useColorScheme();

	const isDark = colorScheme === 'dark';

	const screenBg = isDark
		? customColor['patchwork-dark-100']
		: customColor['patchwork-grey-50'];
	const primary = isDark
		? customColor['patchwork-primary-dark']
		: customColor['patchwork-primary'];
	const bodyColor = isDark ? '#D8E2E6' : '#555555';
	const tipBg = isDark ? '#23363D' : '#F0F5F7';
	const tipTextColor = isDark ? '#B8C7CE' : '#5C7A87';
	const iconBg = isDark ? '#2F4B50' : '#E8F4F8';

	const [step, setStep] = useState(1);

	const handleNext = () => {
		if (step < slides.length) {
			layoutAnimation();
			setStep(prev => prev + 1);
		}
	};

	const handlePrev = () => {
		if (step > 1) {
			layoutAnimation();
			setStep(prev => prev - 1);
		}
	};

	const handleGetStarted = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('HomeFeed');
		}
	};

	const currentSlide = slides[step - 1];

	return (
		<SafeScreen style={{ backgroundColor: screenBg }}>
			<Header
				leftCustomComponent={<BackButton />}
				title="How to use Find Out Media"
			/>

			{/* Progress Bar */}
			<View className="flex-row mx-5 mt-4 mb-3">
				{slides.map(slide => (
					<View
						key={slide.id}
						className={`flex-1 h-[4px] rounded-full mx-1 ${
							step >= slide.id
								? 'bg-slate-700 dark:bg-slate-300'
								: 'bg-slate-200 dark:bg-slate-700'
						}`}
					/>
				))}
			</View>

			<ScrollView
				className="flex-1 px-5 pt-4"
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					key={`step-${step}`}
					entering={FadeInRight.duration(300)}
					exiting={FadeOutLeft.duration(300)}
					className="flex-1"
				>
					<View className="items-center justify-center mb-6 mt-2">
						<View
							className="w-10 h-10 rounded-full items-center justify-center mb-4 shadow-sm"
							style={{ backgroundColor: iconBg }}
						>
							<FontAwesomeIcon
								icon={currentSlide.icon}
								size={20}
								color={primary}
							/>
						</View>
						<ThemeText className="font-NewsCycle_Bold text-lg text-center mt-2 mb-4">
							{currentSlide.title}
						</ThemeText>
						<ThemeText
							className="text-[15px] leading-[24px] text-center px-2"
							style={{ color: bodyColor }}
						>
							{currentSlide.description}
						</ThemeText>
					</View>

					<View className="mt-2 mb-6 space-y-4">
						{currentSlide.bullets.map((item, index) => (
							<View key={index} className="flex-row items-center mb-3 pr-4">
								<View className="mr-3 mt-1 self-start">
									<FontAwesomeIcon
										icon={faCheckCircle}
										size={18}
										color={primary}
									/>
								</View>
								<ThemeText
									className="text-[15px] leading-[22px]"
									style={{ color: bodyColor }}
								>
									{item}
								</ThemeText>
							</View>
						))}
					</View>

					<View
						className="rounded-xl p-4 mt-auto mb-6"
						style={{ backgroundColor: tipBg }}
					>
						<ThemeText
							className="text-[14px] leading-[20px] font-medium"
							style={{ color: tipTextColor }}
						>
							💡 Tip: {currentSlide.tip}
						</ThemeText>
					</View>
				</Animated.View>
			</ScrollView>

			{/* Footer Controls */}
			<View className="px-5 pb-6 pt-2 flex-row gap-x-3 bg-transparent">
				{step > 1 && (
					<Button
						variant="outline"
						className="flex-1 bg-transparent"
						onPress={handlePrev}
					>
						<ThemeText className="font-bold">Back</ThemeText>
					</Button>
				)}
				<Button
					className="flex-1"
					onPress={step === slides.length ? handleGetStarted : handleNext}
					disabled={false}
				>
					<ThemeText className="text-white font-bold">
						{step === slides.length ? 'Get Started' : 'Next'}
					</ThemeText>
				</Button>
			</View>
		</SafeScreen>
	);
};

export default HowToUseApp;
