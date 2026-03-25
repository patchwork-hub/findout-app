const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const getWpHomeCardSize = (screenWidth: number) => {
	const width = clamp(Math.round(screenWidth * 0.58), 200, 280);
	const imageHeight = Math.round(width * 0.62);
	const height = imageHeight + 104;

	return { width, height, imageHeight };
};

export const getWpNewsCardSize = (screenWidth: number) => {
	const width = clamp(Math.round(screenWidth * 0.58), 200, 280);
	const height = Math.round(width * 0.72);
	return { width, height };
};
