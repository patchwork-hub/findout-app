import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Pressable, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { cn } from '@/util/helper/twutil';
import { ChevronRightIcon } from '@/util/svg/icon.common';
import customColor from '@/util/constant/color';
import colors from 'tailwindcss/colors';

interface SettingSectionProps {
	title: string;
	icon: IconProp;
	colorScheme: 'light' | 'dark';
	iconSize?: number;
	mt?: string;
	sectionKey: string;
	onPress: () => void;
}

export const SettingSection: React.FC<SettingSectionProps> = ({
	title,
	icon,
	colorScheme,
	iconSize = 20,
	mt = 'mt-4',
	onPress,
}) => {
	const iconColor =
		colorScheme === 'dark'
			? customColor['patchwork-light-50']
			: customColor['patchwork-dark-50'];

	return (
		<Pressable
			onPress={onPress}
			android_ripple={{ color: '#00000010' }}
			className="active:opacity-80"
		>
			<View
				className={cn(
					'flex-row justify-between items-center pb-4 px-3 my-1 rounded-lg',
					mt,
				)}
			>
				<View className={cn('flex-row items-center flex-1')}>
					<View className="ml-1 mr-3">
						<FontAwesomeIcon icon={icon} size={iconSize} color={iconColor} />
					</View>
					<ThemeText size={'sm_14'}>{title}</ThemeText>
				</View>
				<ChevronRightIcon width={12} height={12} colorScheme={colorScheme} />
			</View>
		</Pressable>
	);
};
