import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';
import Checkbox from '@/components/atoms/common/Checkbox/Checkbox';
import Image from '@/components/atoms/common/Image/Image';
import ThemeModal from '@/components/atoms/common/ThemeModal/ThemeModal';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { useDraftPostsStore } from '@/store/compose/draftPosts/draftPostsStore';
import customColor from '@/util/constant/color';
import { Dimensions, FlatList, View } from 'react-native';
import { Flow } from 'react-native-animated-spinkit';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useColorScheme } from 'nativewind';
import { AppIcons } from '@/util/icons/icon.common';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useGetForYouChannelList } from '@/hooks/queries/channel.queries';

const screenHeight = Dimensions.get('window').height;
const modalHeight = screenHeight * 0.6;

type Props = {
	composeType: 'create' | 'edit' | 'repost' | 'quote' | 'schedule';
	onClose: () => void;
};

export const AudienceListModal = ({ composeType, onClose }: Props) => {
	const { composeState, composeDispatch } = useComposeStatus();
	const { colorScheme } = useColorScheme();
	const { selectedAudience, setSelectedAudience: setAudience } =
		useAudienceStore();
	const audienceSource = selectedAudience?.flat() || [];
	const { selectedDraftId } = useDraftPostsStore();

	const isSchedule = !!composeState.schedule?.is_edting_previous_schedule;
	const isDraft = composeType === 'create' && !!selectedDraftId;

	const { data: forYouChannels, isLoading } = useGetForYouChannelList();

	const onPressCheckbox = (item: Patchwork.ChannelList) => {
		const isCurrentlySelected = audienceSource.some(sel =>
			sel.hashtags?.some(selHashtag =>
				item.attributes?.patchwork_community_hashtags?.some(
					forYouHashtag => forYouHashtag.hashtag === selHashtag.hashtag,
				),
			),
		);

		if (isCurrentlySelected) {
			setAudience([]);
		} else {
			setAudience([
				{
					community_name: item.attributes?.name,
					patchwork_community_id: item.attributes?.id,
					hashtags:
						item.attributes?.patchwork_community_hashtags?.map(h => ({
							id: h.id,
							hashtag: h.hashtag,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						})) || [],
				},
			]);
			composeDispatch({ type: 'visibility_change', payload: 'local' });
		}
		onClose();
	};

	const handleSelectLocal = () => {
		composeDispatch({ type: 'visibility_change', payload: 'local' });
		setAudience([]);
		onClose();
	};

	const handleSelectPublic = () => {
		composeDispatch({ type: 'visibility_change', payload: 'public' });
		setAudience([]);
		onClose();
	};

	return (
		<ThemeModal
			type="simple"
			title="Choose audience"
			position="bottom"
			visible={true}
			onClose={onClose}
		>
			<View style={{ height: modalHeight, paddingTop: 12 }}>
				{forYouChannels && (
					<FlatList
						data={forYouChannels}
						showsVerticalScrollIndicator={false}
						ListHeaderComponent={() => (
							<Checkbox
								isChecked={
									audienceSource.length === 0 &&
									composeState.visibility === 'local'
								}
								disabled={
									composeType !== 'create' &&
									composeState.visibility === 'public'
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
								isChecked={composeState.visibility === 'public'}
								disabled={
									composeType !== 'create' &&
									composeState.visibility === 'local'
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
									There is no joined working group available.
								</ThemeText>
							);
						}}
						renderItem={({ item }) => {
							const isChecked = audienceSource.some(sel =>
								sel.hashtags?.some(selHashtag =>
									item.attributes?.patchwork_community_hashtags?.some(
										forYouHashtag =>
											forYouHashtag.hashtag === selHashtag.hashtag,
									),
								),
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
