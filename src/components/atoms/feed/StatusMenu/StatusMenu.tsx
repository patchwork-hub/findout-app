import { useMemo, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import {
	Menu,
	MenuOption,
	MenuOptions,
	MenuTrigger,
} from 'react-native-popup-menu';
import MenuOptionIcon from './MenuOptionIcon/MenuOptionIcon';
import {
	StatusDeleteOutlineIcon,
	StatusEditOutlineIcon,
	StatusTranslateIcon,
} from '@/util/svg/icon.status_actions';
import customColor from '@/util/constant/color';
import { useAuthStore } from '@/store/auth/authStore';
import { useStatusDeleteMutation } from '@/hooks/mutations/statusActions.mutation';
import Toast from 'react-native-toast-message';
import StatusDeleteModal from '../../common/StatusDeleteModal/StatusDeleteModal';
import { useActiveFeedStore } from '@/store/feed/activeFeed';
import { useNavigation } from '@react-navigation/native';
import { getEditStatusSourceFn } from '@/services/statusActions.service';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import { uniqueId } from 'lodash';
import { useStatusContext } from '@/context/statusItemContext/statusItemContext';
import MenuOptionsForOtherUser from './MenuOptionsForOtherUser/MenuOptionsForOtherUser';
import { queryClient } from '@/App';
import { useTranslateMutation } from '@/hooks/mutations/feed.mutation';
import { Flow } from 'react-native-animated-spinkit';
import { useTranslationLanguageStore } from '@/store/compose/translationLanguage/translationLanguage';
import {
	changeOwnerQuoteStatusCount,
	deleteStatusCache,
	updateStatusReplyCache,
	updateTranslateCache,
} from '@/util/cache/feed/feedCache';
import { useColorScheme } from 'nativewind';
import colors from 'tailwindcss/colors';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { AppIcons } from '@/util/icons/icon.common';

const StatusMenu = ({ status }: { status: Patchwork.Status }) => {
	const { t } = useTranslation();
	const navigation = useNavigation();
	const { domain_name } = useActiveDomainStore();
	const { activeFeed: currentFeed } = useActiveFeedStore();
	const { currentPage, extraPayload, comeFrom, statusType } =
		useStatusContext();
	const { translationLanguageData } = useTranslationLanguageStore();

	const [menuVisible, setMenuVisible] = useState(false);
	const hideMenu = () => setMenuVisible(false);
	const showMenu = () => setMenuVisible(true);
	const goBackToPreviousPage =
		currentPage == 'ProfileOther' ||
		(currentPage == 'FeedDetail' && currentFeed?.id == status.id);
	const { colorScheme } = useColorScheme();
	const { userInfo } = useAuthStore();

	const isAuthor = useMemo(() => {
		return userInfo?.id === status.account.id;
	}, [status, userInfo?.id]);

	const feedReplyQueryKey = [
		'feed-replies',
		{ id: currentFeed?.id, domain_name },
	];

	const [deleteModalVisible, setDeleteModalVisible] = useState(false);

	const onPressShowDeleteModal = () => {
		hideMenu();
		setDeleteModalVisible(prevState => !prevState);
	};

	const { mutate } = useStatusDeleteMutation({
		onMutate: ({ status_id }) => {
			if (goBackToPreviousPage) {
				navigation.goBack();
			}
			deleteStatusCache(status_id);

			if (currentPage == 'FeedDetail' && currentFeed?.id) {
				updateStatusReplyCache(
					status?.in_reply_to_id == currentFeed?.id
						? currentFeed.id
						: status.in_reply_to_id || '',
					'decrease',
				);
			}
			status?.quote?.quoted_status &&
				changeOwnerQuoteStatusCount(status?.quote?.quoted_status, 'decrease');
		},
		onSuccess: () => {
			currentPage == 'FeedDetail' &&
				queryClient.invalidateQueries({ queryKey: feedReplyQueryKey });
		},
		onError(error) {
			Toast.show({
				type: 'errorToast',
				text1: error.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const handleDeleteStatus = () => {
		mutate({ status_id: status.id });
		setDeleteModalVisible(false);
	};

	const onPressEditStatus = async () => {
		try {
			const { text } = await getEditStatusSourceFn({
				status_id: status.id,
			});
			navigation.navigate('Index', {
				screen: 'Compose',
				params: {
					type: 'edit',
					incomingStatus: {
						...status,
						text,
					},
					statusCurrentPage: currentPage,
					extraPayload,
				},
			});
			hideMenu();
		} catch (error: any) {
			Toast.show({
				type: 'errorToast',
				text1: error.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		}
	};

	const { mutate: translationMutate, isPending } = useTranslateMutation({
		onSuccess(data, variables, context) {
			updateTranslateCache(
				status,
				{
					content: data.content,
					statusId: variables.statusId,
				},
				true,
			);
			hideMenu();
		},
		onError(error) {
			Toast.show({
				type: 'errorToast',
				text1: error.message,
				position: 'top',
				topOffset: Platform.OS == 'android' ? 25 : 50,
			});
		},
	});

	const onTranslateStatus = () => {
		translationMutate({ statusId: status.id });
	};

	const shouldShowTranslateButton = useMemo(() => {
		return (
			status.reblog === null &&
			status.language !== 'en' &&
			status.language !== null &&
			translationLanguageData[status.language]?.length > 0 &&
			status.content.length <= 4000
		);
	}, [status, translationLanguageData]);

	return (
		<>
			<Menu opened={menuVisible} onBackdropPress={hideMenu}>
				<MenuTrigger>
					<Pressable
						onPress={showMenu}
						className="p-2 rounded-full aspect-square items-center ml-1.5"
					>
						<FontAwesomeIcon
							icon={AppIcons.ellipsis}
							size={18}
							color={
								colorScheme == 'dark'
									? customColor['patchwork-grey-400']
									: customColor['patchwork-grey-100']
							}
						/>
					</Pressable>
				</MenuTrigger>
				<MenuOptions
					customStyles={{
						optionsContainer: {
							backgroundColor:
								colorScheme == 'dark' ? colors.zinc[900] : colors.white,
							borderRadius: 10,
							shadowOpacity: 0.1,
							elevation: 2,
						},
					}}
				>
					{isAuthor ? (
						<>
							{!status.reblog && (
								<>
									<MenuOption onSelect={onPressEditStatus}>
										<MenuOptionIcon
											icon={
												<StatusEditOutlineIcon
													stroke={
														colorScheme == 'dark'
															? '#fff'
															: customColor['patchwork-grey-100']
													}
												/>
											}
											name={t('timeline.edit')}
										/>
									</MenuOption>
									{/* <Underline className="border-patchwork-grey-400" /> */}
								</>
							)}
							<MenuOption onSelect={onPressShowDeleteModal}>
								<MenuOptionIcon
									icon={
										<StatusDeleteOutlineIcon
											fill={
												colorScheme == 'dark'
													? '#fff'
													: customColor['patchwork-grey-100']
											}
											colorScheme={colorScheme}
										/>
									}
									name={t('timeline.delete')}
								/>
							</MenuOption>
						</>
					) : (
						<>
							<MenuOptionsForOtherUser
								status={status}
								hideMenu={hideMenu}
								extraPayload={extraPayload}
								statusType={statusType}
								goBackToPreviousPage={goBackToPreviousPage}
								handleGoBack={() => navigation.goBack()}
							/>
						</>
					)}
					{shouldShowTranslateButton && (
						<MenuOption onSelect={onTranslateStatus}>
							<MenuOptionIcon
								icon={
									isPending ? (
										<Flow
											size={25}
											color={
												colorScheme == 'dark'
													? customColor['patchwork-light-900']
													: '#000'
											}
											className="ml-1"
										/>
									) : (
										<StatusTranslateIcon colorScheme={colorScheme} />
									)
								}
								name={t('timeline.translate')}
							/>
						</MenuOption>
					)}
				</MenuOptions>
			</Menu>

			<StatusDeleteModal
				openDeleteModal={deleteModalVisible}
				onPressHideDeleteModal={() => setDeleteModalVisible(false)}
				handleDeleteStatus={handleDeleteStatus}
			/>
		</>
	);
};

export default StatusMenu;
