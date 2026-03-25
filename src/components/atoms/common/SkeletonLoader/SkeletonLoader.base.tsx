import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import {
	CardContainerProps,
	SkeletonCircleProps,
	SkeletonLineWithAnimationProps,
	SkeletonTheme,
} from './SkeletonLoader.types';

export const SkeletonLine = ({
	width,
	height,
	borderRadius = 4,
	style,
	opacity,
	bgColor,
}: SkeletonLineWithAnimationProps) => (
	<Animated.View
		style={[
			{
				width,
				height,
				borderRadius,
				backgroundColor: bgColor,
				opacity,
			},
			style,
		]}
	/>
);

export const SkeletonCircle = ({
	size,
	opacity,
	bgColor,
	style,
}: SkeletonCircleProps) => (
	<Animated.View
		style={[
			{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: bgColor,
				opacity,
			},
			style,
		]}
	/>
);

export const CardContainer = ({
	width,
	height,
	borderRadius = 14,
	style,
	children,
	theme,
}: CardContainerProps & { theme: SkeletonTheme }) => (
	<View
		style={[
			{
				width,
				height,
				borderRadius,
				backgroundColor: theme.cardBg,
				borderWidth: 1,
				borderColor: theme.cardBorder,
				overflow: 'hidden',
			},
			style,
		]}
	>
		{children}
	</View>
);

export const AccentBar = ({
	color,
	borderRadius = 14,
}: {
	color: string;
	borderRadius?: number;
}) => (
	<View
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			bottom: 0,
			width: 4,
			backgroundColor: color,
			borderTopLeftRadius: borderRadius,
			borderBottomLeftRadius: borderRadius,
		}}
	/>
);

export const Divider = ({ color }: { color: string }) => (
	<View style={{ height: 1, backgroundColor: color }} />
);

export const Row = ({
	children,
	style,
}: {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
}) => (
	<View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
		{children}
	</View>
);
