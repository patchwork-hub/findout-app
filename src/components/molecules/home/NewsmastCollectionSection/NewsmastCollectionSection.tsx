import { Pressable, View } from 'react-native';
import { ChevronRightIcon } from '@/util/svg/icon.common';
import { ScrollView } from 'react-native-gesture-handler';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import { useNewsmastCollectionList } from '@/hooks/queries/channel.queries';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList, SearchStackParamList } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

type Props = {
	data?: Patchwork.CollectionList[];
	isFromHomeFeed?: boolean;
};

export const NewsmastCollectionSection = ({ data, isFromHomeFeed }: Props) => {
	const { t } = useTranslation();
	const navigation =
		useNavigation<
			StackNavigationProp<
				typeof isFromHomeFeed extends true
					? HomeStackParamList
					: SearchStackParamList
			>
		>();
	const { data: fetchedData } = useNewsmastCollectionList({
		options: { enabled: !data },
	});

	const onPressItem = (item: Patchwork.CollectionList) => {
		navigation.navigate('NewsmastCollectionDetail', {
			slug: item.attributes?.slug,
			title: item.attributes?.name,
			type: 'newsmast',
		});
	};

	const onPressViewAll = () => navigation.navigate('NewsmastCollections');

	const newsmastCollectionList = data || fetchedData;

	return (
		<View>
			<View className="flex-row items-center px-4">
				<ThemeText className="font-NewsCycle_Bold my-2 flex-1" size="lg_18">
					Global Channels
				</ThemeText>
				<Pressable onPress={onPressViewAll} className="active:opacity-80">
					<ThemeText variant="textGrey">{t('common.view_all')}</ThemeText>
				</Pressable>
			</View>
			<ScrollView
				horizontal
				scrollEnabled
				nestedScrollEnabled
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					paddingLeft: 16,
				}}
			>
				{newsmastCollectionList?.slice(0, 10).map(item => (
					<Pressable
						key={item.id.toString()}
						className="rounded-md mr-3 items-center mb-3 w-32 h-32"
						onPress={() => onPressItem && onPressItem(item)}
					>
						<Image
							uri={item.attributes.avatar_image_url}
							className="bg-patchwork-dark-50 w-32 h-32 rounded-md"
							fallbackType="newsmast"
						/>
						<View className="absolute w-32 h-32 rounded-md bg-black opacity-30 bottom-0"></View>
						<View className="absolute bottom-0 mx-2 mb-2 flex-row items-center">
							<ThemeText
								className="flex-1 font-Inter_Regular text-white"
								size={'fs_13'}
							>
								{item.attributes.name} {`(${item.attributes?.community_count})`}
							</ThemeText>
							<ChevronRightIcon className="ml-1" fill={'#fff'} />
						</View>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
};
