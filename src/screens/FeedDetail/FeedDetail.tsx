import BackButton from '@/components/atoms/common/BackButton/BackButton';
import Header from '@/components/atoms/common/Header/Header';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import { HomeStackScreenProps } from '@/types/navigation';
import {
	Image,
	Keyboard,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useFeedRepliesQuery } from '@/hooks/queries/feed.queries';
import { useSelectedDomain } from '@/store/feed/activeDomain';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import { useEffect, useMemo, useRef, useState } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
	BottomBarHeight,
	useGradualAnimation,
} from '@/hooks/custom/useGradualAnimation';
import ReplyActionBar from '@/components/molecules/compose/ReplyActionBar/ReplyActionBar';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import FeedReplyTextInput from '@/components/atoms/compose/FeedReplyTextInput/FeedReplyTextInput';
import useFeedItemResolver from '@/hooks/custom/useFeedItemResolver';
import { ComposeStatusProvider } from '@/context/composeStatusContext/composeStatus.context';
import { LinkCard } from '@/components/atoms/compose/LinkCard/LinkCard';
import ImageCard from '@/components/atoms/compose/ImageCard/ImageCard';
import UserSuggestionReply from '@/components/atoms/compose/UserSuggestionReply/UserSuggestionReply';
import { useStatusReplyStore } from '@/store/compose/statusReply/statusReplyStore';
import _ from 'lodash';
import ReplyPollForm from '@/components/organisms/compose/ReplyPollForm/ReplyPollForm';
import StatusWrapper from '@/components/organisms/feed/StatusWrapper/StatusWrapper';
import { useActiveFeedStore } from '@/store/feed/activeFeed';
import { RemoveCrossIcon } from '@/util/svg/icon.status_actions';
import { useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'nativewind';
import { cn } from '@/util/helper/twutil';
import { useTranslation } from 'react-i18next';
import { ChevornCollapse, ChevronExpand } from '@/util/svg/icon.common';

const FeedDetail = ({
	navigation,
	route,
}: HomeStackScreenProps<'FeedDetail'>) => {
	const domain_name = useSelectedDomain();

	const { id, isMainChannel, openKeyboardAtMount } = route.params;
	const { height, progress } = useGradualAnimation();
	const feedDetail = useFeedItemResolver(id);
	const unrollThread = !!feedDetail?.in_reply_to_id;

	const inputRef = useRef<TextInput>(null);
	const { currentFocusStatus } = useStatusReplyStore();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { extraPayload } = useActiveFeedStore();

	const listRef = useRef<FlashListRef<Patchwork.Status>>(null);
	const [showAncenstor, setShowAncenstor] = useState(unrollThread || false);
	const tabBarHeight = useRef(BottomBarHeight);
	const isFocused = useIsFocused();
	const { colorScheme } = useColorScheme();
	const { t } = useTranslation();
	const [listReady, setListReady] = useState(false);

	const inputBarActiveBgColor = useAppropiateColorHash(
		'patchwork-dark-900',
		'patchwork-light-900',
	);
	const inputBarInactiveBgColor = useAppropiateColorHash(
		'patchwork-dark-900',
		'patchwork-light-900',
	);

	try {
		const actualBarHeight = useBottomTabBarHeight();
		if (actualBarHeight !== tabBarHeight.current) {
			tabBarHeight.current = actualBarHeight;
		}
	} catch (error) {
		if (tabBarHeight.current !== 0) {
			tabBarHeight.current = 0;
		}
	}

	useEffect(() => {
		if (isFocused) {
			if (statusReplies) {
				refetchReplies();
			}
		}
	}, [isFocused]);

	const virtualKeyboardContainerStyle = useAnimatedStyle(() => {
		return {
			height:
				height.value > tabBarHeight.current
					? height.value - tabBarHeight.current
					: 0,
		};
	});

	const replyActionBarStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		height: progress.value < 0.5 ? 0 : 'auto',
	}));

	const inputBarBgColorStyle = useAnimatedStyle(() => ({
		backgroundColor:
			progress.value > 0.5 ? inputBarActiveBgColor : inputBarInactiveBgColor,
	}));

	const {
		data: statusReplies,
		isLoading: isLoadingReplies,
		refetch: refetchReplies,
	} = useFeedRepliesQuery({
		domain_name: isMainChannel ? process.env.API_URL! : domain_name,
		id,
	});

	useEffect(() => {
		if (statusReplies) {
			setTimeout(() => {
				setListReady(true);
			}, 100);
		}
	}, [statusReplies]);

	const isNestedNodeInclude = useMemo(() => {
		return (
			statusReplies &&
			statusReplies?.descendants?.some(item => {
				return item?.in_reply_to_id && item?.in_reply_to_id !== feedDetail?.id;
			})
		);
	}, [statusReplies]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		refetchReplies();
		_.delay(() => setIsRefreshing(false), 1500);
	};

	const combinedData = useMemo(() => {
		if (!feedDetail || !statusReplies) return [];
		return [
			...(statusReplies?.ancestors || []),
			feedDetail,
			...(statusReplies?.descendants || []),
		];
	}, [statusReplies, feedDetail]);

	return (
		<SafeScreen>
			<ComposeStatusProvider type={'reply'}>
				{!!feedDetail && (
					<View className="flex-1">
						<Header
							title={t('screen.post')}
							leftCustomComponent={<BackButton />}
						/>

						<View className="flex-1">
							{statusReplies && (
								<View style={{ flex: 1, opacity: listReady ? 1 : 0 }}>
									<FlashList
										data={combinedData}
										ref={listRef}
										initialScrollIndex={
											unrollThread ? statusReplies?.ancestors?.length || 0 : 0
										}
										renderItem={({ item, index }) => {
											const nextItem = combinedData[index + 1];
											const ancenstorCount =
												statusReplies?.ancestors?.length || 0;
											const statusType =
												index == ancenstorCount ? 'feedDetail' : 'reply';
											if (index == ancenstorCount) {
												return (
													<StatusWrapper
														status={item as Patchwork.Status}
														currentPage="FeedDetail"
														statusType="feedDetail"
														comeFrom={
															extraPayload?.comeFrom == 'hashtag'
																? 'hashtag'
																: extraPayload?.comeFrom ==
																  'trendingStatusTimeline'
																? 'trendingStatusTimeline'
																: extraPayload?.comeFrom == 'noti'
																? 'noti'
																: 'other'
														}
														extraPayload={extraPayload?.carriedPayload}
													/>
												);
											}
											if (index < ancenstorCount) {
												return (
													<View>
														{showAncenstor && (
															<StatusWrapper
																status={item as Patchwork.Status}
																currentPage="FeedDetail"
																statusType="reply"
																feedDetailId={feedDetail.id}
																nextStatus={undefined}
																isNestedNodeInclude={false}
																comeFrom={
																	extraPayload?.comeFrom == 'hashtag'
																		? 'hashtag'
																		: extraPayload?.comeFrom ==
																		  'trendingStatusTimeline'
																		? 'trendingStatusTimeline'
																		: extraPayload?.comeFrom == 'noti'
																		? 'noti'
																		: 'other'
																}
																isAncenstorNode={true}
																extraPayload={extraPayload?.carriedPayload}
															/>
														)}
													</View>
												);
											}
											return (
												<StatusWrapper
													status={item}
													currentPage="FeedDetail"
													statusType="reply"
													feedDetailId={feedDetail.id}
													nextStatus={nextItem}
													isNestedNodeInclude={isNestedNodeInclude}
													comeFrom={
														extraPayload?.comeFrom == 'hashtag'
															? 'hashtag'
															: extraPayload?.comeFrom ==
															  'trendingStatusTimeline'
															? 'trendingStatusTimeline'
															: extraPayload?.comeFrom == 'noti'
															? 'noti'
															: 'other'
													}
													extraPayload={extraPayload?.carriedPayload}
												/>
											);
										}}
										keyExtractor={item => item.id.toString()}
										showsVerticalScrollIndicator={false}
										refreshControl={
											<RefreshControl
												refreshing={isRefreshing}
												tintColor={colorScheme == 'dark' ? 'white' : 'black'}
												onRefresh={handleRefresh}
											/>
										}
										ListHeaderComponent={() => {
											return (
												<View>
													{statusReplies &&
														statusReplies.ancestors.length > 0 && (
															<View className="flex-row items-end justify-end mb-6">
																<Pressable
																	className={cn(
																		`items-end mr-2 z-50`,
																		feedDetail?.visibility == 'direct'
																			? '-mb-[14]'
																			: '-mb-5',
																	)}
																	onPress={() => {
																		setShowAncenstor(!showAncenstor);
																	}}
																	hitSlop={{
																		top: 20,
																		bottom: 20,
																		left: 20,
																		right: 20,
																	}}
																>
																	{showAncenstor ? (
																		<View className="p-1 rounded-full mr-1  bg-patchwork-primary/5 dark:bg-bg-patchwork-primary-dark/20">
																			{/* <Image
																				source={require('../../../assets/images/closeThread.png')}
																				className="w-[25] h-[25] rounded-full  "
															/> */}
																			<ChevornCollapse
																				fill={
																					colorScheme == 'dark'
																						? 'white'
																						: 'black'
																				}
																			/>
																		</View>
																	) : (
																		<View className="p-1 rounded-full mr-1  bg-patchwork-primary/5 dark:bg-bg-patchwork-primary-dark/20">
																			{/* <Image
																				source={require('../../../assets/images/openThread.png')}
																				className="w-[25] h-[25] rounded-full  "
															/> */}
																			<ChevronExpand
																				fill={
																					colorScheme == 'dark'
																						? 'white'
																						: 'black'
																				}
																			/>
																		</View>
																	)}
																</Pressable>
															</View>
														)}
												</View>
											);
										}}
										ListHeaderComponentStyle={{ zIndex: 100 }}
									/>
								</View>
							)}
							{(!statusReplies || !listReady) && (
								<View
									style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
									className="bg-white dark:bg-patchwork-dark-100"
								>
									<ScrollView
										refreshControl={
											<RefreshControl
												refreshing={isRefreshing}
												tintColor={colorScheme == 'dark' ? 'white' : 'black'}
												onRefresh={handleRefresh}
											/>
										}
									>
										<StatusWrapper
											status={feedDetail as Patchwork.Status}
											currentPage="FeedDetail"
											statusType="feedDetail"
											comeFrom={
												extraPayload?.comeFrom == 'hashtag'
													? 'hashtag'
													: extraPayload?.comeFrom == 'trendingStatusTimeline'
													? 'trendingStatusTimeline'
													: extraPayload?.comeFrom == 'noti'
													? 'noti'
													: 'other'
											}
											extraPayload={extraPayload?.carriedPayload}
										/>
										{(isLoadingReplies || !listReady) && (
											<View className="items-center mt-10">
												<Flow
													size={25}
													color={
														colorScheme === 'dark'
															? customColor['patchwork-primary-dark']
															: customColor['patchwork-primary']
													}
												/>
											</View>
										)}
									</ScrollView>
								</View>
							)}
						</View>
						<Animated.View
							className={'p-2 shadow-lg dark:shadow-none'}
							style={inputBarBgColorStyle}
						>
							<Animated.View
								className={'flex-row flex-wrap'}
								style={replyActionBarStyle}
							>
								<ThemeText
									size={'xs_12'}
									className="mb-2 ml-1 normal-case opacity-80"
								>
									Replying to ▸
								</ThemeText>
								<ThemeText
									size={'xs_12'}
									variant="textSecondary"
									className="mb-2 ml-1 text-patchwork-primary dark:text-patchwork-primary-dark"
								>
									@{currentFocusStatus?.account?.acct}
								</ThemeText>
								<View className="absolute right-0">
									<Pressable
										className="active:opacity-80"
										onPress={() => Keyboard.dismiss()}
									>
										<RemoveCrossIcon />
									</Pressable>
								</View>
							</Animated.View>
							<ScrollView
								style={{ maxHeight: 320 }}
								keyboardShouldPersistTaps="handled"
								nestedScrollEnabled={true}
							>
								<Animated.View style={replyActionBarStyle} className="mt-[2]">
									<ReplyPollForm />
									<LinkCard composeType="reply" />
									<ImageCard composeType="reply" />
									<UserSuggestionReply />
								</Animated.View>
								<FeedReplyTextInput
									username={feedDetail.account.username}
									progress={progress}
									autoFocus={!!openKeyboardAtMount}
									feedDetailStatus={feedDetail}
								/>
							</ScrollView>
							<Animated.View style={replyActionBarStyle}>
								<ReplyActionBar
									feedDetailStatus={feedDetail}
									inputRef={inputRef}
									feedDetailId={feedDetail.id}
								/>
							</Animated.View>
						</Animated.View>
						<Animated.View style={virtualKeyboardContainerStyle} />
					</View>
				)}
			</ComposeStatusProvider>
		</SafeScreen>
	);
};

export default FeedDetail;
