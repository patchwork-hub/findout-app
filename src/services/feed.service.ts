import {
	AccountDetailFeedQueryKey,
	ComposeImagePayload,
	ComposeMutationPayload,
	FeedDetailQueryKey,
	FeedRepliesQueryKey,
	GetBoostedByQueryKey,
	GetFavoritedByQueryKey,
	GetTrendingStatusesQueryKey,
	GifSearchQueryKey,
	HashtagDetailFeedQueryKey,
	LinkPreviewQueryKey,
	QuoteMutationPayload,
	ReportMutationPayload,
	RepostMutationPayload,
	SaveDraftPayload,
	StatusDetailQueryKey,
	UpdateMediaAttachmentQueryKey,
	ViewSpecificDraftQueryKey,
} from '@/types/queries/feed.type';
import { appendApiVersion, getMaxId, handleError } from '@/util/helper/helper';
import { QueryFunctionContext } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import instance from './instance';
import { useAuthStore } from '@/store/auth/authStore';
import { DEFAULT_INSTANCE } from '@/util/constant';
import { generateQueryCacheForEachStatus } from '@/util/cache/feed/feedCache';

export const getFeedDetail = async (
	qfContext: QueryFunctionContext<FeedDetailQueryKey>,
) => {
	const { id, domain_name } = qfContext.queryKey[1];
	const state = useAuthStore.getState();
	const isUserFormDifferentInstance =
		domain_name == DEFAULT_INSTANCE &&
		state.userOriginInstance !== DEFAULT_INSTANCE;
	const resp: AxiosResponse<Patchwork.StatusDetail> = await instance.get(
		appendApiVersion(`statuses/${id}`),
		{
			params: {
				domain_name: isUserFormDifferentInstance
					? state.userOriginInstance
					: domain_name,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data;
};

export const getFeedReplies = async (
	qfContext: QueryFunctionContext<FeedRepliesQueryKey>,
) => {
	const { id, domain_name } = qfContext.queryKey[1];
	const { userOriginInstance } = useAuthStore.getState();
	const isUserFormDifferentInstance =
		domain_name == DEFAULT_INSTANCE && userOriginInstance !== DEFAULT_INSTANCE;

	const resp: AxiosResponse<Patchwork.TimelineReplies> = await instance.get(
		appendApiVersion(`statuses/${id}/context`),
		{
			params: {
				domain_name: isUserFormDifferentInstance
					? userOriginInstance
					: domain_name,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data;
};

export const getAccountDetailFeed = async (
	qfContext: QueryFunctionContext<AccountDetailFeedQueryKey>,
) => {
	try {
		const {
			account_id,
			exclude_reblogs,
			exclude_replies,
			exclude_original_statuses,
			only_reblogs,
		} = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`accounts/${account_id}/statuses`),
			{
				params: {
					max_id,
					exclude_reblogs,
					exclude_replies,
					...(typeof exclude_original_statuses === 'boolean'
						? { exclude_original_statuses }
						: {}),
					limit: max_id ? 15 : 3,
					...(typeof only_reblogs === 'boolean' ? { only_reblogs } : {}),
					exclude_direct_statuses: true,
				},
			},
		);
		generateQueryCacheForEachStatus(resp.data);
		return {
			data: resp.data,
			links: { next: { max_id: getMaxId(resp) } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const getHashtagDetailFeed = async (
	qfContext: QueryFunctionContext<HashtagDetailFeedQueryKey>,
) => {
	try {
		const { domain_name, hashtag } = qfContext.queryKey[1];
		const max_id = qfContext.pageParam as string;

		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`timelines/tag/${hashtag}`),
			{
				params: {
					domain_name,
					isDynamicDomain: true,
					max_id,
				},
			},
		);

		return {
			data: resp.data,
			links: { next: { max_id: getMaxId(resp) } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const fetchLinkPreview = async (
	qfContext: QueryFunctionContext<LinkPreviewQueryKey>,
) => {
	try {
		const { url } = qfContext.queryKey[1];
		// const response: AxiosResponse<Patchwork.LinkPreview> = await instance.get(
		// 	appendApiVersion(`utilities/link_preview`),
		// 	{
		// 		params: { url },
		// 	},
		// );
		const response: AxiosResponse<Patchwork.LinkPreview> = await axios.get(
			`https://channel.org/api/v1/utilities/link_preview`,
			{
				params: { url },
			},
		);
		return response.data;
	} catch (error) {
		return handleError(error);
	}
};

export const composeStatus = async (params: ComposeMutationPayload) => {
	try {
		const method = params.statusId ? 'put' : 'post';
		const url = appendApiVersion(
			params.statusId ? `statuses/${params.statusId}` : 'statuses',
			'v1',
		);
		const resp: AxiosResponse<Patchwork.Status> = await instance[method](
			url,
			params,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const repostStatus = async (params: RepostMutationPayload) => {
	try {
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			appendApiVersion(`statuses/${params.id}/reblog`, 'v1'),
			params,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const quoteStatus = async (params: QuoteMutationPayload) => {
	try {
		const url = appendApiVersion('statuses', 'v1');
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			url,
			params,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const repostUnRepost = async ({
	id,
	isRepost,
	...payload
}: RepostMutationPayload & {
	id: string;
	isRepost: boolean;
}) => {
	try {
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			appendApiVersion(
				`statuses/${id}/${isRepost ? 'reblog' : 'unreblog'}`,
				'v1',
			),
			payload,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const uploadComposeImage = async (params: ComposeImagePayload) => {
	const { image, onProgressChange } = params;
	const formData = new FormData();
	formData.append('file', {
		uri: image.uri,
		name: image.uri?.split('/').pop(),
		type: image.type,
	});

	try {
		const resp: AxiosResponse<Patchwork.Attachment> = await instance.post(
			appendApiVersion('media', 'v2'),
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: progressEvent => {
					const actualProgress = Math.round(
						(progressEvent.loaded * 100) / (progressEvent?.total ?? 0),
					);
					const upmostProgress = Math.min(actualProgress, 85);
					onProgressChange(upmostProgress);
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getMediaStatus = async (mediaId: string) => {
	try {
		const resp: AxiosResponse<Patchwork.Attachment> = await instance.get(
			appendApiVersion(`media/${mediaId}`),
			{
				validateStatus: status =>
					(status >= 200 && status < 300) || status === 206,
			},
		);
		return { data: resp.data, status: resp.status };
	} catch (error) {
		return handleError(error);
	}
};

export const favouriteStatus = async ({
	status,
}: {
	status: Patchwork.Status;
}) => {
	const toggleFavourite = status.favourited ? 'unfavourite' : 'favourite';
	try {
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			appendApiVersion(`statuses/${status.id}/${toggleFavourite}`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const followHashtag = async ({
	hashtag,
	isAlreadyFollowing,
}: {
	hashtag: string;
	isAlreadyFollowing: boolean;
}) => {
	const toggleFollow = isAlreadyFollowing ? 'unfollow' : 'follow';
	try {
		const resp: AxiosResponse<Patchwork.HashtagDetail> = await instance.post(
			appendApiVersion(`tags/${hashtag}/${toggleFollow}`),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const muteUnMuteUserMutationFn = async ({
	accountId,
	toMute,
}: {
	accountId: string;
	toMute: boolean;
}) => {
	try {
		const muteAction = toMute ? 'mute' : 'unmute';
		const resp: AxiosResponse<Patchwork.RelationShip> = await instance.post(
			appendApiVersion(`accounts/${accountId}/${muteAction}`, 'v1'),
			toMute && { duration: '0', notifications: true },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const blockUnBlockUserMutationFn = async ({
	accountId,
	toBlock,
}: {
	accountId: string;
	toBlock: boolean;
}) => {
	try {
		const blockAction = toBlock ? 'block' : 'unblock';
		const resp: AxiosResponse<Patchwork.RelationShip> = await instance.post(
			appendApiVersion(`accounts/${accountId}/${blockAction}`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const reportMutationFn = async (params: ReportMutationPayload) => {
	try {
		const resp = await instance.post(appendApiVersion('reports', 'v1'), params);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const translationLanguagesFn = async () => {
	try {
		const resp = await instance.get(
			appendApiVersion('instance/translation_languages', 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const translateMutationFn = async ({
	statusId,
}: {
	statusId: string;
}) => {
	try {
		const resp: AxiosResponse<{ content: string }> = await instance.post(
			appendApiVersion(`statuses/${statusId}/translate`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getTrendingStatuses = async (
	qfContext: QueryFunctionContext<GetTrendingStatusesQueryKey>,
) => {
	try {
		const { limit, offset } = qfContext.queryKey[1];
		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`trends/statuses`),
			{
				params: {
					limit,
					offset,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (e) {
		return handleError(e);
	}
};

export const updateMediaAttachment = async (
	params: UpdateMediaAttachmentQueryKey[1],
): Promise<Patchwork.Attachment> => {
	try {
		const formData = new FormData();
		formData.append('description', params.description);
		const resp: AxiosResponse<Patchwork.Attachment> = await instance.put(
			appendApiVersion(`media/${params.id}`, 'v1'),
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getScheduleList = async () => {
	const state = useAuthStore.getState();
	const resp: AxiosResponse<Patchwork.Schedule[]> = await instance.get(
		appendApiVersion(`scheduled_statuses`),
		{
			params: {
				domain_name: state.userOriginInstance,
				isDynamicDomain: true,
				remove_group_by: true,
			},
		},
	);
	return resp.data;
};

export const updateSchedule = async (payload: ComposeMutationPayload) => {
	const resp: AxiosResponse<Patchwork.Schedule> = await instance.put(
		appendApiVersion(`scheduled_statuses/${payload.schedule_detail_id}`),
		payload,
	);
	return resp.data;
};

export const cancelSchedule = async ({ id }: { id: string }) => {
	const resp: AxiosResponse<{ message?: string }> = await instance.delete(
		appendApiVersion(`scheduled_statuses/${id}`),
	);
	return resp.data;
};

export const saveDraft = async (payload: SaveDraftPayload) => {
	try {
		const resp: AxiosResponse<Patchwork.DraftStatusItem> = await instance.post(
			appendApiVersion(`drafted_statuses`, 'v1'),
			payload,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const viewMultiDraft = async () => {
	try {
		const resp: AxiosResponse<Patchwork.MultiDraftStatusData[]> =
			await instance.get(appendApiVersion(`drafted_statuses`, 'v1'));
		return resp.data;
	} catch (e) {
		return handleError(e);
	}
};

export const deleteDraft = async ({ id }: { id: string }) => {
	try {
		const resp: AxiosResponse = await instance.delete(
			appendApiVersion(`drafted_statuses/${id}`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const viewSpecificDraft = async ({
	id,
}: ViewSpecificDraftQueryKey[1]) => {
	try {
		const resp: AxiosResponse<Patchwork.DraftStatusItem> = await instance.get(
			appendApiVersion(`drafted_statuses/${id}`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updateSpecificDraft = async (
	id: string,
	payload: SaveDraftPayload,
) => {
	try {
		const resp: AxiosResponse<Patchwork.DraftStatusItem> = await instance.put(
			appendApiVersion(`drafted_statuses/${id}`, 'v1'),
			payload,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const publishDraft = async (id: string, payload: SaveDraftPayload) => {
	try {
		const resp: AxiosResponse<Patchwork.Status> = await instance.post(
			appendApiVersion(`drafted_statuses/${id}/publish`, 'v1'),
			payload,
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const getStatusDetail = async (
	qfContext: QueryFunctionContext<StatusDetailQueryKey>,
) => {
	const { id } = qfContext.queryKey[1];
	const domain_name = qfContext.meta?.domain_name || DEFAULT_INSTANCE;
	const state = useAuthStore.getState();
	const isUserFormDifferentInstance =
		domain_name == DEFAULT_INSTANCE &&
		state.userOriginInstance !== DEFAULT_INSTANCE;
	const resp: AxiosResponse<Patchwork.Status> = await instance.get(
		appendApiVersion(`statuses/${id}`),
		{
			params: {
				domain_name: isUserFormDifferentInstance
					? state.userOriginInstance
					: domain_name,
				isDynamicDomain: true,
			},
		},
	);
	return resp.data;
};

export const getCustomEmojis = async () => {
	const state = useAuthStore.getState();
	const resp: AxiosResponse<Patchwork.CustomEmojis[]> = await instance.get(
		appendApiVersion(`custom_emojis`, 'v1'),
		{
			params: {
				domain_name: state.userOriginInstance,
				isDynamicDomain: true,
				remove_group_by: true,
			},
		},
	);
	return resp.data;
};

export const getGifSearchResult = async (
	qfContext: QueryFunctionContext<GifSearchQueryKey>,
) => {
	try {
		const { query: searchQuery } = qfContext.queryKey[1];
		const endpoint = !!searchQuery
			? `https://tenor.googleapis.com/v2/search`
			: `https://tenor.googleapis.com/v2/featured`;

		const resp: AxiosResponse<{ results: Patchwork.GifRes[] }> =
			await axios.get(endpoint, {
				params: {
					key: process.env.TENOR_API_KEY,
					media_filter: 'minimal',
					client_key: 'Patchwork',
					locale: 'en_US',
					q: searchQuery || 'cat cute',
				},
			});
		return resp.data.results;
	} catch (e) {
		return handleError(e);
	}
};

export const getFavoritedBy = async (
	qfContext: QueryFunctionContext<GetFavoritedByQueryKey>,
) => {
	try {
		const max_id = qfContext?.pageParam;
		const { id, domain_name } = qfContext.queryKey[1];
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;
		const resp: AxiosResponse<Patchwork.Account[]> = await instance.get(
			appendApiVersion(`statuses/${id}/favourited_by`, 'v1'),
			{
				params: {
					max_id,
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getBoostedBy = async (
	qfContext: QueryFunctionContext<GetBoostedByQueryKey>,
) => {
	try {
		const max_id = qfContext?.pageParam;
		const { id, domain_name } = qfContext.queryKey[1];
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;
		const resp: AxiosResponse<Patchwork.Account[]> = await instance.get(
			appendApiVersion(`statuses/${id}/reblogged_by`, 'v1'),
			{
				params: {
					max_id,
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
				},
			},
		);
		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getQuotedBy = async (
	qfContext: QueryFunctionContext<GetBoostedByQueryKey>,
) => {
	try {
		const max_id = qfContext?.pageParam;
		const { id, domain_name } = qfContext.queryKey[1];
		const state = useAuthStore.getState();
		const isUserFormDifferentInstance =
			domain_name == DEFAULT_INSTANCE &&
			state.userOriginInstance !== DEFAULT_INSTANCE;
		const resp: AxiosResponse<Patchwork.Status[]> = await instance.get(
			appendApiVersion(`statuses/${id}/quotes`, 'v1'),
			{
				params: {
					max_id,
					domain_name: isUserFormDifferentInstance
						? state.userOriginInstance
						: domain_name,
					isDynamicDomain: true,
				},
			},
		);

		const linkHeader = resp.headers.link as string;
		let maxId = null;
		if (linkHeader) {
			const regex = /max_id=(\d+)/;
			const match = linkHeader.match(regex);
			if (match) {
				maxId = match[1];
			}
		}

		return {
			data: resp.data,
			links: { next: { max_id: maxId } },
		};
	} catch (error) {
		return handleError(error);
	}
};

export const getAltTextSetting = async () => {
	try {
		const resp: AxiosResponse<{ data: boolean }> = await instance.get(
			appendApiVersion(`patchwork/alttext_settings`, 'v1'),
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};

export const updateAltTextSetting = async ({
	enabled,
}: {
	enabled: boolean;
}) => {
	try {
		const resp: AxiosResponse<{ data: boolean }> = await instance.post(
			appendApiVersion(`patchwork/alttext_settings/alttext`, 'v1'),
			{ enabled: enabled },
		);
		return resp.data;
	} catch (error) {
		return handleError(error);
	}
};
