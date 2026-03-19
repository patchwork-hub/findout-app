import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text } from 'react-native';
import { cn } from '@/util/helper/twutil';
import FastImage from '@d11/react-native-fast-image';
import { useAppearanceStore } from '@/store/feed/textAppearanceStore';
import { useTranslation } from 'react-i18next';

const baseVariants = {
	variant: {
		default: /* tw */ 'text-black dark:text-white font-Inter_Regular',
		textGrey: /* tw */ 'text-slate-600 dark:text-patchwork-grey-400',
		textRedUnderline: /* tw */ 'text-patchwork-red-600 underline',
		textOrange: 'text-patchwork-red-50',
		textBold: 'text-black dark:text-white font-NewsCycle_Bold',
		textOrangeUnderline: 'text-patchwork-red-50 underline',
		textPrimary: 'text-patchwork-primary dark:text-patchwork-primary-dark',
		textSecondary: 'text-patchwork-primary dark:text-patchwork-primary-dark',
		textItalic: 'font-Inter_Italic italic',
	},
};

const textVariants = cva(
	'font-Inter_Regular text-sm group flex items-center justify-center rounded-md',
	{
		variants: {
			...baseVariants,
			size: {
				default: /* tw */ 'text-sm',
				xs_12: /* tw */ 'text-xs',
				fs_13: /* tw */ 'text-[13px] leading-[18.5px]',
				sm_14: /* tw */ 'text-[15px] leading-[22.5px]',
				fs_15: /* tw */ 'text-[17px] leading-[24px]',
				md_16: /* tw */ 'text-base',
				lg_18: /* tw */ 'text-lg',
				xl_20: /* tw */ 'text-xl',
				xl_24: /* tw */ 'text-2xl',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const burmeseTextVariants = cva(
	'font-Inter_Regular text-[14px] group flex items-center justify-center rounded-md',
	{
		variants: {
			...baseVariants,
			size: {
				default: 'text-[14px]',
				xs_12: 'text-[12px]',
				fs_13: 'text-[13px]',
				sm_14: 'text-[15px]',
				fs_15: 'text-[17px]',
				md_16: 'text-base',
				lg_18: 'text-lg',
				xl_20: 'text-xl',
				xl_24: 'text-2xl',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

type TextProps = React.ComponentPropsWithoutRef<typeof Text> &
	VariantProps<typeof textVariants> & {
		emojis?: Patchwork.Emoji[];
	};

const sizeSteps: Array<NonNullable<VariantProps<typeof textVariants>['size']>> =
	['xs_12', 'fs_13', 'sm_14', 'fs_15', 'md_16', 'lg_18', 'xl_20', 'xl_24'];

const getAdjustedSize = (
	baseSize: TextProps['size'],
	fontScale: 'small' | 'medium' | 'large',
): TextProps['size'] => {
	if (fontScale === 'medium') {
		return baseSize;
	}

	const currentSize = baseSize === 'default' ? 'sm_14' : baseSize;
	const currentIndex = sizeSteps.indexOf(currentSize ?? 'sm_14');

	if (currentIndex === -1) {
		return baseSize;
	}

	const newIndex =
		fontScale === 'small'
			? Math.max(0, currentIndex - 1)
			: Math.min(sizeSteps.length - 1, currentIndex + 1);
	return sizeSteps[newIndex];
};

const ThemeText = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
	({ className, variant, size, children, emojis = [], ...props }, ref) => {
		const fontScale = useAppearanceStore(state => state.fontScale);
		const adjustedSize = getAdjustedSize(size, fontScale);
		const { i18n } = useTranslation();

		const isMyanmar = React.useCallback(
			(text: string) => i18n.language === 'my' && /[\u1000-\u109F]/.test(text),
			[i18n.language],
		);

		const renderContent = (content: React.ReactNode): React.ReactNode => {
			if (typeof content !== 'string') return content;

			return content.split(/(:\w+:)/g).map((part, index) => {
				const emoji = emojis.find(e => `:${e.shortcode}:` === part);
				if (emoji)
					return (
						<FastImage
							key={index}
							source={{ uri: emoji.url }}
							style={{ width: 16, height: 16 }}
						/>
					);

				const isBurmese = isMyanmar(part);
				const burmeseStyle = isBurmese
					? [{ lineHeight: { small: 28, medium: 33, large: 32 }[fontScale] }]
					: undefined;

				return (
					<Text key={index} style={burmeseStyle}>
						{part}
					</Text>
				);
			});
		};

		const hasBurmese = isMyanmar(String(children));

		return (
			<Text
				className={cn(
					props.disabled && 'opacity-50',
					hasBurmese
						? burmeseTextVariants({ variant, size: adjustedSize, className })
						: textVariants({ variant, size: adjustedSize, className }),
				)}
				ref={ref}
				suppressHighlighting
				{...props}
			>
				{React.Children.map(children, child => renderContent(child))}
			</Text>
		);
	},
);

ThemeText.displayName = 'ThemeText';

export { ThemeText, textVariants };
export type { TextProps };
