import { useAudienceStore } from '@/store/compose/audienceStore/audienceStore';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import PollForm from '../PollForm/PollForm';
import ComposeTextInput from '@/components/atoms/compose/ComposeTextInput/ComposeTextInput';
import { LinkCard } from '@/components/atoms/compose/LinkCard/LinkCard';
import ImageCard from '@/components/atoms/compose/ImageCard/ImageCard';
import { useComposeStatus } from '@/context/composeStatusContext/composeStatus.context';
import { useManageAttachmentActions } from '@/store/compose/manageAttachments/manageAttachmentStore';
import { POLL_DURATION_OPTIONS } from '@/util/constant/pollOption';
import Graphemer from 'graphemer';
import { useMaxCount } from '@/hooks/custom/useMaxCount';
import {
	useGetForYouChannelList,
	useGetPostHashtagsList,
} from '@/hooks/queries/channel.queries';
import { getQuotePolicy } from '@/util/helper/helper';

const splitter = new Graphemer();

const findClosestDuration = (expiresIn: number) => {
	return POLL_DURATION_OPTIONS.reduce((prev, curr) =>
		Math.abs(curr.value - expiresIn) < Math.abs(prev.value - expiresIn)
			? curr
			: prev,
	);
};
const EditComposeStatus = ({ status }: { status: Patchwork.Status }) => {
	const { composeState, composeDispatch } = useComposeStatus();
	const { onSelectMedia, resetAttachmentStore } = useManageAttachmentActions();
	const maxStatusLength = useMaxCount();
	const { setSelectedAudience, clearAudience } = useAudienceStore();

	const { data: forYouChannelList } = useGetForYouChannelList();
	const { data: postHashtagsRes } = useGetPostHashtagsList({
		channel_type: 'newsmast',
	});

	useEffect(() => {
		return () => {
			clearAudience();
		};
	}, []);

	useEffect(() => {
		composeDispatch({
			type: 'disableUserSuggestionsModal',
			payload: true,
		});

		let computedVisibility =
			status?.local_only === true
				? 'local'
				: (status.visibility as Patchwork.ComposeVisibility);

		if (status.text) {
			const statusHashtags = new Set(
				status.text
					.split(/\s+/)
					.filter(word => word.startsWith('#'))
					.map(word => word.trim().toLowerCase()),
			);

			let foundAudience: Patchwork.PostHashtagDetail[] | null = null;
			let allAudHashtags: string[] = [];
			let isFromForYouChannels = false;

			if (forYouChannelList && forYouChannelList.length > 0) {
				const mappedSelectedAudience = forYouChannelList
					.map(wg => {
						const originalHashtags =
							wg.attributes?.patchwork_community_hashtags ?? [];
						const matchedHashtags = originalHashtags.filter(h =>
							statusHashtags.has(`#${h.hashtag.toLowerCase()}`),
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
							statusHashtags.has(`#${h.hashtag.toLowerCase()}`),
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

				const contentWithoutAudienceTags = status.text.replace(
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

				if (contentWithoutAudienceTags.length > 500) {
					composeDispatch({ type: 'maxCount', payload: maxStatusLength });
				}
			} else {
				composeDispatch({
					type: 'text',
					payload: {
						count: splitter.countGraphemes(status.text),
						raw: status.text,
					},
				});

				if (status.text.length > 500) {
					composeDispatch({ type: 'maxCount', payload: maxStatusLength });
				}
			}
		}

		if (status.poll) {
			const expiresIn = Math.floor(
				(new Date(status.poll.expires_at!).getTime() -
					new Date(status.created_at).getTime()) /
					1000,
			);
			const closestDuration = findClosestDuration(expiresIn);

			composeDispatch({
				type: 'poll',
				payload: {
					options: status.poll.options.map(option => option.title),
					expires_in: closestDuration.value,
					multiple: status.poll.multiple,
				},
			});
		}

		if (status.media_attachments.length > 0) {
			composeDispatch({
				type: 'media_add',
				payload: status.media_attachments.map(media => media.id),
			});
			onSelectMedia(
				status.media_attachments.map(media => ({
					...media,
					sensitive: status.sensitive,
				})),
			);
		}

		composeDispatch({
			type: 'visibility_change',
			payload: computedVisibility,
		});

		composeDispatch({
			type: 'sensitive',
			payload: status.sensitive,
		});

		composeDispatch({
			type: 'spoilerText',
			payload: status.spoiler_text || '',
		});

		composeDispatch({
			type: 'quote_policy_change',
			payload: getQuotePolicy(status),
		});

		return () => {
			composeDispatch({ type: 'clear' });
			resetAttachmentStore();
		};
	}, [status, forYouChannelList, postHashtagsRes]);

	return (
		<View className="px-4">
			<ComposeTextInput />
			<PollForm composeType="create" />
			<LinkCard composeType="edit" />
			<ImageCard composeType="edit" />
		</View>
	);
};

export default EditComposeStatus;
