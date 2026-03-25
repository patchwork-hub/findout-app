import React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Button, type ButtonProps } from '@/components/atoms/common/Button/Button';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

type EventActionButtonProps = Omit<
	ButtonProps,
	'style' | 'children' | 'variant'
> & {
	label: string;
	variant?: 'primary' | 'outline';
	textColor?: string;
	borderColor?: string;
	containerStyle?: StyleProp<ViewStyle>;
	labelStyle?: StyleProp<TextStyle>;
};

const EventActionButton = ({
	label,
	variant = 'primary',
	disabled = false,
	textColor,
	borderColor,
	containerStyle,
	labelStyle,
	...buttonProps
}: EventActionButtonProps) => {
	const isOutline = variant === 'outline';

	return (
		<Button
			disabled={disabled}
			variant={isOutline ? 'outline' : 'default'}
			className={isOutline ? 'border' : undefined}
			style={[
				styles.base,
				isOutline ? styles.outline : styles.primary,
				isOutline && borderColor ? { borderColor } : null,
				containerStyle,
			]}
			{...buttonProps}
		>
			<ThemeText
				className="font-OpenSans_Bold text-center"
				size="fs_13"
				style={[
					styles.label,
					{ color: textColor ?? (isOutline ? '#033E45' : '#FFFFFF') },
					labelStyle,
				]}
			>
				{label}
			</ThemeText>
		</Button>
	);
};

const styles = {
	base: {
		minHeight: 44,
		borderRadius: 6,
		paddingHorizontal: 12,
	} satisfies ViewStyle,
	primary: {
		backgroundColor: '#EF8F84',
	} satisfies ViewStyle,
	outline: {
		backgroundColor: 'transparent',
		borderWidth: 1,
	} satisfies ViewStyle,
	label: {
		textAlign: 'center',
	} satisfies TextStyle,
};

export default EventActionButton;
