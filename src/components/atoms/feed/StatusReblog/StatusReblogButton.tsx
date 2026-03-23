import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useQuoteStore } from '@/store/feed/quoteStore';
import { HomeStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { formatNumber } from '@/util/helper/helper';
import { AppIcons } from '@/util/icons/icon.common';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Pressable,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from 'react-native';
import {
	Menu,
	MenuOption,
	MenuOptions,
	MenuTrigger,
} from 'react-native-popup-menu';
import Underline from '../../common/Underline/Underline';
import { cn } from '@/util/helper/twutil';
import { StatusRepostIcon } from '@/util/svg/icon.status_actions';

type Props = {
	count: number;
	status: Patchwork.Status;
	onBoost: () => void;
	alreadyReblogged: boolean | undefined;
} & TouchableOpacityProps;

const StatusReblogButton = ({ count, status, onBoost, ...props }: Props) => {
	const { colorScheme } = useColorScheme();
	const [isMenuVisible, setMenuVisible] = useState(false);
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { setQuotedStatus } = useQuoteStore();
	const { t } = useTranslation();

	const toggleMenu = () => {
		setMenuVisible(p => !p);
	};

	return (
		<Menu
			opened={isMenuVisible}
			onBackdropPress={toggleMenu}
			style={{ marginTop: 6 }}
		>
			<MenuTrigger>
				<Pressable
					onPress={toggleMenu}
					className="flex-row items-center gap-1"
					{...props}
				>
					<StatusRepostIcon
						fill={
							(status?.reblogged || status.reblog?.reblogged) &&
							colorScheme == 'dark'
								? customColor['patchwork-soft-primary']
								: (status?.reblogged || status.reblog?.reblogged) &&
								  colorScheme == 'light'
								? customColor['patchwork-primary']
								: colorScheme == 'dark'
								? customColor['patchwork-grey-400']
								: customColor['patchwork-grey-100']
						}
					/>
					<ThemeText variant="textGrey">{count}</ThemeText>
				</Pressable>
			</MenuTrigger>
			<MenuOptions
				customStyles={{
					optionsContainer: {
						backgroundColor:
							colorScheme === 'dark'
								? customColor['patchwork-dark-400']
								: 'white',
						borderRadius: 10,
						shadowOpacity: 0.1,
						elevation: 2,
						width: 'auto',
					},
				}}
			>
				<>
					<MenuOption
						onSelect={() => {
							toggleMenu();
							onBoost();
						}}
						style={{ paddingRight: 15 }}
					>
						<View className="flex flex-row items-center gap-2 px-3 py-2">
							<StatusRepostIcon
								fill={
									(status?.reblogged || status.reblog?.reblogged) &&
									colorScheme == 'dark'
										? customColor['patchwork-soft-primary']
										: (status?.reblogged || status.reblog?.reblogged) &&
										  colorScheme == 'light'
										? customColor['patchwork-primary']
										: colorScheme == 'dark'
										? customColor['patchwork-grey-400']
										: customColor['patchwork-grey-100']
								}
							/>

							<ThemeText
								className={`${
									status?.reblogged || status.reblog?.reblogged
										? 'text-patchwork-primary dark:text-patchwork-soft-primary'
										: ''
								}`}
							>
								{status?.reblogged || status.reblog?.reblogged
									? t('timeline.unboost')
									: t('timeline.boost')}
							</ThemeText>
						</View>
					</MenuOption>

					<Underline />

					<MenuOption
						onSelect={() => {
							toggleMenu();
							setQuotedStatus(status);
							navigation.navigate('QuotePost', {
								statusId: status.id,
							});
						}}
						disabled={status?.quote_approval?.current_user !== 'automatic'}
						style={{ paddingRight: 15 }}
					>
						<View
							className={cn(
								'flex flex-row items-center gap-2 px-3 py-2',
								status?.quote_approval?.current_user !== 'automatic' &&
									'opacity-50',
							)}
						>
							<FontAwesomeIcon
								icon={AppIcons.quote}
								size={16}
								color={
									colorScheme === 'dark'
										? '#fff'
										: customColor['patchwork-grey-100']
								}
							/>

							<ThemeText>{t('timeline.quote')}</ThemeText>
						</View>
					</MenuOption>
				</>
			</MenuOptions>
		</Menu>
	);
};

export default StatusReblogButton;
