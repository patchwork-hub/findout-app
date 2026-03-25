import { SkeletonTheme } from './SkeletonLoader.types';

export const SKELETON_COLORS: { dark: SkeletonTheme; light: SkeletonTheme } = {
	dark: {
		skeleton: '#3D3D3D',
		cardBg: '#2A2A2A',
		cardBorder: 'transparent',
		accent: '#4A5568',
		divider: '#3D3D3D',
	},
	light: {
		skeleton: '#DCDCDC',
		cardBg: '#FFFFFF',
		cardBorder: '#E5E7EB',
		accent: '#CBD5E0',
		divider: '#E5E5E5',
	},
};
