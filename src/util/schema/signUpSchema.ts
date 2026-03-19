import { TFunction } from 'i18next';
import * as yup from 'yup';
import { getAgeInYears, parseDateOfBirth } from '../helper/signUpValidation';

export const getSignUpSchema = (t: TFunction, minAge?: number) =>
	yup.object().shape({
		email: yup
			.string()
			.email(t('validation.invalid_email'))
			.required(t('validation.email_required')),

		username: yup
			.string()
			.matches(/^[a-zA-Z0-9_]+$/, t('validation.username_pattern'))
			.min(3, t('validation.username_min'))
			.max(20, t('validation.username_max'))
			.required(t('validation.username_required')),

		dateOfBirth: yup.string().when([], {
			is: () => typeof minAge === 'number' && minAge > 0,
			then: schema =>
				schema
					.required(t('validation.dob_required') || 'Date of birth is required')
					.test(
						'valid-date-of-birth',
						t('validation.invalid_date') || 'Invalid date of birth',
						value => {
							if (!value) return true;
							return Boolean(parseDateOfBirth(value));
						},
					)
					.test(
						'minimum-age',
						t('validation.minimum_age', { minAge }) ||
							`You must be at least ${minAge} years old`,
						value => {
							if (!value || typeof minAge !== 'number' || minAge <= 0) {
								return true;
							}

							const parsedDate = parseDateOfBirth(value);
							if (!parsedDate) return false;

							const age = getAgeInYears(parsedDate);
							return age >= minAge;
						},
					),
			otherwise: schema => schema.notRequired(),
		}),

		createPassword: yup
			.string()
			.min(6, t('validation.password_min'))
			.required(t('validation.password_required')),

		repeatPassword: yup
			.string()
			.oneOf([yup.ref('createPassword')], t('validation.passwords_must_match'))
			.required(t('validation.confirm_password_required')),
	});

export type SignUpFormType = yup.InferType<ReturnType<typeof getSignUpSchema>>;
