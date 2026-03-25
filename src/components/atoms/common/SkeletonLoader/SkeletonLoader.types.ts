import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

export interface SkeletonCardProps {
	width: number;
	height: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
}

export interface SkeletonLineProps {
	width: DimensionValue;
	height: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
}

export interface SkeletonLineWithAnimationProps extends SkeletonLineProps {
	opacity: Animated.Value;
	bgColor: string;
}

export interface SkeletonCircleProps {
	size: number;
	opacity: Animated.Value;
	bgColor: string;
	style?: ViewStyle;
}

export interface CardContainerProps {
	width: number;
	height?: number;
	borderRadius?: number;
	style?: StyleProp<ViewStyle>;
	children: React.ReactNode;
}

export interface HorizontalCardSkeletonProps {
	width: number;
	height: number;
	style?: StyleProp<ViewStyle>;
}

export interface SkeletonTheme {
	skeleton: string;
	cardBg: string;
	cardBorder: string;
	accent: string;
	divider: string;
}
