import { Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { SwitchOffIcon, SwitchOnIcon } from '@/util/svg/icon.common';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/util/helper/twutil';

interface SettingToggleItemProps {
	text: string;
	isEnabled?: boolean;
	onToggle: (value: boolean) => void;
	isLoading?: boolean;
	icon?: IconProp;
	customStyle?: string;
}

export const SettingToggleItem: React.FC<SettingToggleItemProps> = ({
	text,
	isEnabled,
	onToggle,
	isLoading = false,
	icon,
	customStyle,
}) => {
	const { colorScheme } = useColorScheme();
	const iconColor =
		colorScheme === 'dark'
			? customColor['patchwork-light-50']
			: customColor['patchwork-dark-50'];

	const handleToggle = () => {
		if (isEnabled !== undefined && !isLoading) {
			onToggle(!isEnabled);
		}
	};

	return (
		<View
			className={cn(
				'pb-4 px-3 my-1 h-[50] flex-row items-center justify-between',
				customStyle,
			)}
		>
			<Pressable
				onPress={handleToggle}
				className="flex-1 flex-row items-center"
			>
				{icon && (
					<View className="w-8 items-center mr-1.5">
						<FontAwesomeIcon icon={icon} size={20} color={iconColor} />
					</View>
				)}
				<ThemeText className="mr-5">{text}</ThemeText>
			</Pressable>
			{isLoading || isEnabled === undefined ? (
				<Flow
					size={25}
					color={
						colorScheme == 'dark'
							? customColor['patchwork-primary-dark']
							: customColor['patchwork-primary']
					}
				/>
			) : isEnabled ? (
				<SwitchOnIcon width={42} onPress={() => onToggle(false)} />
			) : (
				<SwitchOffIcon width={42} onPress={() => onToggle(true)} />
			)}
		</View>
	);
};
