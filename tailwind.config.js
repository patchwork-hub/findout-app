require('dotenv').config();
/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		'./src/App.{js,jsx,ts,tsx}',
		'./src/screens/**/*.{js,jsx,ts,tsx}',
		'./src/components/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				Inter_Bold: ['Inter-Bold'],
				Inter_Medium: ['Inter-Medium'],
				Inter_Regular: ['Inter-Regular'],
				Inter_SemiBold: ['Inter-SemiBold'],
				Inter_Italic: ['Inter-Italic'],
				BBHSansBogle_Regular: ['BBHSansBogle-Regular'],
				BBHSansHegarty_Regular: ['BBHSansHegarty-Regular'],
				IBMPlexSansCondensed_Bold: ['IBMPlexSansCondensed-Bold'],
				IBMPlexSansCondensed_Regular: ['IBMPlexSansCondensed-Regular'],
				NewsCycle_Bold: ['NewsCycle-Bold'],
			},
			colors: {
				'patchwork-dark-50': '#585e62',
				'patchwork-dark-100': '#0D0D0D',
				'patchwork-grey-50': '#f8f8f8',
				'patchwork-grey-70': '#434A4F',
				'patchwork-grey-100': '#545458A6',
				'patchwork-grey-400': '#969A9D',
				'patchwork-dark-400': '#15191B',
				'patchwork-dark-900': '#000',
				'patchwork-light-50': '#f1f4f8',
				'patchwork-light-100': '#f2f7fc',
				'patchwork-light-900': '#fff',
				'patchwork-red-50': '#ff3c26',
				'patchwork-red-600': '#ff3c26',
				'skeleton-highlight': '#7A8288',
				'skeleton-bg': '#585e62',
				'modal-bg': 'rgba(0, 0, 0, 0.5)',
				'patchwork-primary': '#ff3c26', //#cf4af0
				'patchwork-primary-dark': '#ff3c26',
				'patchwork-secondary': '#3fa7e8',
				'patchwork-flourish': '#45e67a',
				'patchwork-foundation-blue': '#001347',
				'patchwork-soft-primary': '#ff3c26',
			},
		},
	},
	plugins: [],
	// darkMode: 'class',
};
