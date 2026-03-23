import * as yup from 'yup';

export const deleteAccountSchema = yup.object().shape({
	currentPassword: yup
		.string()
		.min(6, 'Password must be at least 6 characters long')
		.required('Password is required'),
});

export type DeleteAccountFormValues = yup.InferType<typeof deleteAccountSchema>;
