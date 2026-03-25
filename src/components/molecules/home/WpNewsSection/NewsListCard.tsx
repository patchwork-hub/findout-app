import { View, Pressable, Platform, StyleSheet } from 'react-native';
import React from 'react';
import { formatDate, SCREEN_WIDTH, stripHtml } from '@/util/helper/helper';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';

const CARD_WIDTH = SCREEN_WIDTH - 32;

const NewsListCard = ({
	item,
	onPress,
}: {
	item: Patchwork.WPPost;
	onPress: () => void;
}) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const title = stripHtml(item.title.rendered);
	const excerpt = stripHtml(item.excerpt?.rendered ?? '');

	return (
		<Pressable
			style={[
				styles.container,
				{
					backgroundColor: isDark
						? customColor['patchwork-dark-400']
						: '#FFFFFF',
				},
			]}
			onPress={onPress}
		>
			<View
				style={[
					styles.card,
					{
						backgroundColor: isDark
							? customColor['patchwork-dark-400']
							: '#FFFFFF',
					},
				]}
			>
				<View style={{ padding: 16, paddingBottom: 12 }}>
					<View style={styles.dateLabel}>
						<ThemeText
							style={{ fontSize: 11, color: isDark ? '#9FB3BC' : undefined }}
						>
							{formatDate(item.date)}
						</ThemeText>
						<View
							style={[
								styles.newsLabel,
								{
									backgroundColor: isDark ? '#23363D' : '#F1F5F4',
								},
							]}
						>
							<ThemeText
								className="font-NewsCycle_Bold"
								style={{
									color: isDark
										? customColor['patchwork-soft-primary']
										: '#3B82F6',
									fontSize: 10,
									letterSpacing: 0.5,
								}}
							>
								NEWS
							</ThemeText>
						</View>
					</View>

					<ThemeText
						className="font-NewsCycle_Bold"
						numberOfLines={3}
						style={{
							color: isDark ? '#ECF4F7' : undefined,
							fontSize: 15,
							lineHeight: 22,
							marginBottom: excerpt ? 8 : 0,
						}}
					>
						{title}
					</ThemeText>

					{excerpt ? (
						<ThemeText
							numberOfLines={2}
							style={{
								fontSize: 12,
								lineHeight: 18,
								color: isDark ? '#B8C7CE' : undefined,
							}}
						>
							{excerpt}
						</ThemeText>
					) : null}
				</View>

				{/* Footer — always at bottom */}
				<View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
					<View
						style={{
							height: 1,
							backgroundColor: isDark ? '#2A3E45' : '#F3F4F6',
							marginBottom: 10,
						}}
					/>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<ThemeText
							style={{ fontSize: 12, color: isDark ? '#D8E2E6' : undefined }}
						>
							Read article
						</ThemeText>
						<ThemeText
							style={{
								fontSize: 13,
								color: isDark
									? customColor['patchwork-soft-primary']
									: undefined,
							}}
						>
							→
						</ThemeText>
					</View>
				</View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		width: CARD_WIDTH,
		marginBottom: 12,
		borderRadius: 14,
		backgroundColor: '#FFFFFF',
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOpacity: 0.06,
				shadowRadius: 8,
				shadowOffset: { width: 0, height: 2 },
			},
			android: { elevation: 2 },
		}),
	},
	card: {
		borderRadius: 14,
		overflow: 'hidden',
		backgroundColor: '#FFFFFF',
	},
	dateLabel: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	newsLabel: {
		backgroundColor: '#F1F5F4',
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
});

export default NewsListCard;
