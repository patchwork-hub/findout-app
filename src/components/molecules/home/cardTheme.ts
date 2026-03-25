import { homeCardAccentPalette } from '@/util/constant/color';

type TermLike = {
	id?: number | string;
	slug?: string;
	name?: string;
};

const hashString = (value: string) => {
	let hash = 0;

	for (let i = 0; i < value.length; i += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}

	return Math.abs(hash);
};

export const getTermAccentColor = (term: TermLike) => {
	const seed = term.slug ?? String(term.id ?? term.name ?? '');
	const index = hashString(seed) % homeCardAccentPalette.length;

	return homeCardAccentPalette[index];
};
