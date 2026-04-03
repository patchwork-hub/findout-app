import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';
import { View, Pressable } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { cn } from '@/util/helper/twutil';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { truncateStr } from '@/util/helper/helper';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import { useCancelScheduleMutation } from '@/hooks/mutations/feed.mutation';
import { useState } from 'react';
import CustomAlert from '../../common/CustomAlert/CustomAlert';
import { DeleteIcon } from '@/util/svg/icon.common';
import { removeScheduleFromScheduleList } from '@/util/cache/compose/scheduleCache';
import { ComposeGalleryIcon, ComposePollIcon } from '@/util/svg/icon.compose';
import { useColorScheme } from 'nativewind';
import { getComposeUpdatePayload } from '@/util/helper/compose';
import {
	useGetForYouChannelList,
	useGetPostHashtagsList,
} from '@/hooks/queries/channel.queries';
import Graphemer from 'graphemer';
import { useTranslation } from 'react-i18next';

const splitter = new Graphemer();

type Props = {
	schedule: Patchwork.Schedule;
	index: number;
	onClose: () => void;
	onItemPressFromSetting?: (schedule: Patchwork.Schedule) => void;
};

const colorToIdxMapping = [
	'bg-[#ec489955] border-l-pink-500',
	'bg-[#22c55e55] border-l-green-500',
	'bg-[#f9731655] border-l-orange-500',
	'bg-[#06b6d455] border-l-cyan-500',
	'bg-[#dc262655] border-l-red-500',
	'bg-[#84cc1655] border-l-lime-500',
	'bg-[#f59e0b55] border-l-amber-500',
	'bg-[#3b82f655] border-l-blue-500',
];

dayjs.extend(utc);
dayjs.extend(timezone);

