import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ILanguage =
	| 'en'
	| 'ja'
	| 'cy'
	| 'de'
	| 'fr'
	| 'it'
	| 'pt-BR'
	| 'es'
	| 'my'
	| 'en-GB'
	| 'fi'
	| 'da'
	| 'pt-PT';

export const supportedLanguage = [
	'en', // 'English (US)',
	'ja',
	'cy',
	'de',
	'fr',
	'it',
	'pt-BR',
	'es',
	'my',
	'en-GB', // 'English (UK)',
	'fi',
	'da',
	'pt-PT',
];

interface LanguageState {
	language: ILanguage;
	defaultGuestLanguage: ILanguage;
	setLanguage: (lang: ILanguage) => void;
	setDefaultGuestLanguage: (lang: ILanguage) => void;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		set => ({
			language: 'en',
			defaultGuestLanguage: 'en',
			setLanguage: lang => set({ language: lang }),
			setDefaultGuestLanguage: lang =>
				set({
					defaultGuestLanguage: lang,
				}),
		}),
		{
			name: 'language-settings-storage',
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
