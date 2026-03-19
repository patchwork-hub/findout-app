import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import colors from 'tailwindcss/colors';
import { layoutAnimation } from '@/util/helper/timeline';
import customColor from '@/util/constant/color';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HandleInfoBottomSheetProps = {
	username: string;
	domain: string;
	joinedDate?: string;
};

const getIconColor = (colorScheme: 'dark' | 'light') =>
	colorScheme === 'dark'
		? customColor['patchwork-soft-primary']
		: customColor['patchwork-primary'];

const HandleInfoBottomSheet = React.forwardRef<
	BottomSheetModal,
	HandleInfoBottomSheetProps
>(({ username, domain, joinedDate }, ref) => {
	const { colorScheme } = useColorScheme();
	const { bottom } = useSafeAreaInsets();
	const [showActivityPub, setShowActivityPub] = useState(false);
	const [copied, setCopied] = useState(false);
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const iconColor = getIconColor(colorScheme);
	const snapPoints = useMemo(() => ['70%'], []);

	const fullHandle = useMemo(() => {
		const acct = username?.includes('@')
			? username
			: `${username}@${domain?.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
		return acct.startsWith('@') ? acct : `@${acct}`;
	}, [username, domain]);

	const copyHandle = useCallback(() => {
		Clipboard.setString(fullHandle);
		setCopied(true);
		if (copiedTimerRef.current) {
			clearTimeout(copiedTimerRef.current);
		}
		copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
	}, [fullHandle]);

	const toggleActivityPub = useCallback(() => {
		layoutAnimation();
		setShowActivityPub(prev => !prev);
	}, []);

	const renderBackdrop = useCallback(
		(props: any) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={-1}
				appearsOnIndex={0}
				opacity={0.5}
			/>
		),
		[],
	);

	return (
		<BottomSheetModal
			ref={ref}
			snapPoints={snapPoints}
			enableDynamicSizing
			handleIndicatorStyle={{ backgroundColor: colors.zinc[400] }}
			backgroundStyle={{
				backgroundColor: colorScheme === 'dark' ? '#18181b' : '#FFFFFF',
			}}
			backdropComponent={renderBackdrop}
		>
			<BottomSheetScrollView
				style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingTop: 8,
					paddingBottom: (bottom || 20) + 32,
				}}
			>
				{/* Header */}
				<View className="flex-row items-start mb-6">
					<View className="w-10 h-10 rounded-full bg-patchwork-primary items-center justify-center mr-3">
						<FontAwesomeIcon icon={AppIcons.users} color="#fff" size={18} />
					</View>
					<ThemeText size="md_16" className="mt-2">
						What's in a handle?
					</ThemeText>
				</View>

				<View className="bg-zinc-300 dark:bg-zinc-800 rounded-lg p-4 mb-6">
					<ThemeText size="xs_12" className="text-zinc-400 mb-1">
						Account handle:
					</ThemeText>
					<View className="flex-row items-center justify-between">
						<ThemeText
							size="fs_13"
							className="font-semibold text-patchwork-primary dark:text-patchwork-soft-primary flex-shrink"
						>
							{fullHandle}
						</ThemeText>
						<TouchableOpacity
							onPress={copyHandle}
							hitSlop={8}
							activeOpacity={0.6}
						>
							<FontAwesomeIcon
								icon={copied ? AppIcons.check : AppIcons.copy}
								color={copied ? colors.green[500] : colors.zinc[400]}
								size={16}
							/>
						</TouchableOpacity>
					</View>
				</View>
				<View>
					<InfoRow
						icon={
							<FontAwesomeIcon
								icon={AppIcons.mention}
								color={iconColor}
								size={14}
							/>
						}
						title="Username"
						description="Their unique identifier on their server. It's possible to find users with the same username on different servers."
					/>
					<InfoRow
						icon={
							<FontAwesomeIcon
								icon={AppIcons.globe}
								color={iconColor}
								size={14}
							/>
						}
						title="Server"
						description="Their digital home, where all of their posts live."
					/>
					{joinedDate ? (
						<InfoRow
							icon={
								<FontAwesomeIcon
									icon={AppIcons.schedule}
									color={iconColor}
									size={14}
								/>
							}
							title="Joined"
							description={joinedDate}
						/>
					) : null}
				</View>

				{/* Footer */}
				<View className="mb-4">
					<ThemeText size="xs_12" variant="textGrey">
						Since handles say who someone is and where they are, you can
						interact with people across the social web of{' '}
					</ThemeText>
					<TouchableOpacity
						onPress={toggleActivityPub}
						hitSlop={4}
						activeOpacity={0.5}
					>
						<ThemeText
							size="xs_12"
							className="text-patchwork-primary dark:text-patchwork-soft-primary"
						>
							ActivityPub-powered platforms
						</ThemeText>
					</TouchableOpacity>
				</View>

				{/* ActivityPub expandable */}
				{showActivityPub && (
					<View className="gap-4">
						<ThemeText size="xs_12" variant="textGrey">
							ActivityPub is like the language Mastodon speaks with other social
							networks.
						</ThemeText>
						<ThemeText size="xs_12" variant="textGrey">
							It lets you connect and interact with people not just on Mastodon,
							but across different social apps too.
						</ThemeText>
					</View>
				)}

				{/* Bottom spacing */}
				<View className="h-8" />
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

export default HandleInfoBottomSheet;

type InfoRowProps = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

const InfoRow = ({ icon, title, description }: InfoRowProps) => (
	<View className="flex-row items-start">
		<View className="w-10 h-10 rounded-full items-center justify-center mt-0.5">
			{icon}
		</View>
		<View className="flex-1 mb-5">
			<ThemeText size="fs_13" className="mb-0.5">
				{title}
			</ThemeText>
			<ThemeText size="xs_12" variant="textGrey">
				{description}
			</ThemeText>
		</View>
	</View>
);
