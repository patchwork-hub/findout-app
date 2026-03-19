import React, { useEffect, useState } from 'react';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { DeleteIcon } from '@/util/svg/icon.common';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import Chip from '@/components/atoms/common/Chip/Chip';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { Button } from '@/components/atoms/common/Button/Button';
import { Icons, SOCIAL_MEDIA_LINKS } from '@/util/constant/socialMediaLinks';
import { capatilizeStr } from '@/util/helper/helper';
import { GlobeIcon } from '@/util/svg/icon.profile';
import { cleanText } from '@/util/helper/cleanText';
import { extractUsername } from '@/util/helper/socialLink';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

const { height: screenHeight } = Dimensions.get('window');

type Props = {
	openThemeModal: boolean;
	onClose: () => void;
	onPressAdd: (
		linkTitle: string,
		username: string,
		customCallback?: () => void,
	) => void;
	onPressDelete: (linkTitle: string) => void;
	data: Patchwork.Field[];
	formType: 'add' | 'edit';
};

export type SocialMediaLink = {
	icon: React.ReactElement;
	title: string;
};

const SocialLink: React.FC<Props> = ({
	openThemeModal,
	onClose,
	onPressAdd,
	formType,
	data,
	onPressDelete,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const [selectedLink, setSelectedLink] = useState<SocialMediaLink | null>(
		null,
	);
	const [username, setUsername] = useState<string | null>(null);

	const getLinks = (): SocialMediaLink[] => {
		const platformTitles = new Set(SOCIAL_MEDIA_LINKS.map(link => link.title));

		if (formType === 'edit') {
			return data
				.filter(item => platformTitles.has(item.name))
				.map(item => {
					const iconFunction = Icons[capatilizeStr(item.name)];
					return {
						icon: iconFunction ? (
							iconFunction(colorScheme)
						) : (
							<GlobeIcon colorScheme={colorScheme} />
						),
						title: item.name,
					};
				});
		}

		return SOCIAL_MEDIA_LINKS.filter(
			link => !data.some(item => item.name === link.title),
		).map(link => ({
			icon: link.icon(colorScheme),
			title: link.title,
		}));
	};

	useEffect(() => {
		if (!openThemeModal) return;
		if (formType === 'edit' && data && selectedLink) {
			const relatedData = data.find(item => item.name === selectedLink.title);
			const extractedUsername =
				selectedLink.title === 'Website'
					? cleanText(relatedData?.value || '')
					: extractUsername(cleanText(relatedData?.value || ''));
			setUsername(extractedUsername || null);
		}
	}, [formType, data, selectedLink]);

	const handleBack = () => {
		setTimeout(() => {
			setSelectedLink(null);
			setUsername(null);
		}, 600);
	};

	const handleAdd = () => {
		if (username && selectedLink) {
			handleBack();
			onPressAdd(selectedLink.title, username);
		}
	};

	const socialLinkIcons = getLinks();

	return (
		<ThemeModal
			visible={openThemeModal}
			position="bottom"
			onClose={() => {
				onClose();
				handleBack();
			}}
			type={'simple'}
			title={
				formType === 'edit'
					? t('social_links.edit_link')
					: t('social_links.add_new_link')
			}
			showBackButton={selectedLink ? true : false}
			onPressBackButton={handleBack}
			modalHeight={screenHeight * 0.8}
		>
			{selectedLink ? (
				<View
					className={cn(
						'items-start mt-3',
						isTablet ? 'w-[50%] self-center' : '',
					)}
				>
					<Chip
						variant="white"
						className="dark:bg-slate-50 m-1 w-auto mb-3"
						startIcon={selectedLink.icon}
						title={selectedLink.title}
						disabled
					/>
					<TextInput
						value={username || ''}
						onChangeText={setUsername}
						className={cn(
							'flex-1',
							colorScheme === 'dark' ? 'text-white' : 'text-black',
						)}
						placeholder={
							selectedLink.title == 'Website'
								? t('social_links.website_placeholder')
								: t('social_links.username')
						}
						autoCapitalize="none"
						autoFocus
					/>
					<Button
						onPress={handleAdd}
						className="mt-5 w-full"
						variant="outline"
						disabled={!username}
					>
						<ThemeText>
							{formType === 'edit' ? t('timeline.edit') : t('common.add')}
						</ThemeText>
					</Button>
				</View>
			) : (
				<View className={`flex-row flex-wrap mt-3`}>
					{socialLinkIcons.length > 0 &&
						socialLinkIcons.map(link => (
							<View
								key={link.title}
								className={`flex-row ${formType === 'edit' ? 'mr-2 mb-4' : ''}`}
							>
								<Chip
									variant="white"
									className="dark:bg-slate-50 m-1"
									startIcon={link.icon}
									title={link.title}
									onPress={() => setSelectedLink(link)}
								/>
								{formType === 'edit' && (
									<TouchableOpacity
										onPress={() => {
											onPressDelete(link.title);
											if (socialLinkIcons.length === 1) {
												onClose();
												handleBack();
											}
										}}
										className="absolute -right-2 -top-3 bg-slate-200 dark:bg-slate-50 rounded-full justify-center items-center w-7 h-7 active:opacity-80"
									>
										<DeleteIcon fill={customColor['patchwork-red-50']} />
									</TouchableOpacity>
								)}
							</View>
						))}
				</View>
			)}
		</ThemeModal>
	);
};

export default SocialLink;
