import Checkbox from '@/components/atoms/common/Checkbox/Checkbox';
import Image from '@/components/atoms/common/Image/Image';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import {
	useFavouriteChannelLists,
	useGetForYouChannelList,
} from '@/hooks/queries/channel.queries';
import { useCreateAudienceStore } from '@/store/compose/audienceStore/createAudienceStore';
import { useEditAudienceStore } from '@/store/compose/audienceStore/editAudienceStore';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import customColor from '@/util/constant/color';
import { Dimensions, FlatList, Pressable, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useColorScheme } from 'nativewind';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';
import { useTranslation } from 'react-i18next';

const screenHeight = Dimensions.get('window').height;
const modalHeight = screenHeight * 0.6;

type Props = {
	composeType: 'create' | 'edit' | 'repost' | 'quote' | 'schedule';
	onClose: () => void;
};

export const AudienceListModal = ({ composeType, onClose }: Props) => {
	const { t } = useTranslation();
	const { composeState, composeDispatch } = useComposeStatus();
	const { colorScheme } = useColorScheme();
	const { selectedAudience, setSelectedAudience } = useCreateAudienceStore();
	const { editSelectedAudience, setEditSelectedAudience } =
		useEditAudienceStore();
	const { selectedDraftId } = useDraftPostsStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = composeType === 'create' && !!selectedDraftId;

	const audienceSource =
		isSchedule || isDraft || composeType === 'edit'
			? editSelectedAudience
			: selectedAudience;

	const setAudience =
		isSchedule || isDraft || composeType === 'edit'
			? setEditSelectedAudience
			: setSelectedAudience;

	const { data: newsmastChannels, isLoading } = useGetForYouChannelList();

	const onPressCheckbox = (item: Patchwork.ChannelList) => {
		const isCurrentlySelected = audienceSource.some(
			sel => sel.id === item.attributes?.id,
		);

		if (isCurrentlySelected) {
			setAudience([]);
		} else {
			setAudience([item.attributes]);
			composeDispatch({ type: 'visibility_change', payload: 'local' });
		}
		onClose();
	};

	const handleSelectLocal = () => {
		setAudience([]);
		composeDispatch({ type: 'visibility_change', payload: 'local' });
		onClose();
	};

	const handleSelectPublic = () => {
		setAudience([]);
		composeDispatch({ type: 'visibility_change', payload: 'public' });
		onClose();
	};

	return (
		<ThemeModal
			type="simple"
			title={t('setting.choose_audience')}
			position="bottom"
			visible={true}
			onClose={onClose}
		>
			<View style={{ height: modalHeight, paddingTop: 12 }}>
				{newsmastChannels && (
					<FlatList
						data={newsmastChannels}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={() => (
							<Checkbox
								isChecked={
									audienceSource.length === 0 &&
									composeState.visibility === 'local'
								}
								handleOnCheck={handleSelectLocal}
							>
								<View className="flex-row items-center px-3 py-3 space-x-3">
									<View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
										<FontAwesomeIcon
											icon={AppIcons.location}
											size={14}
											color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
										/>
									</View>
									<ThemeText>Local</ThemeText>
								</View>
							</Checkbox>
						)}
						ListFooterComponent={() => (
							<Checkbox
								isChecked={
									audienceSource.length === 0 &&
									composeState.visibility === 'public'
								}
								handleOnCheck={handleSelectPublic}
							>
								<View className="flex-row items-center px-3 py-3 space-x-3">
									<View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
										<FontAwesomeIcon
											icon={AppIcons.globe}
											size={14}
											color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
										/>
									</View>
									<ThemeText>Public</ThemeText>
								</View>
							</Checkbox>
						)}
						ListEmptyComponent={() => {
							return (
								<ThemeText variant="textPrimary" className="text-center">
									There is no community available.
								</ThemeText>
							);
						}}
						renderItem={({ item }) => {
							const isChecked = audienceSource.some(
								sel => sel.id === item.attributes?.id,
							);

							return (
								<Checkbox
									isChecked={isChecked}
									handleOnCheck={() => onPressCheckbox(item)}
								>
									<View className="flex-row items-center px-3 py-3 space-x-3">
										<Image
											uri={item.attributes?.avatar_image_url}
											className="w-10 h-10 rounded-full"
										/>
										<ThemeText>{item.attributes?.name}</ThemeText>
									</View>
								</Checkbox>
							);
						}}
						keyExtractor={item => item.id.toString()}
						showsHorizontalScrollIndicator={false}
					/>
				)}
				{isLoading && (
					<View className="flex-1 items-center justify-center">
						<Flow
							size={30}
							color={
								colorScheme === 'dark'
									? customColor['patchwork-primary-dark']
									: customColor['patchwork-primary']
							}
						/>
					</View>
				)}
			</View>
		</ThemeModal>
	);
};