const ScheduleItem = ({
	schedule,
	index,
	onClose,
	onItemPressFromSetting,
}: Props) => {
	const { t } = useTranslation();
	const scheduledTime = dayjs.utc(schedule.scheduled_at).local();
	const { colorScheme } = useColorScheme();
	const { composeState, composeDispatch } = useComposeStatus();
	const { resetAttachmentStore, onAddMedia } = useManageAttachmentActions();
	const [alertState, setAlertState] = useState({
		message: '',
		isOpen: false,
		showCancel: true,
	});
	const { setSelectedAudience } = useAudienceStore();

	const filteredText = schedule.params.text;

	const { data: forYouChannels } = useGetForYouChannelList();
	const { data: postHashtagsRes } = useGetPostHashtagsList({
		channel_type: 'newsmast',
	});

	const { mutate } = useCancelScheduleMutation({
		onMutate: ({ id }) => {
			removeScheduleFromScheduleList(id);
		},
	});

	const handleItemClick = () => {
		if (onItemPressFromSetting) {
			onItemPressFromSetting(schedule);
			return;
		}

		clearComposeStates();

		const updateComposePayload = getComposeUpdatePayload({
			type: 'schedule',
			item: schedule,
			composeState,
		});
		composeDispatch(updateComposePayload);

		onAddMedia(
			schedule.media_attachments.map(item => {
				return { ...item, sensitive: !!schedule?.params?.sensitive };
			}),
		);

		let computedVisibility = schedule.params
			.visibility as Patchwork.ComposeVisibility;

		const scheduleHashtags = new Set(
			schedule?.params?.text
				.split(/\s+/)
				.filter(word => word.startsWith('#'))
				.map(word => word.trim().toLowerCase()),
		);

		let foundAudience: Patchwork.PostHashtagDetail[] | null = null;
		let allAudHashtags: string[] = [];
		let isFromForYouChannels = false;

		if (forYouChannels && forYouChannels.length > 0) {
			const mappedSelectedAudience = forYouChannels
				.map(wg => {
					const originalHashtags =
						wg.attributes?.patchwork_community_hashtags ?? [];
					const matchedHashtags = originalHashtags.filter(h =>
						scheduleHashtags.has(`#${h.hashtag.toLowerCase()}`),
					);

					if (matchedHashtags.length > 0) {
						return {
							community_name: wg.attributes?.name || '',
							patchwork_community_id: wg.attributes?.id || 0,
							hashtags: matchedHashtags.map(h => ({
								id: h.id,
								hashtag: h.hashtag,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							})),
						} as Patchwork.PostHashtagDetail;
					}
					return null;
				})
				.filter((c): c is Patchwork.PostHashtagDetail => c !== null);

			if (mappedSelectedAudience.length > 0) {
				foundAudience = mappedSelectedAudience;
				isFromForYouChannels = true;
			}
		}

		if (!foundAudience && postHashtagsRes && postHashtagsRes.length > 0) {
			const mappedSelectedAudience = postHashtagsRes
				.map(channel => {
					const originalHashtags = channel.hashtags ?? [];
					const matchedHashtags = originalHashtags.filter(h =>
						scheduleHashtags.has(`#${h.hashtag.toLowerCase()}`),
					);

					if (matchedHashtags.length > 0) {
						return {
							community_name: channel.community_name,
							patchwork_community_id: channel.patchwork_community_id,
							hashtags: matchedHashtags,
						} as Patchwork.PostHashtagDetail;
					}
					return null;
				})
				.filter((c): c is Patchwork.PostHashtagDetail => c !== null);

			if (mappedSelectedAudience.length > 0) {
				foundAudience = mappedSelectedAudience;
			}
		}

		if (foundAudience) {
			setSelectedAudience(foundAudience);
			if (isFromForYouChannels) {
				computedVisibility = 'local';
			}

			allAudHashtags = foundAudience.flatMap(
				aud => aud.hashtags?.map(h => `#${h.hashtag.toLowerCase()}`) ?? [],
			);

			const contentWithoutAudienceTags = schedule.params.text.replace(
				/#\w+/g,
				match => {
					const lower = match.toLowerCase();
					return allAudHashtags.some(tag => tag === lower) ? '' : match;
				},
			);

			composeDispatch({
				type: 'text',
				payload: {
					count: splitter.countGraphemes(contentWithoutAudienceTags),
					raw: contentWithoutAudienceTags.trimEnd(),
				},
			});
		} else {
			composeDispatch({
				type: 'text',
				payload: {
					count: splitter.countGraphemes(schedule.params.text),
					raw: schedule.params.text,
				},
			});

			composeDispatch({
				type: 'spoilerText',
				payload: schedule.params.spoiler_text || '',
			});
		}

		composeDispatch({
			type: 'visibility_change',
			payload: computedVisibility,
		});

		onClose();
	};

	const clearComposeStates = () => {
		resetAttachmentStore();
	};

	return (
		<View className="flex-row my-3 items-center">
			<View className="w-16">
				<ThemeText>{scheduledTime.format('h:mm A')}</ThemeText>
				<ThemeText>{scheduledTime.format('D MMM')}</ThemeText>
			</View>

			<Pressable
				className={cn(
					' pb-3 pt-5 pr-3 pl-2 flex-1 flex-row items-center rounded-md active:opacity-90',
					colorToIdxMapping[index % 8],
				)}
				onPress={handleItemClick}
			>
				<View
					className={cn(
						'border-l h-full mr-2 absolute left-[5]',
						colorToIdxMapping[index % 8],
					)}
				></View>
				<View className="py-3 ml-1">
					<ThemeText className="">{truncateStr(filteredText, 120)}</ThemeText>
					{schedule.media_attachments.length > 0 && (
						<View className="mt-1 flex-row items-center">
							<ThemeText className="text-gray-200 font-NewsCycle_Bold">
								{t('timeline.attachment_count', {
									count: schedule.media_attachments.length,
								})}
							</ThemeText>
							<ComposeGalleryIcon
								width={16}
								height={16}
								className="ml-1"
								colorScheme={colorScheme}
							/>
						</View>
					)}
					{schedule.params.poll && (
						<View className="mt-1 flex-row items-center">
							<ComposePollIcon
								width={16}
								height={16}
								className="mr-1"
								colorScheme={colorScheme}
							/>
							<ThemeText className="text-gray-200 font-NewsCycle_Bold">
								{t('timeline.poll_included')}
							</ThemeText>
						</View>
					)}
				</View>
			</Pressable>
			<Pressable
				onPress={() => {
					setAlertState(prev => ({
						...prev,
						message: t('timeline.confirm_delete_schedule'),
						isOpen: true,
					}));
				}}
				className={`absolute right-2 top-2 ${
					colorScheme == 'dark' ? 'bg-[#fff5]' : 'bg-[#3333]'
				} rounded-full p-1 active:opacity-90`}
			>
				<DeleteIcon width={13} height={13} fill={'#fff'} className="m-[2]" />
			</Pressable>
			{alertState.isOpen && (
				<CustomAlert
					isVisible={true}
					hasCancel
					title={t('common.delete')}
					extraTitleStyle="text-white text-center -ml-2"
					message={alertState.message}
					handleCancel={() =>
						setAlertState(prev => ({
							...prev,
							isOpen: false,
						}))
					}
					handleOk={() => {
						setAlertState(prev => ({
							...prev,
							isOpen: false,
						}));
						mutate({ id: schedule.id });
					}}
					type="error"
				/>
			)}
		</View>
	);
};

export default ScheduleItem;
