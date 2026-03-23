import { Platform, View } from 'react-native';
import StatusReplyButton from '@/components/atoms/feed/StatusReply/StatusReplyButton';
import StatusReblogButton from '@/components/atoms/feed/StatusReblog/StatusReblogButton';
import StatusFavourtieButton from '@/components/atoms/feed/StatusFavourite/StatusFavourtieButton';
import StatusMenu from '@/components/atoms/feed/StatusMenu/StatusMenu';
import { cn } from '@/util/helper/twutil';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth/authStore';
import { useStatusContext } from '@/context/statusItemContext/statusItemContext';
import CustomAlert from '@/components/atoms/common/CustomAlert/CustomAlert';
import StatusShareMenu from '@/components/atoms/feed/StatusShareMenu/StatusShareMenu';
import StatusTranslate from '@/components/atoms/feed/StatusTranslate/StatusTranslate';
import StatusBookmarkButton from '@/components/atoms/feed/StatusBookmark/StatusBookmarkButton';
import { useRepostUnRepostMutation } from '@/hooks/mutations/feed.mutation';
import { updateStatusRepostCache } from '@/util/cache/feed/feedCache';
import Toast from 'react-native-toast-message';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { queryClient } from '@/App';

type Props = {
	status: Patchwork.Status;
	isFromNoti?: boolean;
};

const StatusActionBar = ({ status, isFromNoti }: Props) => {
	const { userInfo } = useAuthStore();
	const { currentPage } = useStatusContext();
	const [isAlertOpen, setAlert] = useState(false);
	const domain_name = useSelectedDomain();

	const reblogsCount = status.reblog
		? status.reblog.reblogs_count
		: status.reblogs_count;

	const repliesCount = status.reblog
		? status.reblog.replies_count
		: status.replies_count;

	const accountDetailFeedQueryKey = [
		'account-detail-feed',
		{
			domain_name: domain_name,
			account_id: userInfo?.id!,
			exclude_replies: true,
			exclude_reblogs: false,
			exclude_original_statuses: false,
		},
	];

	const onPressRepost = () => {
		const payload = {
			in_reply_to_id: undefined,
			language: 'en',
			sensitive: false,
			spoiler_text: '',
			status: '',
			visibility: 'public' as Patchwork.ComposeVisibility,
			media_ids: [],
			poll: null,
			max_length: 500,
			id: status.id,
		};

		repost({
			...payload,
			isRepost: !(status.reblog ? status.reblog.reblogged : status.reblogged),
		});
	};

	const { mutate: repost, isPending: isReposting } = useRepostUnRepostMutation({
		onMutate: ({ id: statusId, isRepost }) => {
			updateStatusRepostCache(statusId, isRepost ? 'increase' : 'decrease');
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: accountDetailFeedQueryKey });
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
			const id = status?.reblog?.id || status.id;
			updateStatusRepostCache(id, 'decrease');
		},
	});

	const isAuthor = useMemo(() => {
		const currentUserAccHandle = userInfo?.acct + '@channel.org';
		return (
			userInfo?.id == status?.account?.id ||
			status?.account?.acct == currentUserAccHandle
		);
	}, [status, userInfo?.id]);

	if (!status?.account) {
		return null;
	}

	return (
		<View
			className={cn(
				`flex flex-row justify-between mt-1 items-center ${
					currentPage !== 'FeedDetail' && status.reblog ? 'ml-9' : null
				}`,
			)}
		>
			<View className="flex flex-row ">
				<StatusReplyButton
					className="mr-3"
					count={repliesCount}
					status={status}
				/>
				<StatusReblogButton
					count={reblogsCount}
					status={status}
					onBoost={onPressRepost}
					alreadyReblogged={status.reblogged || status.reblog?.reblogged}
					className={cn('mr-2', isReposting && 'animate-spin')}
				/>
				<StatusFavourtieButton className="mr-3" {...{ status, isFromNoti }} />
			</View>
			<View className="flex flex-row items-center mr-2">
				{status.translated_text && <StatusTranslate {...{ status }} />}
				<View className="flex flex-row items-center">
					<StatusBookmarkButton
						className="mr-[14px]"
						{...{ status, isFromNoti }}
					/>
					<StatusShareMenu {...{ status, isFromNoti }} />
				</View>
			</View>
			{isAlertOpen && (
				<CustomAlert
					message={'You have already re-posted this status!'}
					hasCancel={false}
					isVisible={isAlertOpen}
					handleOk={() => setAlert(false)}
					type="error"
				/>
			)}
		</View>
	);
};

export default StatusActionBar;
