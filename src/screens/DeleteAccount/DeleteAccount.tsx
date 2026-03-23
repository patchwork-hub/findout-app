import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Flow } from 'react-native-animated-spinkit';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import { Button } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import DeleteAccountConfirmation from '@/components/molecules/account/DeleteAccountConfirmation/DeleteAccountConfirmation';
import DeleteAccountConfirmPassword from '@/components/molecules/account/DeleteAccountConfirmPassword/DeleteAccountConfirmPassword';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';

import { useDeleteAccMutation } from '@/hooks/mutations/auth.mutation';
import { useAuthStore } from '@/store/auth/authStore';
import {
	deleteAccountSchema,
	DeleteAccountFormValues,
} from '@/util/schema/deleteAccountSchema';
import { layoutAnimation } from '@/util/helper/timeline';
import { removeAccount, switchActiveAccount } from '@/util/storage';
import { queryClient } from '@/App';
import {
	usePushNotiRevokeTokenMutation,
	usePushNotiTokenMutation,
} from '@/hooks/mutations/pushNoti.mutation';
import { usePushNoticationStore } from '@/store/pushNoti/pushNotiStore';
import { useAccounts } from '@/hooks/custom/useAccounts';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';

const DeleteAccount = () => {
	const { t } = useTranslation();
	const [step, setStep] = useState(1);
	const {
		actions: { clearAuthState },
	} = useAuthStore();
	const fcmToken = usePushNoticationStore(state => state.fcmToken);
	const { mutateAsync: revokePushToken } = usePushNotiRevokeTokenMutation({});
	const { mutateAsync: registerPushToken } = usePushNotiTokenMutation({});
	const { fetchAccounts, activeAccId } = useAccounts();
	const { clearAudience } = useCreateAudienceStore();

	const handleStepChange = (nextStep: number) => {
		layoutAnimation();
		setStep(nextStep);
	};

	const { mutate: deleteAcc, isPending } = useDeleteAccMutation({
		onMutate: async () => {
			// noted: revoke push token here to prevent 403 error from server
			try {
				if (fcmToken) {
					await revokePushToken({
						notification_token: fcmToken,
					}).catch(e =>
						console.error('Failed to revoke notification token:', e),
					);
				}
			} catch (error) {
				console.error('Failed to revoke notification token:', error);
			}
		},
		onSuccess: async () => {
			if (activeAccId) {
				await removeAccount(activeAccId);
			}

			await switchActiveAccount(null);
			await fetchAccounts();
			clearAudience();
			queryClient.clear();

			Toast.show({
				type: 'success',
				text1: t('common.success'),
				text2: t('account_deleted_successfully'),
			});

			clearAuthState();
		},
		onError: async error => {
			// noted: re-register the push token if account deletion fails
			if (fcmToken) {
				try {
					await registerPushToken({
						notification_token: fcmToken,
						platform_type: Platform.OS,
					});
				} catch (e) {
					console.error('Failed to resubscribe push token:', e);
				}
			}

			Toast.show({
				type: 'error',
				text1: t('common.error'),
				text2: error.message,
			});
		},
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<DeleteAccountFormValues>({
		resolver: yupResolver(deleteAccountSchema),
		defaultValues: {
			currentPassword: '',
		},
	});

	const onSubmit = async (data: DeleteAccountFormValues) => {
		deleteAcc({ password: data.currentPassword });
	};

	return (
		<SafeScreen>
			<Header
				title={t('setting.delete_account')}
				leftCustomComponent={<BackButton />}
			/>
			<View className="flex-row mx-5 mt-4 mb-2">
				<View
					className={`flex-1 h-[5px] rounded-full mr-1 ${
						step >= 1
							? 'bg-patchwork-primary dark:bg-patchwork-primary-dark'
							: 'bg-slate-200 dark:bg-slate-700'
					}`}
				/>
				<View
					className={`flex-1 h-[5px] rounded-full ml-1 ${
						step >= 2
							? 'bg-patchwork-primary dark:bg-patchwork-primary-dark'
							: 'bg-slate-200 dark:bg-zinc-800'
					}`}
				/>
			</View>
			<KeyboardAwareScrollView
				className="flex-1"
				keyboardShouldPersistTaps={'handled'}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{step === 1 ? (
					<Animated.View
						key="step-1"
						entering={FadeInRight.duration(300)}
						exiting={FadeOutLeft.duration(300)}
					>
						<DeleteAccountConfirmation />
					</Animated.View>
				) : (
					<Animated.View
						key="step-2"
						entering={FadeInRight.duration(300)}
						exiting={FadeOutLeft.duration(300)}
					>
						<DeleteAccountConfirmPassword control={control} errors={errors} />
					</Animated.View>
				)}
			</KeyboardAwareScrollView>

			<View className="px-5 py-4 border-t border-slate-100 dark:border-slate-900">
				{step === 1 ? (
					<Button
						onPress={() => handleStepChange(2)}
						className="h-[48] bg-patchwork-primary dark:bg-patchwork-primary-dark"
					>
						<ThemeText className="text-white font-NewsCycle_Bold">
							{t('common.continue')}
						</ThemeText>
					</Button>
				) : (
					<View className="flex-row gap-x-2">
						<Button
							onPress={() => handleStepChange(1)}
							variant="outline"
							className="flex-1 h-[48]"
							disabled={isPending}
						>
							<ThemeText>{t('common.cancel')}</ThemeText>
						</Button>
						<Button
							onPress={handleSubmit(onSubmit)}
							className="flex-1 h-[48] bg-patchwork-primary dark:bg-patchwork-primary-dark"
							disabled={isPending}
						>
							{isPending ? (
								<Flow size={25} color={'#fff'} />
							) : (
								<ThemeText className="text-white font-NewsCycle_Bold">
									{t('delete_account')}
								</ThemeText>
							)}
						</Button>
					</View>
				)}
			</View>
		</SafeScreen>
	);
};

export default DeleteAccount;
