import { ComposeState } from '@/context/composeStatusContext/composeStatus.type';
import {
	ComposeMutationPayload,
	QuoteMutationPayload,
	RepostMutationPayload,
	SaveDraftPayload,
} from '@/types/queries/feed.type';
import { Match } from 'linkify-it';
import { differenceWith, isEqual } from 'lodash';
import { Asset } from 'react-native-image-picker';
import Graphemer from 'graphemer';
import { isTablet } from './isTablet';

export const showLinkCardIfNotManuallyClose = (
	currentUrl: string,
	previousUrl: string,
	showLinkCard: boolean,
) => {
	return previousUrl == currentUrl ? showLinkCard : true;
};

export const findFirstLink = (matches: Match[]) => {
	const firstMatch = matches.find(
		item => item.schema === '' || item.schema === 'https:',
	);
	return firstMatch ? firstMatch.url : '';
};

export const findMentionChanges = (
	mentionList: Match[] | undefined,
	prevMentionList: Match[] | undefined,
) => {
	return differenceWith(mentionList, prevMentionList ?? [], isEqual);
};

export const getReplacedMentionText = (
	originalString: string,
	startIndex: number,
	fullDisplayName: string,
) => {
	const endIndex =
		originalString.indexOf(' ', startIndex) === -1
			? originalString.length
			: originalString.indexOf(' ', startIndex);

	return (
		originalString.slice(0, startIndex) +
		'@' +
		fullDisplayName +
		originalString.slice(endIndex)
	);
};

type CPPayloadCreatorType = (state: ComposeState) => ComposeMutationPayload;
export const prepareComposePayload: CPPayloadCreatorType = state => {
	return {
		in_reply_to_id: state.in_reply_to_id,
		language: state.language,
		sensitive: state.sensitive,
		spoiler_text: state.sensitive ? state.spoilerText : '',
		status: state.text.raw,
		visibility: state.visibility == 'local' ? 'public' : state.visibility,
		quote_approval_policy: state?.quote_approval_policy,
		media_ids: state.media_ids.length > 0 ? state.media_ids : [],
		poll: state.poll,
		local_only: state.visibility === 'local',
		max_length: state.maxCount,
		...(state.schedule
			? {
					schedule_detail_id: state.schedule.schedule_detail_id,
					scheduled_at: state.schedule.scheduled_at,
			  }
			: {}),
	};
};

type RPPayloadCreatorType = (
	state: ComposeState,
	id: string,
) => RepostMutationPayload;
export const prepareRepostPayload: RPPayloadCreatorType = (state, id) => {
	return { ...prepareComposePayload(state), id };
};

type QuotePayloadCreatorType = (
	state: ComposeState,
	quoted_status_id: string,
) => QuoteMutationPayload;
export const prepareQuotePayload: QuotePayloadCreatorType = (
	state,
	quoted_status_id,
) => {
	return {
		...prepareComposePayload(state),
		quoted_status_id,
		quote_approval_policy: state?.quote_approval_policy,
	};
};

type ReplyPayloadCreatorType = (
	state: ComposeState,
	id: string,
) => ComposeMutationPayload;
export const prepareReplyPayload: ReplyPayloadCreatorType = (state, id) => {
	return { ...prepareComposePayload(state), in_reply_to_id: id };
};

export const calculateImageWidth = (selectedMedia: Asset[], index: number) => {
	if (selectedMedia.length == 1)
		return `w-full ${isTablet ? 'h-[400]' : 'h-56'}`;
	if (selectedMedia.length > 1) {
		return index === 2 && selectedMedia.length == 3
			? `w-full ${isTablet ? 'h-[300]' : 'h-56'}`
			: `w-1/2 ${isTablet ? 'h-[300]' : 'h-[140]'}`;
	}
};

export const updateReplyCountInFeed = (
	data: IFeedQueryFnData,
	statusId: string,
	operation: 'increase' | 'decrease',
) => {
	return {
		...data,
		pages: data.pages.map(page => ({
			...page,
			data: page.data.map(status => {
				if (status.id === statusId) {
					return {
						...status,
						replies_count:
							operation == 'increase'
								? status.replies_count + 1
								: status.replies_count - 1,
					};
				}

				if (status.reblog && status.reblog.id == statusId) {
					return {
						...status,
						reblog: {
							...status.reblog,
							replies_count:
								operation == 'increase'
									? status.reblog.replies_count + 1
									: status.reblog.replies_count - 1,
						},
					};
				}
				return status;
			}),
		})),
	};
};

export const prepareDraftPayload = (
	state: ComposeState,
	isDrafted: boolean,
): SaveDraftPayload => {
	return {
		in_reply_to_id: state.in_reply_to_id,
		language: state.language,
		sensitive: state.sensitive,
		spoiler_text: state.sensitive ? state.spoilerText : '',
		status: state.text.raw,
		visibility: state.visibility == 'local' ? 'public' : state.visibility,
		media_ids: state.media_ids.length > 0 ? state.media_ids : [],
		poll: state.poll,
		drafted: isDrafted,
		local_only: state.visibility === 'local',
	};
};

interface HandleComposeUpdateParams<T extends 'draft' | 'schedule'> {
	type: T;
	item: T extends 'draft' ? Patchwork.DraftStatusItem : Patchwork.Schedule;
	composeState: ComposeState;
}

export const getComposeUpdatePayload = <T extends 'draft' | 'schedule'>({
	type,
	item,
	composeState,
}: HandleComposeUpdateParams<T>): {
	type: 'draft' | 'schedule-update';
	payload: ComposeState;
} => {
	const splitter = new Graphemer();
	return {
		type: type === 'draft' ? 'draft' : 'schedule-update',
		payload: {
			...composeState,
			text: {
				count: splitter.countGraphemes(item.params.text),
				raw: item.params.text,
			},
			media_ids: item.params.media_ids,
			visibility: item.params.visibility,
			sensitive: item.params.sensitive,
			spoilerText: item.params.spoiler_text,
			language: item.params.language,
			...(type === 'schedule'
				? {
						schedule: {
							scheduled_at: (item as Patchwork.Schedule).scheduled_at,
							is_edting_previous_schedule: true,
							schedule_detail_id: item.id,
							forceCloseUserModalOnScheduleUpdate: true,
						},
				  }
				: null),
			poll: item.params.poll,
			forceCloseUserModalOnDraft: true,
		},
	};
};

export const extractAllAudienceHashtags = (
	channels: Patchwork.ChannelList[],
) => {
	return (
		channels?.flatMap(
			channel =>
				channel.attributes?.patchwork_community_hashtags?.map(
					h => `#${h.hashtag}`,
				) ?? [],
		) ?? []
	);
};
