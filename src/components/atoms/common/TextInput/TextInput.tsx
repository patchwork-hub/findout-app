import React, { forwardRef, Ref, useState } from 'react';
import { View, TextInputProps, TextInput as RNTextInput } from 'react-native';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import { cn } from '@/util/helper/twutil';
import { type ClassValue } from 'clsx';
import styles from './TextInput.style';

type InputProps = {
	startIcon?: React.ReactElement;
	endIcon?: React.ReactElement;
	extraContainerStyle?: ClassValue;
	extraInputStyle?: ClassValue;
	showUnderLine?: boolean;
	textArea?: boolean;
} & TextInputProps;

const TextInput = forwardRef<RNTextInput, InputProps>(
	(
		{
			endIcon = undefined,
			startIcon = undefined,
			placeholder,
			extraContainerStyle = '',
			extraInputStyle = '',
			showUnderLine = false,
			textArea = false,
			...textInputProps
		}: InputProps,
		ref: Ref<RNTextInput>,
	) => {
		const inputColor = useAppropiateColorHash(
			'patchwork-light-900',
			'patchwork-dark-100',
		);
		const placeholderColor = useAppropiateColorHash(
			'patchwork-light-900',
			'patchwork-grey-100',
		);

		const selectionColor = useAppropiateColorHash(
			'patchwork-soft-primary',
			'patchwork-primary',
		);
		const [isFocused, setIsFocused] = useState(false);

		return (
			<View
				className={cn(
					styles.textInputWrapper,
					startIcon ? 'pl-9' : 'pl-5',
					showUnderLine
						? 'border-b border-b-patchwork-primary dark:border-b-patchwork-soft-primary'
						: '',
					textArea ? 'h-32' : 'h-12',
					extraContainerStyle,
				)}
			>
				{startIcon && (
					<View testID="start-icon-wrapper" className={styles.startIcon}>
						{startIcon}
					</View>
				)}
				<RNTextInput
					ref={ref}
					selectionColor={selectionColor}
					testID="text-input"
					placeholderTextColor={placeholderColor}
					style={[{ color: inputColor }]}
					autoCapitalize="none"
					spellCheck
					autoCorrect={true}
					keyboardType="default"
					editable
					placeholder={placeholder}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					multiline={textArea}
					textAlignVertical={textArea ? 'top' : 'bottom'}
					{...textInputProps}
					className={cn(
						'font-Inter_Regular',
						textArea ? 'h-32 py-5' : 'h-10',
						endIcon ? 'w-10/12' : 'w-full',
						extraInputStyle,
					)}
				/>

				{endIcon && (
					<View testID="end-icon-wrapper" className={styles.endIcon}>
						{endIcon}
					</View>
				)}
			</View>
		);
	},
);

export default TextInput;
