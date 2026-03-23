import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as en_GB from './translations/en-GB';
import * as en from './translations/en';
import * as fi from './translations/fi';
import * as da from './translations/da';
import * as pt_PT from './translations/pt-PT';
import * as ja from './translations/ja';
import * as cy from './translations/cy';
import * as de from './translations/de';
import * as fr from './translations/fr';
import * as it from './translations/it';
import * as es from './translations/es';
import * as pt_BR from './translations/pt-BR';
import * as my from './translations/my';

type TupleUnion<U extends string, R extends unknown[] = []> = {
	[S in U]: Exclude<U, S> extends never
		? [...R, S]
		: TupleUnion<Exclude<U, S>, [...R, S]>;
}[U];

const ns = Object.keys(en) as TupleUnion<keyof typeof en>;

export const defaultNS = ns[0];

void i18n.use(initReactI18next).init({
	ns,
	defaultNS,
	resources: {
		en,
		'en-GB': en_GB,
		fi,
		da,
		'pt-PT': pt_PT,
		ja,
		cy,
		de,
		fr,
		it,
		'pt-BR': pt_BR,
		es,
		my,
	},
	lng: 'en',
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
	compatibilityJSON: 'v3',
});

export default i18n;
