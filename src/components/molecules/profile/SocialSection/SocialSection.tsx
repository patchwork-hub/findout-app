import { Linking, Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { extractPlainText } from '@/util/helper/helper';
import { useCallback, useMemo, useRef } from 'react';
import {
	BottomSheetBackdrop,
	BottomSheetFlatList,
	BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { PrimaryBadgeIcon } from '@/util/svg/icon.common';
import { SOCIAL_MEDIA_LINKS } from '@/util/constant/socialMediaLinks';
import { cleanText } from '@/util/helper/cleanText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import customColor from '@/util/constant/color';

type ColorScheme = 'dark' | 'light';

type SocialSectionProps = {
	accountInfo: Patchwork.Account;
	isMyAccount?: boolean;
};

const getSocialMatch = (value: string, scheme: ColorScheme) => {
	const normalized = value.toLowerCase().trim();
	const match = SOCIAL_MEDIA_LINKS.find(social =>
		social.pattern.test(normalized),
	);
	const fallback = SOCIAL_MEDIA_LINKS[SOCIAL_MEDIA_LINKS.length - 1];
	const result = match || fallback;
	return {
		icon: result.icon(scheme),
		title: result.title,
		pattern: result.pattern,
	};
};

const SocialSection = ({ accountInfo }: SocialSectionProps) => {
	const { colorScheme } = useColorScheme();
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ['75%'], []);
	const { bottom } = useSafeAreaInsets();

	const links = useMemo(
		() => accountInfo.fields.filter(item => item.value?.trim()),
		[accountInfo.fields],
	);

	const handlePresentModalPress = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	if (links.length === 0) return null;

	const currentScheme = colorScheme ?? 'light';

	return (
		<View className="px-4 py-2">
			<Pressable
				onPress={handlePresentModalPress}
				className="flex-row items-center pt-1.5"
			>
				{links.map((link, index) => {
					const match = getSocialMatch(link.value, currentScheme);
					return (
						<View
							key={index}
							className="aspect-square justify-center items-center mx-1.5 p-1.5 rounded-full bg-patchwork-light-100 dark:bg-neutral-800 shadow-sm"
						>
							{match.icon}
						</View>
					);
				})}
			</Pressable>

			<BottomSheetModal
				ref={bottomSheetModalRef}
				index={0}
				snapPoints={snapPoints}
				backdropComponent={props => (
					<BottomSheetBackdrop
						{...props}
						disappearsOnIndex={-1}
						appearsOnIndex={0}
					/>
				)}
				backgroundStyle={{
					backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
				}}
				handleIndicatorStyle={{
					backgroundColor: '#cbd5e1',
				}}
			>
				<BottomSheetFlatList
					data={links}
					contentContainerStyle={{ paddingBottom: bottom || 20 }}
					keyExtractor={(item: any, index: any) => `${item.value}-${index}`}
					renderItem={({ item }: { item: any }) => {
						const currentScheme = colorScheme ?? 'light';
						const socialMatch = getSocialMatch(item.value, currentScheme);
						const displayTitle = item.name?.trim() || socialMatch.title;
						const plainText = extractPlainText(item.value);
						const isLink = /^(https?:\/\/|www\.)/i.test(plainText);

						return (
							<Pressable
								className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800"
								onPress={() => {
									const url = cleanText(item.value);
									const formattedUrl = url.startsWith('www.')
										? `https://${url}`
										: url;
									Linking.openURL(formattedUrl);
								}}
							>
								<View className="w-12 h-12 rounded-2xl justify-center items-center bg-patchwork-light-100 dark:bg-patchwork-dark-400 shadow-sm">
									{socialMatch.icon}
								</View>

								<View className="flex-1 ml-4">
									<View className="flex-row items-center mb-1">
										<ThemeText className="font-NewsCycle_Bold text-base mr-2">
											{displayTitle}
										</ThemeText>
									</View>
									<ThemeText
										variant={isLink ? 'textPrimary' : 'textGrey'}
										size="xs_12"
										numberOfLines={1}
										className={
											isLink ? 'text-blue-500 underline' : 'text-gray-500'
										}
									>
										{plainText}
									</ThemeText>
								</View>

								{item.verified_at && <PrimaryBadgeIcon className="scale-75" />}
							</Pressable>
						);
					}}
					ListHeaderComponent={
						<ThemeText className="text-center font-NewsCycle_Bold py-4 text-lg">
							Links
						</ThemeText>
					}
				/>
			</BottomSheetModal>
		</View>
	);
};

export default SocialSection;
