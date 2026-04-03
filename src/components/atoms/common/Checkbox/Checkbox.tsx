import { CheckboxOutlined, CheckboxSolid } from '@/util/svg/icon.common';
import { useEffect, useState } from 'react';
import { Pressable, View, ViewProps } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from 'react-native-reanimated';

type Props = {
	children: React.ReactElement;
	isChecked: boolean;
	shouldShake?: boolean;
	disabled?: boolean;
	handleOnCheck: () => void;
} & ViewProps;
const Checkbox = ({
	children,
	handleOnCheck,
	isChecked,
	shouldShake,
	disabled,
	...props
}: Props) => {
	const shakeValue = useSharedValue(0);

	useEffect(() => {
		if (shouldShake) {
			shakeValue.value = withSequence(
				withTiming(-5, { duration: 50 }),
				withTiming(5, { duration: 50 }),
				withTiming(-5, { duration: 50 }),
				withTiming(5, { duration: 50 }),
				withTiming(0, { duration: 50 }),
			);
		}
	}, [shouldShake]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: shakeValue.value }],
	}));

	return (
		<View>
			<Pressable
				onPress={handleOnCheck}
				disabled={disabled}
				style={{ opacity: disabled ? 0.5 : 1 }}
				className="flex flex-row items-center"
				hitSlop={13}
			>
				<Animated.View style={animatedStyle}>
					{isChecked ? <CheckboxSolid /> : <CheckboxOutlined />}
				</Animated.View>
				{children}
			</Pressable>
		</View>
	);
};

export default Checkbox;
