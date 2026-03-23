import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';

const darkToLightColorMappings: Record<string, ColorKeys> = {
	'patchwork-dark-50': 'patchwork-light-50',
	'patchwork-dark-100': 'patchwork-light-900',
	'patchwork-light-900': 'patchwork-dark-100',
};

const colorNameToHash: Record<string, string> = {
	'patchwork-dark-50': customColor['patchwork-dark-50'],
	'patchwork-dark-100': customColor['patchwork-dark-100'],
	'patchwork-dark-900': customColor['patchwork-dark-900'],
	'patchwork-dark-400': customColor['patchwork-dark-400'],
	'patchwork-light-50': customColor['patchwork-light-50'],
	'patchwork-light-900': customColor['patchwork-light-900'],
	'patchwork-grey-100': customColor['patchwork-grey-400'],
	'patchwork-red-50': customColor['patchwork-red-50'],
	'patchwork-primary': customColor['patchwork-primary'],
	'patchwork-primary-dark': customColor['patchwork-primary-dark'],
	'patchwork-soft-primary': customColor['patchwork-soft-primary'],
	'slate-400': colors.slate[400],
	'slate-100': colors.slate[100],
};

type NestedKeys<T> = {
	[K in keyof T]: T[K] extends object
		? `${string & K}-${NestedKeys<T[K]>}`
		: string & K;
}[keyof T];

type ColorKeys = NestedKeys<DefaultColors> | keyof typeof customColor;

const useAppropiateColorHash = (
	darkmodeColor: ColorKeys,
	lightmodeColor?: ColorKeys,
) => {
	const { colorScheme } = useColorScheme();

	const chosenLightModeColor =
		lightmodeColor || (darkToLightColorMappings[darkmodeColor] ?? 'white');

	const str = colorScheme === 'dark' ? darkmodeColor : chosenLightModeColor;
	return colorNameToHash[str] ?? 'white';
};

export default useAppropiateColorHash;
