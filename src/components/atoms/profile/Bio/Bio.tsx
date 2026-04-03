import React, { useCallback, useMemo, useState } from 'react';
import {
	useWindowDimensions,
	Pressable,
	View,
	LayoutChangeEvent,
	GestureResponderEvent,
} from 'react-native';
import RenderHTML, {
	RenderHTMLProps,
	defaultSystemFonts,
	MixedStyleDeclaration,
} from 'react-native-render-html';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '@/types/navigation';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { useAuthStore } from '@/store/auth/authStore';
import { useTranslation } from 'react-i18next';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import LoadingModal from '@/components/atoms/common/LoadingModal/LoadingModal';
import { useColorScheme } from 'nativewind';
import customColor from '@/util/constant/color';
import { layoutAnimation } from '@/util/helper/timeline';
import instance from '@/services/instance';
import { appendApiVersion } from '@/util/helper/helper';

type BioProps = {
	userBio: string;
	userBioTextStyle?: string;
	emojis?: Patchwork.Emoji[];
	customMaxWordCount?: number;
	numberOfLines?: number;
};

const MAX_COLLAPSED_HEIGHT = 90;

const Bio = ({ userBio, numberOfLines }: BioProps) => {
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const [isExpanded, setIsExpanded] = useState(false);
	const [contentHeight, setContentHeight] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(false);
	const { colorScheme } = useColorScheme();
	const activeDomain = useSelectedDomain();
	const userInfo = useAuthStore(state => state.userInfo);
	const isDarkMode = colorScheme === 'dark';
	const baseTextColor = isDarkMode ? '#fff' : '#000';

	// If numberOfLines is large (e.g. 999), we consider it fully expanded by default or effectively disable collapsing
	const disableCollapse = numberOfLines && numberOfLines > 10;

	const shouldShowToggle =
		!disableCollapse && contentHeight > MAX_COLLAPSED_HEIGHT;
	const primaryColor = isDarkMode
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

	const handleLinkPress = useCallback(
		async (
			event: GestureResponderEvent,
			href: string,
			htmlAttribs: Record<string, string>,
		) => {
			const classes = htmlAttribs.class || '';

			if (classes.includes('hashtag') || href.includes('/tags/')) {
				const tagMatch =
					href.match(/\/tags\/([^/?#]+)/) || href.match(/#([^/?#]+)/);
				const hashtag = tagMatch ? tagMatch[1] : '';
				if (hashtag) {
					navigation.push('HashTagDetail', {
						hashtag,
						hashtagDomain: activeDomain,
					});
					return;
				}
			}

			const isMention =
				classes.includes('mention') ||
				(classes.includes('u-url') && href.includes('/@'));

			if (isMention) {
				let acct = '';
				try {
					const match = href.match(/:\/\/([^\/]+)\/@([^\/]+)/); // domain, user
					if (match) {
						acct = `${match[2]}@${match[1]}`;
					} else {
						const matchUsers = href.match(/:\/\/([^\/]+)\/users\/([^\/]+)/);
						if (matchUsers) {
							acct = `${matchUsers[2]}@${matchUsers[1]}`;
						}
					}
				} catch (e) {}

				if (acct) {
					try {
						setIsLoading(true);
						const searchResp = await instance.get(
							appendApiVersion(`search`, 'v2'),
							{ params: { q: acct, resolve: true, type: 'accounts' } },
						);
						setIsLoading(false);

						if (
							searchResp.data &&
							searchResp.data.accounts &&
							searchResp.data.accounts.length > 0
						) {
							const foundAccount = searchResp.data.accounts[0];
							if (userInfo && foundAccount.id === userInfo.id) {
								navigation.push('Profile', { id: userInfo.id });
							} else {
								navigation.push('ProfileOther', {
									id: foundAccount.id,
									acct,
									shouldResolveRemote: true,
								});
							}
							return;
						}
					} catch (e) {
						setIsLoading(false);
						console.log('Account search failed, falling back to WebViewer', e);
					}
				}
			}

			navigation.push('WebViewer', { url: href });
		},
		[navigation, activeDomain],
	);

	const renderersProps = useMemo<RenderHTMLProps['renderersProps']>(
		() => ({
			a: {
				onPress: handleLinkPress,
			},
		}),
		[handleLinkPress],
	);

	const tagsStyles = useMemo<Record<string, MixedStyleDeclaration>>(
		() => ({
			a: {
				textDecorationLine: 'none',
				color: primaryColor,
				fontWeight: 'bold',
			},
			p: {
				marginBottom: 0,
				marginTop: 0,
			},
		}),
		[primaryColor],
	);

	const onLayout = useCallback(
		(event: LayoutChangeEvent) => {
			const { height } = event.nativeEvent.layout;
			if (
				contentHeight === 0 ||
				(isExpanded && Math.abs(contentHeight - height) > 1)
			) {
				setContentHeight(height);
			} else if (!isExpanded && height > MAX_COLLAPSED_HEIGHT + 10) {
				setContentHeight(height);
			}
		},
		[contentHeight, isExpanded],
	);

	const toggleExpand = useCallback(() => {
		layoutAnimation();
		setIsExpanded(!isExpanded);
	}, [isExpanded]);

	return (
		<View className="mt-2">
			{isLoading && (
				<LoadingModal isVisible={isLoading} message="Loading profile..." />
			)}
			<View
				className="overflow-hidden relative"
				onLayout={onLayout}
				style={{
					maxHeight:
						shouldShowToggle && !isExpanded ? MAX_COLLAPSED_HEIGHT : undefined,
				}}
			>
				<RenderHTML
					contentWidth={width}
					source={{ html: userBio }}
					renderersProps={renderersProps}
					tagsStyles={tagsStyles}
					systemFonts={[...defaultSystemFonts, 'Inter_Regular']}
					baseStyle={{
						fontFamily: 'Inter_Regular',
						fontSize: 14,
						color: baseTextColor,
						lineHeight: 22,
					}}
				/>
			</View>

			{shouldShowToggle && (
				<Pressable
					onPress={toggleExpand}
					className="mt-1 self-start active:opacity-60"
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<ThemeText className="underline text-patchwork-primary dark:text-patchwork-soft-primary">
						{isExpanded ? t('common.see_less') : t('common.see_more')}
					</ThemeText>
				</Pressable>
			)}
		</View>
	);
};

export default Bio;
