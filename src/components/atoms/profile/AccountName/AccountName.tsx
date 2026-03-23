import { Pressable, View, ViewProps } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { ProfileNameRedMark } from '@/util/svg/icon.profile';
import { useColorScheme } from 'nativewind';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBluesky, faThreads } from '@fortawesome/free-brands-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import UserRole from '../UserRole/UserRole';
import { useTranslation } from 'react-i18next';

type AccountNameProps = {
	accountName: string;
	acctNameTextStyle?: string;
	hasRedMark?: boolean;
	emojis?: Patchwork.Emoji[];
	userRoles?: Patchwork.Role[] | undefined;
	locked?: boolean;
	onPress?: () => void;
};

const AccountName = ({
	accountName,
	username,
	acctNameTextStyle,
	hasRedMark,
	emojis,
	userRoles,
	locked,
	onPress,
	...props
}: AccountNameProps & { username?: string } & ViewProps) => {
	const { t } = useTranslation();
	const { colorScheme } = useColorScheme();
	const isBluesky = username?.endsWith('bsky.brid.gy');
	const isThreads =
		username?.endsWith('@threads.net') || username?.endsWith('@threads.social');
	const textColor = colorScheme === 'dark' ? '#fff' : '#000';
	const borderColor = colorScheme === 'dark' ? '#fff' : '#000';
	return (
		<Pressable
			className="flex-row items-center flex-wrap"
			onPress={onPress}
			{...props}
		>
			{(isBluesky || isThreads) && (
				<View className="mr-2 justify-center">
					<FontAwesomeIcon
						icon={isBluesky ? faBluesky : faThreads}
						color={
							isBluesky
								? '#0F73FF'
								: colorScheme === 'dark'
								? '#FFFFFF'
								: '#000000'
						}
						size={13}
					/>
				</View>
			)}
			<ThemeText
				emojis={emojis}
				className={`font-Oswald_Bold text-[17px] leading-6 ${acctNameTextStyle}`}
			>
				{accountName}
			</ThemeText>

			<View className="flex-row items-center">
				{locked && (
					<View
						className="border-[0.5px] px-1.5 rounded-md mx-1 flex-row items-center"
						style={{ borderColor: borderColor }}
					>
						<View className="mr-1.5">
							<FontAwesomeIcon
								icon={faLock}
								color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
								size={11}
							/>
						</View>
						<ThemeText
							style={{ color: textColor }}
							className="font-bold text-[11px] leading-4"
						>
							{t('timeline.follower_plural', 'Followers')}
						</ThemeText>
					</View>
				)}
				{hasRedMark && (
					<View style={{ marginStart: 2 }}>
						<ProfileNameRedMark colorScheme={colorScheme} />
					</View>
				)}
				<UserRole userRoles={userRoles} />
			</View>
		</Pressable>
	);
};

export default AccountName;
