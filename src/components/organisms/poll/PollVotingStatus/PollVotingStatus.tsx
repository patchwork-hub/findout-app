import { useState, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { useVoteMutation } from '@/hooks/mutations/vote.mutation';
import Toast from 'react-native-toast-message';
import PollVotingFooter from '@/components/molecules/poll/PollVotingFooter/PollVotingFooter';
import PollVotingOption from '@/components/molecules/poll/PollVotingOption/PollVotingOption';
import PollVotingControls from '@/components/molecules/poll/PollVotingControls/PollVotingControls';
import { updatePollStatus } from '@/util/cache/poll/pollCache';
import {
	useActiveFeedAction,
	useCurrentActiveFeed,
} from '@/store/feed/activeFeed';
import { useStatusContext } from '@/context/statusItemContext/statusItemContext';
import { useSpecificServerProfile } from '@/hooks/queries/profile.queries';
import { useGetSpecificPollInfo } from '@/hooks/queries/vote.queries';
import { cn } from '@/util/helper/twutil';
import useDebounce from '@/hooks/custom/useDebounce';
import {
	updateStatusPollCache,
	updateStatusPollCacheOnRefresh,
} from '@/util/cache/feed/feedCache';

const PollVotingStatus = ({
	status,
	isReposting,
	isFromNoti,
}: {
	status: Patchwork.Status;
	isReposting?: boolean;
	isFromNoti?: boolean;
}) => {
	const currentFeed = useCurrentActiveFeed();
	const { setActiveFeed } = useActiveFeedAction();
	const { currentPage, extraPayload } = useStatusContext();

	const [checkResults, setCheckResults] = useState(false);
	const onToggleCheckResults = () => setCheckResults(prevState => !prevState);

	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
		new Set(),
	);

	const startDebounce = useDebounce();

	const handleOptionSelect = useCallback(
		(index: number) => {
			setSelectedIndices(prev => {
				const updatedIndices = new Set(prev);
				if (status.poll.multiple) {
					updatedIndices.has(index)
						? updatedIndices.delete(index)
						: updatedIndices.add(index);
				} else {
					updatedIndices.clear();
					updatedIndices.add(index);
				}
				return updatedIndices;
			});
		},
		[status.poll.multiple],
	);

	// ******** Poll Vote Mutation ******** //
	// ***** Get Specific Server Profile ***** //
	const { data: specificServerProfile } = useSpecificServerProfile({
		q: status.url as string,
		type: 'statuses',
		options: {
			enabled: !!status.url,
		},
	});
	// ***** Get Specific Server Profile ***** //

	const { mutate, isPending } = useVoteMutation({
		onSuccess: response => {
			if (currentPage == 'FeedDetail' && currentFeed?.id === status.id) {
				const updateFeedDatailData = updatePollStatus(
					currentFeed,
					selectedIndices,
				);
				setActiveFeed(updateFeedDatailData);
			}

			updateStatusPollCache(status.id, selectedIndices);
		},
		onError: e => {
			Toast.show({
				type: 'errorToast',
				text1: e.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const { refetch: fetchSpecificPollInfo, isFetching } = useGetSpecificPollInfo(
		{
			id: specificServerProfile?.statuses[0]?.poll?.id as string,
			options: {
				enabled: false,
			},
		},
	);

	const handleVote = useCallback(() => {
		if (selectedIndices.size > 0 && specificServerProfile) {
			mutate({
				id: specificServerProfile?.statuses[0]?.poll?.id,
				choices: Array.from(selectedIndices),
			});
		}
	}, [selectedIndices, mutate]);

	const handlePollRefresh = async () => {
		const result = await fetchSpecificPollInfo();
		if (result.data) {
			if (currentPage == 'FeedDetail' && currentFeed?.id === status.id) {
				const updateFeedDetailData = {
					...status,
					poll: result.data,
				};
				setActiveFeed(updateFeedDetailData);
			}

			updateStatusPollCacheOnRefresh(status.id, result.data);
		}
	};

	// const debouncePollRefresh = () => {
	// 	startDebounce(() => {
	// 		handlePollRefresh();
	// 	}, 1000);
	// };

	// ******** Poll Vote Mutation ******** //

	const expired =
		status.poll.expired ||
		(status.poll.expires_at !== null &&
			new Date(status.poll.expires_at).getTime() < Date.now());

	const showResults = status.poll.voted || expired;

	return (
		<View className={`py-1 mb-1`}>
			<View>
				{status.poll.options.map((option, index) => (
					<PollVotingOption
						key={index}
						poll={status.poll}
						title={option.title}
						votesCount={option.votes_count}
						isSelected={selectedIndices.has(index)}
						optionIndex={index}
						handleOptionSelect={() => {
							if (!isFromNoti) handleOptionSelect(index);
						}}
						showResults={showResults || checkResults}
						isReposting={isReposting}
					/>
				))}
			</View>
			{!isFromNoti && (
				<>
					<PollVotingControls
						{...{
							onToggleCheckResults,
							handleVote,
							showResults,
							isPending,
							checkResults,
						}}
						canVote={selectedIndices.size > 0}
					/>
					<PollVotingFooter
						votesCount={status.poll.votes_count}
						votersCount={status.poll.voters_count}
						isMultiple={status.poll.multiple}
						expired={expired}
						expiresAt={status.poll.expires_at}
						isFromNoti={isFromNoti}
						showResult={showResults || checkResults}
						isRefreshing={isFetching}
						onRefresh={handlePollRefresh}
					/>
				</>
			)}
		</View>
	);
};

export default PollVotingStatus;
