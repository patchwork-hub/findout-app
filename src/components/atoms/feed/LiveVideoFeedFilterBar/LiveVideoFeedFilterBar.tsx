import { Pressable, View, ScrollView } from 'react-native';
import {
	Menu,
	MenuOption,
	MenuOptions,
	MenuTrigger,
} from 'react-native-popup-menu';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown, faList } from '@fortawesome/free-solid-svg-icons';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { GridIcon } from '@/util/svg/icon.common';
import { useGetWordpressCategories } from '@/hooks/queries/wpFeed.queries';

interface LiveVideoFeedFilterBarProps {
	viewMode: 'grid' | 'list';
	onViewModeChange: (mode: 'grid' | 'list') => void;
	filter: string;
	onFilterChange: (filter: string, categoryId?: number | string) => void;
}

const LiveVideoFeedFilterBar = ({
	viewMode,
	onViewModeChange,
	filter,
	onFilterChange,
}: LiveVideoFeedFilterBarProps) => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const { data: categories } = useGetWordpressCategories();

	return (
		<View className="flex-row justify-between items-center px-4 py-3 bg-white dark:bg-black z-50">
			<View className="z-50">
				<Menu>
					<MenuTrigger
						customStyles={{
							triggerOuterWrapper: {
								backgroundColor: isDark ? '#000' : '#fff',
							},
						}}
					>
						<View className="flex-row items-center rounded-md border border-gray-300 dark:border-neutral-700 px-4 py-2 min-w-[120px] justify-between">
							<ThemeText className="text-md font-medium text-black dark:text-white mr-4">
								{filter}
							</ThemeText>
							<FontAwesomeIcon
								icon={faCaretDown}
								size={18}
								color={isDark ? 'white' : 'black'}
							/>
						</View>
					</MenuTrigger>

					<MenuOptions
						customStyles={{
							optionsContainer: {
								marginTop: 60,
								backgroundColor: isDark ? colors.zinc[900] : 'white',
								borderColor: isDark ? colors.zinc[800] : colors.gray[200],
								borderWidth: 0.5,
								borderRadius: 8,
								width: 200,
								maxHeight: 300,
							},
						}}
					>
						<ScrollView
							nestedScrollEnabled
							showsVerticalScrollIndicator={false}
						>
							<MenuOption
								onSelect={() => onFilterChange('Most recent')}
								customStyles={{
									optionWrapper: {
										padding: 16,
										borderBottomColor: isDark
											? colors.zinc[800]
											: colors.gray[200],
										borderBottomWidth: 0.5,
									},
									optionTouchable: {
										underlayColor: isDark ? colors.zinc[800] : colors.gray[100],
										activeOpacity: 1,
									},
								}}
							>
								<ThemeText className="text-md">Most recent</ThemeText>
							</MenuOption>
							{categories?.map(cat => (
								<MenuOption
									key={cat.id}
									onSelect={() => onFilterChange(cat.name, cat.id)}
									customStyles={{
										optionWrapper: {
											padding: 12,
											paddingLeft: 16,
										},
										optionTouchable: {
											underlayColor: isDark
												? colors.zinc[800]
												: colors.gray[100],
											activeOpacity: 1,
										},
									}}
								>
									<ThemeText className="text-md">{cat.name}</ThemeText>
								</MenuOption>
							))}
							<MenuOption
								onSelect={() => onFilterChange('Oldest')}
								customStyles={{
									optionWrapper: {
										padding: 12,
										paddingLeft: 16,
										borderTopColor: isDark
											? colors.zinc[800]
											: colors.gray[200],
										borderTopWidth: 0.5,
									},
									optionTouchable: {
										underlayColor: isDark ? colors.zinc[800] : colors.gray[100],
										activeOpacity: 1,
									},
								}}
							>
								<ThemeText className="text-md">Oldest</ThemeText>
							</MenuOption>
						</ScrollView>
					</MenuOptions>
				</Menu>
			</View>

			<View className="flex-row gap-2">
				<Pressable
					onPress={() => onViewModeChange('grid')}
					className={`p-5 justify-center items-center w-[35px] h-[35px] rounded-md ${
						viewMode === 'grid'
							? 'bg-patchwork-primary'
							: 'bg-white border border-gray-200 dark:bg-black dark:border-neutral-700'
					}`}
				>
					{/* <FontAwesomeIcon
						icon={faTableCellsLarge}
						size={16}
						color={viewMode === 'grid' ? 'white' : isDark ? 'white' : 'black'}
					/> */}
					<GridIcon
						width={20}
						height={20}
						fill={viewMode === 'grid' ? 'white' : isDark ? 'white' : 'black'}
					/>
				</Pressable>
				<Pressable
					onPress={() => onViewModeChange('list')}
					className={`p-5 justify-center items-center w-[35px] h-[35px] rounded-md ${
						viewMode === 'list'
							? 'bg-patchwork-primary'
							: 'bg-white border border-gray-200 dark:bg-black dark:border-neutral-700'
					}`}
				>
					<FontAwesomeIcon
						icon={faList}
						size={20}
						color={viewMode === 'list' ? 'white' : isDark ? 'white' : 'black'}
					/>
				</Pressable>
			</View>
		</View>
	);
};

export default LiveVideoFeedFilterBar;
