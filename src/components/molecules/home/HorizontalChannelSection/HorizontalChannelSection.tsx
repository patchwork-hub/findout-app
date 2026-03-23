import { Pressable, View } from 'react-native';
import { ChevronRightIcon, PrimaryBadgeIcon } from '@/util/svg/icon.common';
import { ScrollView } from 'react-native-gesture-handler';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Image from '@/components/atoms/common/Image/Image';
import customColor from '@/util/constant/color';
import { useTranslation } from 'react-i18next';

type Props = {
	title: string;
	data: Patchwork.ChannelList[];
	onPressItem: (item: Patchwork.ChannelList) => void;
	onPressViewAll: () => void;
};

export const HorizontalChannelSection = ({
	title,
	data,
	onPressItem,
	onPressViewAll,
}: Props) => {
	const { t } = useTranslation();
	const renderNewsmastChannel = (
		item: Patchwork.ChannelList,
		index: number,
	) => {
		return (
			<Pressable
				key={item.id.toString() + index}
				className="rounded-md mr-3 items-center mb-3 w-32 h-32"
				onPress={() => onPressItem(item)}
			>
				<Image
					uri={item.attributes.avatar_image_url}
					className="w-32 h-32 rounded-md"
				/>

				<View className="absolute w-32 h-32 rounded-md bg-black opacity-30 bottom-0"></View>
				<View className="absolute bottom-0 mx-2 mb-2 flex-row items-center">
					<ThemeText
						className="flex-1 font-Inter_Regular text-white"
						size={'fs_13'}
					>
						{item.attributes.name}
					</ThemeText>
					<ChevronRightIcon fill={'#fff'} />
				</View>
				{item.attributes?.is_primary && (
					<View className="absolute top-1 right-1 bg-white rounded-full">
						<PrimaryBadgeIcon
							fill={customColor['patchwork-dark-50']}
							width={25}
							height={25}
						/>
					</View>
				)}
			</Pressable>
		);
	};

	if (data?.length === 0) {
		return null;
	}

	return (
		<View>
			<View className="flex-row items-center px-4">
				<ThemeText className="font-NewsCycle_Bold my-2 flex-1" size="lg_18">
					{title}
				</ThemeText>
				<Pressable onPress={onPressViewAll} className="active:opacity-80">
					<ThemeText variant="textGrey">{t('common.view_all')}</ThemeText>
				</Pressable>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingLeft: 16, flexDirection: 'row' }}
			>
				{data.slice(0, 9).map((item, index) => {
					return renderNewsmastChannel(item, index);
				})}
			</ScrollView>
		</View>
	);
};
