import { useCallback, useEffect, useState } from 'react';
import { Image, Keyboard, Pressable, View } from 'react-native';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import TextInput from '@/components/atoms/common/TextInput/TextInput';
import { CloseIcon, SearchIcon } from '@/util/svg/icon.common';
import { SearchStackScreenProps } from '@/types/navigation';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useSearchAllQueries } from '@/hooks/queries/hashtag.queries';
import SearchPeoplePostsResult from '@/components/organisms/search/SearchPeoplePostsResult/SearchPeoplePostsResult';
import ListEmptyComponent from '@/components/atoms/common/ListEmptyComponent/ListEmptyComponent';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import useDebounce from '@/hooks/custom/useDebounce';
import { queryClient } from '@/App';
import { SearchAllQueryKey } from '@/types/queries/hashtag.type';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import Header from '@/components/atoms/common/Header/Header';
import { useRef } from 'react';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

const SearchResults = ({
	navigation,
	route,
}: SearchStackScreenProps<'SearchResults'>) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();

	const [searchKeyword, setSearchKeyword] = useState('');
	const [finalKeyword, setFinalKeyword] = useState('');
	const startDebounce = useDebounce();
	const forceSearchRef = useRef(false);
	const isSearched = finalKeyword.length != 0;

	const isFocused = useSharedValue(0);

	const headerAnimatedStyle = useAnimatedStyle(() => {
		const shouldHide = isFocused.value || finalKeyword.length > 0;
		return {
			height: withTiming(shouldHide ? 0 : 56),
			opacity: withTiming(shouldHide ? 0 : 1),
			transform: [
				{
					translateY: withTiming(shouldHide ? -20 : 0),
				},
			],
		};
	}, [finalKeyword]);

	const cancelContainerAnimatedStyle = useAnimatedStyle(() => {
		const shouldHide = isFocused.value || finalKeyword.length > 0;
		return {
			width: withTiming(shouldHide ? 80 : 0),
			opacity: withTiming(shouldHide ? 1 : 0),
			transform: [
				{
					translateX: withTiming(shouldHide ? 0 : 25),
				},
			],
		};
	}, [finalKeyword]);

	const queryKey: SearchAllQueryKey = [
		'search-all',
		{
			q: finalKeyword,
			resolve: true,
			limit: 11,
		},
	];

	const { data: searchAllRes, isLoading: isLoadingSearchAll } =
		useSearchAllQueries({
			q: finalKeyword,
			resolve: true,
			limit: 11,
			options: { enabled: finalKeyword.length > 0 },
		});

	useEffect(() => {
		startDebounce(() => {
			if (forceSearchRef.current) {
				forceSearchRef.current = false;
				return;
			}
			if (searchKeyword.length >= 3) {
				setFinalKeyword(searchKeyword);
			} else {
				setFinalKeyword('');
			}
		}, 800);
	}, [searchKeyword]);

	const isEmptySearch =
		!searchAllRes ||
		(!searchAllRes.accounts?.length &&
			!searchAllRes.hashtags?.length &&
			!searchAllRes.statuses?.length);

	useFocusEffect(
		useCallback(() => {
			queryClient.invalidateQueries({ queryKey });
		}, []),
	);

	return (
		<SafeScreen>
			<View className="flex-1">
				<Pressable onPress={() => Keyboard.dismiss()}>
					<Animated.View style={[headerAnimatedStyle, { overflow: 'hidden' }]}>
						<Header title={t('screen.search')} />
					</Animated.View>

					<View className="flex-row items-center mx-4 mb-4">
						<View className="flex-1">
							<TextInput
								onFocus={() => (isFocused.value = 1)}
								onBlur={() => (isFocused.value = 0)}
								placeholder={t('search.search')}
								spellCheck={false}
								autoCorrect={false}
								value={searchKeyword}
								onChangeText={setSearchKeyword}
								onSubmitEditing={() => {
									forceSearchRef.current = true;
									setFinalKeyword(searchKeyword);
								}}
								startIcon={<SearchIcon className="mt-[2]" />}
								autoCapitalize="none"
								cursorColor={customColor['patchwork-primary']}
								endIcon={
									finalKeyword.length > 0 ? (
										<Pressable
											className="-mt-1"
											onPress={() => {
												setSearchKeyword('');
												setFinalKeyword('');
											}}
										>
											<CloseIcon colorScheme={colorScheme} />
										</Pressable>
									) : (
										<></>
									)
								}
								returnKeyType="search"
								returnKeyLabel="Search"
								enablesReturnKeyAutomatically={true}
							/>
						</View>
						<Animated.View
							style={[
								cancelContainerAnimatedStyle,
								{ overflow: 'hidden', justifyContent: 'center' },
							]}
						>
							<Pressable
								onPress={() => {
									Keyboard.dismiss();
									setSearchKeyword('');
									setFinalKeyword('');
								}}
								className="flex-1 justify-center items-center"
							>
								<ThemeText className="text-patchwork-primary dark:text-white ml-2">
									{t('common.cancel')}
								</ThemeText>
							</Pressable>
						</Animated.View>
					</View>
				</Pressable>

				{!isSearched ? (
					<Pressable
						className="flex-1 items-center mt-28"
						onPress={() => Keyboard.dismiss()}
					>
						<Image
							source={require('../../../assets/images/patchwork_logo.png')}
							style={{ width: 180, height: 180 }}
						/>
						<ThemeText className="font-NewsCycle_Bold tracking-wider">
							{t('search.search_text_guide')}
						</ThemeText>
					</Pressable>
				) : isLoadingSearchAll ? (
					<View className="flex-1 mx-6 my-2 justify-center items-center mt-5">
						<Flow
							size={30}
							color={
								colorScheme === 'dark'
									? customColor['patchwork-primary-dark']
									: customColor['patchwork-primary']
							}
						/>
					</View>
				) : isEmptySearch ? (
					<Pressable
						className="flex-1 justify-center items-center"
						onPress={() => Keyboard.dismiss()}
					>
						<ListEmptyComponent
							title={t('common.no_results')}
							className="-mt-7"
						/>
					</Pressable>
				) : (
					<SearchPeoplePostsResult
						searchAllRes={searchAllRes}
						q={finalKeyword}
					/>
				)}
			</View>
		</SafeScreen>
	);
};

export default SearchResults;
