import React from 'react';
import {
	Modal,
	View,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Pressable,
	DimensionValue,
	StyleProp,
	ViewStyle,
	Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeText } from '../ThemeText/ThemeText';
import customColor from '@/util/constant/color';
import { CloseIcon } from '@/util/svg/icon.common';
import BackButton from '../BackButton/BackButton';
import { cn } from '@/util/helper/twutil';
import { Flow } from 'react-native-animated-spinkit';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { useTranslation } from 'react-i18next';

type ModalPosition = 'bottom' | 'normal';
type ModalType = 'default' | 'simple' | 'alternative' | 'custom';

interface ConfirmProps {
	text?: string;
	onPress?: () => void;
	isPending?: boolean;
}

interface ThemeModalProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	hasNotch?: boolean;
	position?: ModalPosition;
	type: ModalType;
	showBackButton?: boolean;
	onPressBackButton?: () => void;
	children?: React.ReactNode;
	modalHeight?: DimensionValue;
	customModalContainterStyle?: StyleProp<ViewStyle>;
	confirm?: ConfirmProps;
}

const ThemeModal: React.FC<ThemeModalProps> = ({
	visible,
	onClose,
	title,
	hasNotch = false,
	position = 'normal',
	type,
	showBackButton = false,
	onPressBackButton,
	children,
	modalHeight,
	customModalContainterStyle,
	confirm,
}) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const { height: screenHeight } = Dimensions.get('window');
	const { top, bottom } = useSafeAreaInsets();

	const modalStyle =
		position === 'bottom'
			? { height: modalHeight }
			: {
					height:
						Platform.OS === 'ios'
							? screenHeight - top
							: screenHeight - top - 80,
			  };

	return (
		<Modal
			onRequestClose={showBackButton ? onPressBackButton : onClose}
			transparent
			visible={visible}
			animationType="fade"
			statusBarTranslucent
			navigationBarTranslucent
		>
			<TouchableOpacity
				style={styles.backdrop}
				onPress={onClose}
				activeOpacity={1}
			/>
			<View
				style={[
					styles.modalContainer,
					{
						backgroundColor:
							colorScheme === 'dark'
								? customColor['patchwork-dark-100']
								: customColor['patchwork-light-900'],
						paddingBottom: bottom,
					},
					type === 'custom' ? customModalContainterStyle : modalStyle,
				]}
			>
				{hasNotch && (
					<View
						className={cn(
							'self-center w-16 h-1 rounded-lg my-2',
							colorScheme === 'dark'
								? 'bg-patchwork-dark-50'
								: 'bg-patchwork-light-50',
						)}
					/>
				)}

				{type === 'default' && (
					<View
						className={cn(
							`flex-row justify-between items-center -mx-3 px-5 mb-3 pb-2 border-b border-slate-200 dark:border-patchwork-dark-50`,
						)}
					>
						<TouchableOpacity onPress={onClose} className="active:opacity-70">
							<ThemeText>{t('common.cancel')}</ThemeText>
						</TouchableOpacity>
						{title && (
							<ThemeText
								variant={'textBold'}
								size={'lg_18'}
								className="text-center"
							>
								{title}
							</ThemeText>
						)}
						{confirm?.isPending ? (
							<View className="py-[19.5] w-[59.5] items-center">
								<Flow
									size={20}
									color={
										colorScheme === 'dark'
											? customColor['patchwork-primary-dark']
											: customColor['patchwork-primary']
									}
								/>
							</View>
						) : (
							<Pressable
								onPress={confirm?.onPress}
								className="active:opacity-70 p-3 pr-1"
							>
								<ThemeText variant={'textPrimary'}>{confirm?.text}</ThemeText>
							</Pressable>
						)}
					</View>
				)}
				{type === 'alternative' && (
					<View
						className={cn(
							`flex-row justify-between items-center -mx-3 px-5 mb-3 -mt-3`,
						)}
					>
						<Pressable onPress={onClose} className="active:opacity-70">
							<ThemeText>{t('common.cancel')}</ThemeText>
						</Pressable>
						<Pressable onPress={confirm?.onPress} className="active:opacity-70">
							{confirm?.isPending ? (
								<Flow
									size={20}
									color={
										colorScheme === 'dark'
											? customColor['patchwork-primary-dark']
											: customColor['patchwork-primary']
									}
								/>
							) : (
								<ThemeText variant="textBold">{confirm?.text}</ThemeText>
							)}
						</Pressable>
					</View>
				)}
				{type === 'simple' && (
					<View
						className={cn(
							`flex-row justify-between items-center -mx-3 px-3`,
							title
								? 'border-b border-slate-200 dark:border-patchwork-dark-50'
								: '-mb-3',
						)}
					>
						<View className="w-12 h-12">
							{showBackButton && (
								<BackButton
									extraClass="border-0"
									customOnPress={onPressBackButton}
								/>
							)}
						</View>
						{title && (
							<ThemeText
								variant={'textBold'}
								size={'md_16'}
								className="mx-auto"
							>
								{title}
							</ThemeText>
						)}
						<Pressable
							className={cn(
								'h-10 w-10 items-center justify-center rounded-full',
								!title ? '-my-3' : '',
							)}
							onPress={onClose}
						>
							<CloseIcon stroke={colorScheme === 'dark' ? '#fff' : '#000'} />
						</Pressable>
					</View>
				)}
				<View className="flex-1 px-2 my-2">{children}</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.7)',
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	modalContainer: {
		position: 'absolute',
		width: '100%',
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		padding: 10,
		bottom: 0,
	},
});

export default ThemeModal;
