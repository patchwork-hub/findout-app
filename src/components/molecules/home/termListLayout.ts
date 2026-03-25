const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const getTermListLayout = (screenWidth: number) => {
	const horizontalPadding = 16;
	const columnGap = 12;
	const columns = screenWidth >= 820 ? 2 : 1;
	const availableWidth =
		screenWidth - horizontalPadding * 2 - columnGap * (columns - 1);
	const cardWidth = Math.floor(availableWidth / columns);
	const cardHeight = clamp(Math.round(cardWidth * 0.46), 150, 210);

	return {
		columns,
		cardWidth,
		cardHeight,
		horizontalPadding,
		columnGap,
	};
};
