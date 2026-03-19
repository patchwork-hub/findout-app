import React from 'react';
import { View } from 'react-native';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { DefaultBioTextForChannel } from '@/util/constant/socialMediaLinks';
import { useAuthStore } from '@/store/auth/authStore';
import { CHANNEL_INSTANCE } from '@/util/constant';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import { useTranslation } from 'react-i18next';

interface Profile {
	display_name?: string;
	bio?: string;
	metadata?: { name: string; value: string }[];
}

interface ProfileFormProps {
	profile?: Profile;
	onChangeName: (text: string) => void;
	onChangeBio: (text: string) => void;
	onChangeMetaLink: (
		index: number,
		field: 'name' | 'value',
		value: string,
	) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	profile,
	onChangeBio,
	onChangeName,
	onChangeMetaLink,
}) => {
	const { t } = useTranslation();
	const { userInfo } = useAuthStore();
	const { userOriginInstance } = useAuthStore();

	return (
		<View className={cn('mx-5 flex-1', isTablet ? 'w-[50%] self-center' : '')}>
			<ThemeText size={'md_16'}>{t('public_info')}</ThemeText>
			<ThemeText className="mt-3 mb-1">{t('display_name')}</ThemeText>
			<TextInput
				value={profile?.display_name || ''}
				onChangeText={onChangeName}
			/>
			<ThemeText className="mt-2 mb-1">{t('bio')}</ThemeText>
			<TextInput
				textArea
				value={profile?.bio?.replace(DefaultBioTextForChannel, '') || ''}
				onChangeText={onChangeBio}
			/>
			{[0, 1, 2, 3].map(index => (
				<View
					key={index}
					className="mt-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg  dark:bg-slate-900"
				>
					<TextInput
						placeholder={t('edit_profile.label')}
						value={profile?.metadata?.[index]?.name || ''}
						onChangeText={text => onChangeMetaLink(index, 'name', text)}
					/>
					<View className="h-3" />
					<TextInput
						placeholder={t('edit_profile.content')}
						value={profile?.metadata?.[index]?.value || ''}
						onChangeText={text => onChangeMetaLink(index, 'value', text)}
					/>
				</View>
			))}
			{userInfo?.note?.includes(DefaultBioTextForChannel) &&
				userOriginInstance == CHANNEL_INSTANCE && (
					<View className="bg-slate-100 dark:bg-patchwork-dark-50 opacity-80 dark:opacity-100 py-3 px-5 -mt-2 rounded-bl-lg rounded-br-lg">
						<ThemeText className="text-slate-600 dark:text-slate-300">
							{DefaultBioTextForChannel}
						</ThemeText>
					</View>
				)}
		</View>
	);
};

export default ProfileForm;
