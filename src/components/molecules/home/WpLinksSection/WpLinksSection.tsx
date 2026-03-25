import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import WpSectionHeader from '@/components/molecules/home/WpSectionHeader/WpSectionHeader';
import { HomeStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const GitHubIcon = () => (
	<Svg width={32} height={32} viewBox="0 0 24 24" fill="#033E45">
		<Path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
	</Svg>
);

const DatabaseIcon = () => (
	<Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
		<Path
			d="M12 3C7.582 3 4 4.343 4 6v12c0 1.657 3.582 3 8 3s8-1.343 8-3V6c0-1.657-3.582-3-8-3z"
			stroke="#033E45"
			strokeWidth={1.5}
		/>
		<Path
			d="M20 6c0 1.657-3.582 3-8 3S4 7.657 4 6"
			stroke="#033E45"
			strokeWidth={1.5}
		/>
		<Path
			d="M20 12c0 1.657-3.582 3-8 3s-8-1.343-8-3"
			stroke="#033E45"
			strokeWidth={1.5}
		/>
	</Svg>
);

const LINKS = [
	{
		id: 'github',
		label: 'GitHub',
		url: 'https://github.com/CSID-NET-Ethiopia',
		Icon: GitHubIcon,
	},
	{
		id: 'databases',
		label: 'Databases',
		Icon: DatabaseIcon,
		placeholderLabel: 'Coming soon',
	},
];

const WpLinksSection = () => {
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

	return (
		<View className="mb-2">
			<View className="px-4">
				<WpSectionHeader title="Links" />
				<View className="flex-row gap-x-3">
					{LINKS.map(({ id, label, url, Icon, placeholderLabel }) => (
						<Pressable
							key={id}
							className="flex-1 rounded-xl px-4 py-5"
							style={{
								backgroundColor: '#C8E45A',
								opacity: url ? 1 : 0.7,
							}}
							disabled={!url}
							onPress={() => {
								if (!url) return;
								navigation.navigate('WebViewer', {
									url,
									customTitle: label,
								});
							}}
						>
							<Icon />
							<ThemeText
								className="font-OpenSans_Bold mt-3"
								size="fs_15"
								style={{ color: '#033E45' }}
							>
								{label}
							</ThemeText>
							{placeholderLabel ? (
								<ThemeText
									className="mt-1 font-OpenSans_SemiBold uppercase tracking-wide"
									size="xs_12"
									style={{ color: '#033E45' }}
								>
									{placeholderLabel}
								</ThemeText>
							) : null}
						</Pressable>
					))}
				</View>
			</View>
		</View>
	);
};

export default WpLinksSection;
