import {
	Dimensions,
	Modal,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { ThemeText } from '../ThemeText/ThemeText';
import Underline from '../Underline/Underline';
import { ClassValue } from 'clsx';
import { cn } from '@/util/helper/twutil';
import customColor from '@/util/constant/color';
import { Flow } from 'react-native-animated-spinkit';
import { isTablet } from '@/util/helper/isTablet';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export type MenuProp = {
	title?: string;
	message: string;
	handleOk: () => void;
	handleCancel?: () => void;
	hasCancel?: boolean;
	confirmBtnText?: string;
	cancelBtnText?: string;
	extraTitleStyle?: ClassValue;
	extraOkBtnStyle?: ClassValue;
	extraCancelBtnStyle?: ClassValue;
	isVisible: boolean;
	type: 'error' | 'success' | 'info';
	onPressBackdrop?: () => void;
	isPendingConfirm?: boolean;
	alertType?: 'link-extended' | 'default';
	linkText?: string;
	onLinkPress?: () => void;
};

const CustomAlert = ({
	title,
	message,
	cancelBtnText,
	handleOk,
	hasCancel,
	handleCancel,
	confirmBtnText,
	extraTitleStyle,
	extraOkBtnStyle,
	extraCancelBtnStyle,
	isVisible,
	type,
	onPressBackdrop,
	isPendingConfirm,
	alertType = 'default',
	linkText,
	onLinkPress,
}: MenuProp) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { top, bottom } = useSafeAreaInsets();
	return (
		<Modal
			onRequestClose={onPressBackdrop || handleCancel}
			transparent
			visible={isVisible}
			animationType="fade"
			statusBarTranslucent
			navigationBarTranslucent
		>
			<View style={[styles.centeredView, { paddingBottom: bottom }]}>
				<TouchableOpacity
					style={styles.backdrop}
					onPress={onPressBackdrop || handleCancel}
					activeOpacity={1}
					accessible={false}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				/>
				<View
					style={[
						styles.modalContainer,
						{
							backgroundColor:
								colorScheme === 'dark'
									? customColor['patchwork-dark-100']
									: customColor['patchwork-light-900'],
						},
					]}
				>
					<View className={cn('px-8 py-5 min-w-[250]')}>
						{title && (
							<ThemeText
								variant={type === 'error' ? 'textOrange' : 'default'}
								size={'lg_18'}
								className={cn(
									'font-NewsCycle_Bold mb-3 text-center',
									extraTitleStyle,
									colorScheme === 'dark' ? 'text-white' : 'text-black',
								)}
							>
								{title}
							</ThemeText>
						)}
						<ThemeText className="text-center" size={'md_16'}>
							{message}
							{alertType === 'link-extended' && linkText && (
								<ThemeText
									className="text-blue-500"
									onPress={onLinkPress}
									size={'md_16'}
								>
									{' ' + linkText}
								</ThemeText>
							)}
						</ThemeText>
					</View>
					<Underline />
					<View className="flex-row items-center justify-around my-1 h-12 p-0">
						{hasCancel && (
							<>
								<Pressable
									className="w-1/2 h-14 active:bg-slate-100 dark:active:bg-[#101016] justify-center items-center rounded-bl-2xl"
									onPress={handleCancel}
								>
									<ThemeText
										className={cn('text-center', extraCancelBtnStyle)}
										size={'sm_14'}
									>
										{cancelBtnText || t('common.cancel')}
									</ThemeText>
								</Pressable>
								<View className="w-[1px] h-14 bg-slate-200 dark:bg-patchwork-grey-70" />
							</>
						)}

						{isPendingConfirm ? (
							<View className="w-1/2 items-center">
								<Flow size={30} color={customColor['patchwork-primary']} />
							</View>
						) : (
							<Pressable
								className={cn(
									'h-14 active:bg-slate-100 dark:active:bg-[#101016] justify-center items-center rounded-br-2xl',
									hasCancel ? 'w-1/2 ' : 'w-full',
								)}
								onPress={handleOk}
								hitSlop={{ top: 3, bottom: 3, left: 0, right: 0 }}
							>
								<ThemeText
									className={cn('text-center', extraOkBtnStyle)}
									size={'sm_14'}
									variant={'textPrimary'}
								>
									{confirmBtnText || t('common.ok')}
								</ThemeText>
							</Pressable>
						)}
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	backdrop: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	modalContainer: {
		width: screenWidth * (isTablet ? 0.5 : 0.8),
		maxWidth: screenWidth * (isTablet ? 0.5 : 0.8),
		borderRadius: 12,
		shadowColor: customColor['patchwork-dark-900'],
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
	},
});

export default CustomAlert;
