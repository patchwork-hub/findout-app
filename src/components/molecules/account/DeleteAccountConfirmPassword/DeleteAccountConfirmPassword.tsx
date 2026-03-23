import { View, Pressable } from 'react-native';
import React, { useState } from 'react';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { DeleteAccountFormValues } from '@/util/schema/deleteAccountSchema';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { PasswordEyeCloseIcon, PasswordEyeIcon } from '@/util/svg/icon.common';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

type Props = {
	control: Control<DeleteAccountFormValues>;
	errors: FieldErrors<DeleteAccountFormValues>;
};

const DeleteAccountConfirmPassword = ({ control, errors }: Props) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const [pwVisibility, setPwVisibility] = useState({
		password: false,
		repeat_password: false,
	});

	return (
		<View className="mx-5 mb-10 mt-6">
			<ThemeText className="font-NewsCycle_Bold text-xl mb-4">
				{t('delete_account_confirm.confirm_step_title')}
			</ThemeText>

			<ThemeText className="mt-2 mb-5 font-OpenSans_Regular text-patchwork-primary dark:text-patchwork-primary-dark">
				{t('delete_account_confirm.password_step_warning')}
			</ThemeText>
			<View className="mx-2">
				<Controller
					name="currentPassword"
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								placeholder={t('login.password')}
								onChangeText={onChange}
								onBlur={onBlur}
								value={value}
								secureTextEntry={!pwVisibility.password}
								endIcon={
									<Pressable
										className="px-2 py-2 -mt-2 active:opacity-80"
										onPress={() =>
											setPwVisibility(prev => ({
												...prev,
												password: !prev.password,
											}))
										}
									>
										{pwVisibility.password ? (
											<PasswordEyeIcon
												fill={colorScheme === 'dark' ? 'white' : 'gray'}
												className=""
											/>
										) : (
											<PasswordEyeCloseIcon
												fill={colorScheme === 'dark' ? 'white' : 'gray'}
											/>
										)}
									</Pressable>
								}
								extraContainerStyle="mb-4 overflow-hidden"
							/>
							{errors.currentPassword && (
								<ThemeText
									size="xs_12"
									variant={'textOrange'}
									className="-mt-2 mb-2"
								>
									{'*' + errors.currentPassword.message}
								</ThemeText>
							)}
						</View>
					)}
				/>
			</View>
		</View>
	);
};

export default DeleteAccountConfirmPassword;
