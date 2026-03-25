import { HorizontalPeopleCardSkeleton } from '@/components/atoms/common/SkeletonLoader/SkeletonLoader';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import WpSectionHeader from '@/components/molecules/home/WpSectionHeader/WpSectionHeader';
import { useGetPeoplePreview } from '@/hooks/queries/people.queries';
import { HomeStackParamList } from '@/types/navigation';
import customColor from '@/util/constant/color';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';

const CiviPeopleSection = () => {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === 'dark';
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { data: people, isLoading } = useGetPeoplePreview({ limit: 10 });

	if (!isLoading && (!people || people.length === 0)) return null;

	return (
		<View className="mb-2">
			<View className="px-4">
				<WpSectionHeader
					title="People"
					onViewAll={() => navigation.navigate('CiviPeopleList')}
				/>
			</View>
			<ScrollView
				horizontal
				scrollEnabled
				nestedScrollEnabled
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingLeft: 16 }}
			>
				{isLoading
					? Array.from({ length: 3 }).map((_, i) => (
							<HorizontalPeopleCardSkeleton key={i} />
					  ))
					: people!.map(person => {
							return (
								<Pressable
									key={person.id}
									onPress={() =>
										navigation.navigate('CiviPeopleDetail', { person })
									}
									className="rounded-xl mr-3 mb-3 overflow-hidden"
									style={{
										width: 180,
										backgroundColor: isDark
											? customColor['patchwork-dark-400']
											: customColor['patchwork-light-900'],
										borderWidth: 1,
										borderColor: isDark ? '#22343B' : '#E4E8EE',
									}}
								>
									{person.avatarUrl ? (
										<Image
											source={{ uri: person.avatarUrl }}
											style={{ width: 180, height: 160 }}
											resizeMode="cover"
										/>
									) : (
										<View
											style={[
												styles.faviconCon,
												{
													width: 180,
													height: 160,
													backgroundColor: isDark
														? '#2A4D52'
														: customColor['csid-primary'],
												},
											]}
										>
											<View
												style={[
													styles.faviconImg,
													{
														width: 55,
														height: 55,
														borderRadius: 16,
													},
												]}
											>
												<ThemeText
													className="font-Oswald_Bold text-white"
													size="xl_24"
												>
													{person.displayName.charAt(0).toUpperCase()}
												</ThemeText>
											</View>
										</View>
									)}
									<View className="p-3 pb-5">
										<ThemeText
											className="font-OpenSans_SemiBold"
											size="fs_13"
											numberOfLines={1}
										>
											{person.displayName}
										</ThemeText>
										{person.subtitle ? (
											<ThemeText
												variant="textGrey"
												size="fs_13"
												numberOfLines={1}
												className="mt-0.5"
											>
												{person.subtitle}
											</ThemeText>
										) : null}
									</View>
								</Pressable>
							);
					  })}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	faviconCon: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	faviconImg: {
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.4)',
		borderStyle: 'dashed',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default CiviPeopleSection;
