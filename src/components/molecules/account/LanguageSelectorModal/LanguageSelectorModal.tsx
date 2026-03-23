import { useCallback, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import {
	BottomSheetModal,
	BottomSheetFlatList,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useLanguageStore, ILanguage } from '@/store/feed/languageStore';
import { TotalLanguageList } from '@/util/constant/language';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { RadioButtonIcon } from '@/util/svg/icon.common';
import { GlobeIcon } from '@/util/svg/icon.profile';
import colors from 'tailwindcss/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LanguageSelectorModal = () => {
	const { colorScheme } = useColorScheme();
	const { t, i18n } = useTranslation();
	const { bottom } = useSafeAreaInsets();

	const { language, setLanguage } = useLanguageStore();

	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ['40%', '65%'], []);

	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	const handleLanguageChange = (langCode: ILanguage) => {
		setLanguage(langCode);
		i18n.changeLanguage(langCode);
		bottomSheetModalRef.current?.dismiss();
	};

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
			/>
		),
		[],
	);

	const renderItem = useCallback(
		({ item }: { item: { code: string; name: string } }) => (
			<Pressable
				onPress={() => handleLanguageChange(item.code as ILanguage)}
				className="flex-row items-center justify-between p-4 rounded-lg active:bg-slate-200 dark:active:bg-gray-600/50"
			>
				<ThemeText>{item.name}</ThemeText>
				{language === item.code && (
					<RadioButtonIcon
						isSelected={true}
						color={colorScheme === 'dark' ? '#FFF' : '#000'}
					/>
				)}
			</Pressable>
		),
		[language, colorScheme, handleLanguageChange],
	);

	return (
		<View>
			<Pressable
				onPress={handlePresentModalPress}
				className="flex-row bg-slate-50 p-3 rounded-2xl w-auto self-start"
			>
				<GlobeIcon fill={'#000'} width={18} height={18} />
				<ThemeText className="ml-2 -mt-[2] text-black">
					{language == 'pt-BR' ? 'pt' : language}
				</ThemeText>
			</Pressable>

			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={0}
				snapPoints={snapPoints}
				handleIndicatorStyle={{
					backgroundColor: colors.zinc[200],
				}}
				backgroundStyle={{
					backgroundColor: colorScheme === 'dark' ? '#18181b' : '#FFFFFF',
				}}
				backdropComponent={renderBackdrop}
			>
				<BottomSheetFlatList
					data={TotalLanguageList}
					keyExtractor={(i: { code: string }) => i.code}
					renderItem={renderItem}
					ListHeaderComponent={
						<ThemeText
							size="lg_18"
							className="text-center my-2 pb-3 border-b border-b-slate-200 dark:border-b-gray-700 font-NewsCycle_Bold"
						>
							{t('setting.appearance.language')}
						</ThemeText>
					}
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: bottom || 20,
					}}
				/>
			</BottomSheetModal>
		</View>
	);
};

export default LanguageSelectorModal;
