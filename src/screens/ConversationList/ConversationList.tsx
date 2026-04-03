import React, { useMemo, useState } from 'react';
import {
	ActivityIndicator,
	ListRenderItemInfo,
	Pressable,
	RefreshControl,
	TouchableOpacity,
	View,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import {
	uesReadAllConversations,
	useMarkAsReadMutation,
	useMessageDeleteMutation,
} from '@/hooks/mutations/conversations.mutation';
import {
	useGetAllNotiReq,
	useGetConversationsList,
} from '@/hooks/queries/conversations.queries';
import { useAuthStore } from '@/store/auth/authStore';
import {
	BottomStackParamList,
	ConversationsStackParamList,
} from '@/types/navigation';
import customColor from '@/util/constant/color';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import {
	markAsReadAllConversationsCache,
	markAsReadInConversationCache,
	removeDeletedMsgInConversationCache,
} from '@/util/cache/conversation/conversationCahce';
import ConversationItem from '@/components/molecules/conversations/ConversationItem/ConversationItem';
import { EmptyListComponent } from '@/components/molecules/conversations/EmptyListItem/EmptyListItem';
import { SwipeListView } from 'react-native-swipe-list-view';
import { DeleteIcon } from '@/util/svg/icon.common';
import DeleteModal from '@/components/atoms/conversations/DeleteModal/DeleteModal';
import { delay } from 'lodash';
import NofiReqButton from '@/components/atoms/conversations/NotificationRequestsButton/NotificationRequestsButton';
import { isTablet } from '@/util/helper/isTablet';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { Button } from '@/components/atoms/common/Button/Button';
import { DoubleTickIcon } from '@/util/svg/icon.conversations';

type RowMap<T> = { [key: string]: T };

type MessageScreenNavigationProp = CompositeNavigationProp<
	BottomTabNavigationProp<BottomStackParamList, 'Conversations'>,
	StackNavigationProp<ConversationsStackParamList>
>;

const ConversationList = ({
	navigation,
}: {
	navigation: MessageScreenNavigationProp;
}) => {
	const { colorScheme } = useColorScheme();
	const { userInfo } = useAuthStore();
	const [delConf, setDelConf] = useState<{
		visible: boolean;
		id?: string;
		rowMap?: RowMap<any>;
	}>({
		visible: false,
	});
	const [isRefreshing, setRefresh] = useState(false);
	const { t } = useTranslation();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = useGetConversationsList();
	const conversationsList = useMemo(() => data?.pages.flat() || [], [data]);

	const { data: notiReqList, refetch: refetchNotiReq } = useGetAllNotiReq();

	// mutation
	const { mutate: markConversationAsRead } = useMarkAsReadMutation({
		onSuccess: data => markAsReadInConversationCache(data.id),
	});

	const { mutate: deleteMessage } = useMessageDeleteMutation({
		onSuccess: (_, { id }) => {
			removeDeletedMsgInConversationCache(id);
		},
	});

	const { mutate: readAllMutation } = uesReadAllConversations({
		onSuccess(data, variables, context) {
			markAsReadAllConversationsCache();
		},
	});

	const handlePressNewChat = () => navigation.navigate('NewMessage');
	const handleEndReached = () => {
		if (!isFetchingNextPage && hasNextPage) fetchNextPage();
	};

	const closeRow = (rowMap: RowMap<any>, rowKey: string) => {
		if (rowMap && rowMap[rowKey]) rowMap[rowKey].closeRow();
	};
	const deleteRow = (rowMap: RowMap<any>, rowKey: string) => {
		setDelConf({ visible: true, id: rowKey, rowMap });
	};

	const renderListFooter = () =>
		data && isFetchingNextPage ? (
			<ActivityIndicator
				color={
					colorScheme === 'dark'
						? customColor['patchwork-primary-dark']
						: customColor['patchwork-primary']
				}
				size={'large'}
				className="my-5"
			/>
		) : null;

	const renderHiddenItem = (
		rowData: ListRenderItemInfo<Patchwork.Conversations>,
		rowMap: RowMap<any>,
	) => (
		<TouchableOpacity
			className="p-3 rounded-r-md absolute right-2 justify-center items-center h-5/6 w-2/12 bg-patchwork-red-50"
			onPress={() => deleteRow(rowMap, rowData.item.id)}
		>
			<DeleteIcon fill={'white'} />
		</TouchableOpacity>
	);

	return (
		<SafeScreen>
			<Header
				title={t('screen.conversations')}
				leftCustomComponent={
					<View className="flex-row">
						<NofiReqButton
							isThereData={
								notiReqList && notiReqList?.length > 0 ? true : false
							}
							customOnPress={() => navigation.navigate('NotificationRequests')}
						/>
						{conversationsList.length > 0 && (
							<View className="mx-3">
								<Pressable
									onPress={() => readAllMutation({})}
									className={
										'w-10 h-10 items-center justify-center rounded-full border-[1px] border-patchwork-grey-100 active:opacity-75'
									}
								>
									<DoubleTickIcon colorScheme={colorScheme} />
								</Pressable>
							</View>
						)}
					</View>
				}
				rightCustomComponent={
					<Button
						size={'sm'}
						className="rounded-full h-8 m-0 bg-patchwork-primary dark:bg-patchwork-primary-dark"
						onPress={handlePressNewChat}
					>
						<ThemeText size={'xs_12'} className="text-white dark:text-white">
							{t('common.create')}
						</ThemeText>
					</Button>
				}
			/>
			<SwipeListView
				data={conversationsList}
				keyExtractor={item => item.id}
				ListEmptyComponent={
					<EmptyListComponent
						isLoading={isLoading}
						onPress={handlePressNewChat}
					/>
				}
				renderItem={({ item }) => {
					const isOwnConversation = item.accounts[0].acct == userInfo?.acct;

					return (
						<View>
							{!isOwnConversation ? (
								<ConversationItem
									item={item}
									userInfoId={userInfo?.id!}
									onPress={() => {
										if (item.unread) {
											markConversationAsRead({ id: item.id });
										}
										navigation.navigate('ConversationDetail', {
											id: item.last_status?.id,
										});
									}}
								/>
							) : (
								<></>
							)}
						</View>
					);
				}}
				onEndReached={handleEndReached}
				renderHiddenItem={renderHiddenItem}
				ListFooterComponent={renderListFooter}
				rightOpenValue={isTablet ? -150 : -80}
				disableRightSwipe
				previewRowKey={'0'}
				refreshControl={
					<RefreshControl
						className="mt-1"
						refreshing={isRefreshing}
						tintColor={
							colorScheme === 'dark'
								? customColor['patchwork-light-900']
								: customColor['patchwork-dark-100']
						}
						onRefresh={() => {
							setRefresh(true);
							delay(() => setRefresh(false), 1500);
							refetch();
							refetchNotiReq();
						}}
					/>
				}
				previewOpenValue={-40}
				previewOpenDelay={3000}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1 }}
			/>
			<DeleteModal
				visibile={delConf?.visible}
				onPressCancel={() => {
					if (delConf.rowMap && delConf.id) {
						setDelConf({ visible: false });
						closeRow(delConf.rowMap, delConf.id);
					}
				}}
				onPressDelete={() => {
					if (delConf?.id) {
						setDelConf({ visible: false });
						deleteMessage({ id: delConf.id });
					}
				}}
			/>
		</SafeScreen>
	);
};

export default ConversationList;
