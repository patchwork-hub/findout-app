import FollowMenuOption from '../FollowMenuOption/FollowMenuOption';
import MuteMenuOption from '../MuteMenuOption/MuteMenuOption';
import {
	useCheckRelationships,
	useSpecificServerProfile,
} from '@/hooks/queries/profile.queries';
import ReportMenuOption from '../ReportMenuOption/ReportMenuOption';
import BlockMenuOption from '../BlockMenuOption/BlockMenuOption';
import RevokeQuoteMenuOption from '../RevokeQuoteMenuOption/RevokeQuoteMenuOption';
import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth/authStore';

const MenuOptionsForOtherUser = ({
	status,
	hideMenu,
	extraPayload,
	statusType,
	goBackToPreviousPage,
	handleGoBack,
}: {
	status: Patchwork.Status;
	hideMenu: () => void;
	extraPayload: Record<string, any> | undefined;
	statusType: string;
	goBackToPreviousPage: boolean;
	handleGoBack: () => void;
}) => {
	const { userInfo } = useAuthStore();

	const isAuthor = useMemo(() => {
		return userInfo?.id === status.quote?.quoted_status?.account.id;
	}, [status, userInfo?.id]);

	const { data: specificServerProfile } = useSpecificServerProfile({
		q: status.account.url as string,
		options: {
			enabled: !!status.account.url,
		},
	});

	const { data: relationships } = useCheckRelationships({
		accountIds: [
			statusType === 'channel-feed'
				? status.account?.id!
				: specificServerProfile?.accounts[0]?.id || status.account.id,
		],
		options: {
			enabled: !!specificServerProfile?.accounts[0]?.id,
		},
	});

	return (
		<>
			<FollowMenuOption
				isLoadingAccId={!specificServerProfile?.accounts[0]?.id}
				accountId={specificServerProfile?.accounts[0]?.id || ''}
				relationships={relationships}
				statusType={statusType}
				status={status}
				goBackToPreviousPage={goBackToPreviousPage}
				handleGoBack={handleGoBack}
			/>
			{isAuthor && (
				<RevokeQuoteMenuOption
					quotedStatusId={status.quote?.quoted_status?.id}
					quotingStatusId={status.id}
				/>
			)}
			<MuteMenuOption
				status={status}
				specifyServerAccId={specificServerProfile?.accounts[0]?.id || ''}
				relationships={relationships}
				hideMenu={hideMenu}
				extraPayload={extraPayload}
				statusType={statusType}
				goBackToPreviousPage={goBackToPreviousPage}
				handleGoBack={handleGoBack}
			/>
			<BlockMenuOption
				status={status}
				specifyServerAccId={specificServerProfile?.accounts[0]?.id || ''}
				relationships={relationships}
				hideMenu={hideMenu}
				extraPayload={extraPayload}
				statusType={statusType}
				goBackToPreviousPage={goBackToPreviousPage}
				handleGoBack={handleGoBack}
			/>
			<ReportMenuOption hideMenu={hideMenu} status={status} />
		</>
	);
};

export default MenuOptionsForOtherUser;
