import { View, Text, ViewStyle, StyleProp, Animated } from 'react-native';
import React from 'react';
import { useSkeletonAnimation } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader.hooks';
import {
	CardContainer,
	SkeletonLine,
} from '@/components/atoms/common/SkeletonLoader/SkeletonLoader.base';

const OrganiserCardSkeleton = ({
	width,
	style,
}: {
	width: number;
	style?: StyleProp<ViewStyle>;
}) => {
	const { opacity, theme } = useSkeletonAnimation();

	return (
		<CardContainer
			width={width}
			height={196}
			borderRadius={10}
			theme={theme}
			style={style}
		>
			<Animated.View
				style={{
					width: '100%',
					height: 124,
					backgroundColor: theme.skeleton,
					opacity,
				}}
			/>

			<View
				style={{
					flex: 1,
					paddingHorizontal: 16,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<SkeletonLine
					width="72%"
					height={12}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 8 }}
				/>
				<SkeletonLine
					width="48%"
					height={12}
					opacity={opacity}
					bgColor={theme.skeleton}
				/>
			</View>
		</CardContainer>
	);
};

export default OrganiserCardSkeleton;
