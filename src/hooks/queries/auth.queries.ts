import {
	getNewsmastUserInfo,
	getShowMastodonLoginForm,
	getUserById,
	searchServerInstance,
	verifyAuthToken,
} from '@/services/auth.service';
import {
	GetNewsmastAccountlDetailQueryKey,
	GetUserQueryKey,
	GetUserQueryParam,
	SearchServerInstanceQueryKey,
	VerifyAuthTokenQueryKey,
} from '@/types/queries/auth.type';
import { GetChannelSearchQueryKey } from '@/types/queries/channel.type';
import { QueryOptionHelper } from '@/util/helper/helper';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

export const useGetUser = (payload: GetUserQueryParam) => {
	const queryKey: GetUserQueryKey = ['user', payload];
	return useQuery({ queryKey, queryFn: getUserById });
};

export const useVerifyAuthToken = ({
	enabled = false,
}: {
	enabled?: boolean;
}) => {
	const queryKey: VerifyAuthTokenQueryKey = ['verify-token'];
	return useQuery({
		queryKey,
		queryFn: () => verifyAuthToken(),
		enabled,
	});
};

export const useSearchServerInstance = ({
	domain,
	enabled,
}: {
	domain: string;
	enabled: boolean;
}) => {
	const queryKey: SearchServerInstanceQueryKey = [
		'search-server-instance',
		{ domain },
	];
	return useQuery({
		queryKey,
		queryFn: searchServerInstance,
		enabled,
		staleTime: Infinity,
		gcTime: Infinity,
		retry: false,
	});
};

export const useGetNewsmastAccountDetail = ({
	options,
	...queryParam
}: GetNewsmastAccountlDetailQueryKey[1] & {
	options?: QueryOptionHelper<Patchwork.Account | undefined>;
}) => {
	const queryKey: GetNewsmastAccountlDetailQueryKey = [
		'newsmast-account-detail',
		queryParam,
	];
	return useQuery({
		queryKey,
		//@ts-expect-error
		queryFn: getNewsmastUserInfo,
		...options,
	});
};

export const useShowMastodonInstance = () => {
	const queryKey = ['show-mastodon-login'];
	return useQuery({
		queryKey,
		queryFn: getShowMastodonLoginForm,
		staleTime: Infinity,
		gcTime: Infinity,
	});
};
