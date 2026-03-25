import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import { SCREEN_WIDTH } from '@/util/helper/helper';
import {
	AccentBar,
	CardContainer,
	Divider,
	Row,
	SkeletonCircle,
	SkeletonLine,
} from './SkeletonLoader.base';
import { useSkeletonAnimation } from './SkeletonLoader.hooks';
import {
	HorizontalCardSkeletonProps,
	SkeletonCardProps,
} from './SkeletonLoader.types';

export const SkeletonCard = ({
	width,
	height,
	borderRadius = 12,
	style,
}: SkeletonCardProps) => {
	const { opacity, theme } = useSkeletonAnimation();

	return (
		<Animated.View
			style={[
				{
					width,
					height,
					borderRadius,
					backgroundColor: theme.skeleton,
					opacity,
				},
				style,
			]}
		/>
	);
};

export const ResourceCardSkeleton = ({
	style,
}: {
	style?: StyleProp<ViewStyle>;
}) => {
	const { opacity, theme } = useSkeletonAnimation();
	const width = SCREEN_WIDTH - 32;

	return (
		<CardContainer
			width={width}
			theme={theme}
			style={[{ marginBottom: 12 }, style]}
		>
			<AccentBar color={theme.accent} />
			<View style={{ padding: 16, paddingLeft: 20 }}>
				{/* Date + Badge row */}
				<Row style={{ marginBottom: 12 }}>
					<SkeletonLine
						width={70}
						height={12}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
					<SkeletonLine
						width={50}
						height={18}
						borderRadius={8}
						opacity={opacity}
						bgColor={theme.skeleton}
						style={{ marginLeft: 10 }}
					/>
				</Row>

				{/* Title - 2 lines */}
				<SkeletonLine
					width="100%"
					height={14}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 8 }}
				/>
				<SkeletonLine
					width="75%"
					height={14}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 12 }}
				/>

				{/* Excerpt - 2 lines */}
				<SkeletonLine
					width="90%"
					height={10}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 6 }}
				/>
				<SkeletonLine
					width="60%"
					height={10}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 16 }}
				/>

				{/* Footer */}
				<Divider color={theme.divider} />
				<Row style={{ justifyContent: 'space-between', marginTop: 12 }}>
					<SkeletonLine
						width={80}
						height={12}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
					<SkeletonLine
						width={16}
						height={12}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
				</Row>
			</View>
		</CardContainer>
	);
};

export const PeopleCardSkeleton = ({
	style,
}: {
	style?: StyleProp<ViewStyle>;
}) => {
	const { opacity, theme } = useSkeletonAnimation();
	const width = SCREEN_WIDTH - 32;

	return (
		<Row style={[{ width, paddingVertical: 12, paddingHorizontal: 12 }, style]}>
			<SkeletonCircle size={44} opacity={opacity} bgColor={theme.skeleton} />

			<View style={{ flex: 1, marginLeft: 12 }}>
				<SkeletonLine
					width="60%"
					height={14}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 6 }}
				/>
				<SkeletonLine
					width="40%"
					height={12}
					opacity={opacity}
					bgColor={theme.skeleton}
				/>
			</View>

			<SkeletonLine
				width={70}
				height={32}
				borderRadius={16}
				opacity={opacity}
				bgColor={theme.skeleton}
			/>
		</Row>
	);
};

export const KnowledgeCardSkeleton = ({
	style,
}: {
	style?: StyleProp<ViewStyle>;
}) => <NewsCardSkeleton width={180} height={220} style={style} />;

export const NewsCardSkeleton = ({
	width,
	height,
	style,
}: HorizontalCardSkeletonProps) => {
	const { opacity, theme } = useSkeletonAnimation();

	return (
		<CardContainer
			width={width}
			height={height}
			theme={theme}
			style={[{ marginRight: 12, marginBottom: 12 }, style]}
		>
			<AccentBar color={theme.accent} />
			<View style={{ padding: 14, paddingLeft: 18, flex: 1 }}>
				{/* Date + Badge row */}
				<Row style={{ marginBottom: 10 }}>
					<SkeletonLine
						width={60}
						height={10}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
					<SkeletonLine
						width={40}
						height={16}
						borderRadius={6}
						opacity={opacity}
						bgColor={theme.skeleton}
						style={{ marginLeft: 8 }}
					/>
				</Row>

				{/* Title - 2 lines */}
				<SkeletonLine
					width="95%"
					height={13}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 6 }}
				/>
				<SkeletonLine
					width="70%"
					height={13}
					opacity={opacity}
					bgColor={theme.skeleton}
				/>
			</View>

			{/* Footer */}
			<View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
				<Divider color={theme.divider} />
				<Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
					<SkeletonLine
						width={70}
						height={10}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
					<SkeletonLine
						width={14}
						height={10}
						opacity={opacity}
						bgColor={theme.skeleton}
					/>
				</Row>
			</View>
		</CardContainer>
	);
};

export const HorizontalPeopleCardSkeleton = ({
	width = 180,
	height,
	style,
}: {
	width?: number;
	height?: number;
	style?: StyleProp<ViewStyle>;
}) => {
	const { opacity, theme } = useSkeletonAnimation();
	const imageHeight = height ? height * 0.7 : 160;

	return (
		<CardContainer
			width={width}
			height={height}
			borderRadius={12}
			theme={theme}
			style={[{ marginRight: 12, marginBottom: 12 }, style]}
		>
			<SkeletonLine
				width={width}
				height={imageHeight}
				borderRadius={0}
				opacity={opacity}
				bgColor={theme.skeleton}
			/>
			<View style={{ padding: 12, paddingBottom: 20 }}>
				<SkeletonLine
					width="75%"
					height={14}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 6 }}
				/>
				<SkeletonLine
					width="50%"
					height={12}
					opacity={opacity}
					bgColor={theme.skeleton}
				/>
			</View>
		</CardContainer>
	);
};

export const CiviPeopleDetailCardSkeleton = ({
	style,
	rows = 3,
}: {
	style?: StyleProp<ViewStyle>;
	rows?: number;
}) => {
	const { opacity, theme } = useSkeletonAnimation();
	const width = SCREEN_WIDTH - 28;

	return (
		<CardContainer width={width} borderRadius={12} theme={theme} style={style}>
			<View style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
				<SkeletonLine
					width={72}
					height={12}
					opacity={opacity}
					bgColor={theme.skeleton}
					style={{ marginBottom: 10 }}
				/>
				{Array.from({ length: rows }).map((_, index) => (
					<View key={index}>
						<Row style={{ paddingVertical: 8 }}>
							<SkeletonLine
								width={28}
								height={28}
								borderRadius={8}
								opacity={opacity}
								bgColor={theme.skeleton}
							/>
							<View style={{ flex: 1, marginLeft: 10 }}>
								<SkeletonLine
									width="34%"
									height={10}
									opacity={opacity}
									bgColor={theme.skeleton}
									style={{ marginBottom: 6 }}
								/>
								<SkeletonLine
									width={index % 2 === 0 ? '58%' : '72%'}
									height={12}
									opacity={opacity}
									bgColor={theme.skeleton}
								/>
							</View>
						</Row>
						{index < rows - 1 ? <Divider color={theme.divider} /> : null}
					</View>
				))}
			</View>
		</CardContainer>
	);
};
