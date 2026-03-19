import { View, Pressable, Dimensions } from 'react-native';
import React, { useMemo, useState } from 'react';
import { PlayIcon } from '@/util/svg/icon.common';
import Video, { ResizeMode } from 'react-native-video';
import {
	CompositeNavigationProp,
	useNavigation,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList, RootStackParamList } from '@/types/navigation';
import Image from '../../common/Image/Image';
import { getBorderRadius, getGridStructure } from '@/util/helper/helper';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { AltTextModal } from '../AltTextModal/AltTextModal';
import { cn } from '@/util/helper/twutil';
import { isTablet } from '@/util/helper/isTablet';
import { updateSensitiveImageCache } from '@/util/cache/feed/feedCache';
import { Blurhash } from 'react-native-blurhash';
import SensitiveMedia from '../SensitiveMedia/SesitiveMedia';
import { styled } from 'nativewind';

type Props = {
	status: Patchwork.Status;
	isFromQuoteCompose?: boolean;
};

type StatusVideoNavigationProp = CompositeNavigationProp<
	StackNavigationProp<HomeStackParamList>,
	StackNavigationProp<RootStackParamList>
>;

const StyledVideo = styled(Video);

const StatusVideo = ({ status, isFromQuoteCompose = false }: Props) => {
	const imageCount = status.media_attachments.length;
	const [leftCol, rightCol] = getGridStructure(imageCount);
	const [showAltText, setShowAltText] = useState(false);
	const navigation = useNavigation<StatusVideoNavigationProp>();
	const screenWidth = Dimensions.get('window').width;
	const maxHeight = 480;

	const imageSensitiveState = status?.media_attachments?.reduce(
		(state, attachment) => {
			state[attachment.id] = attachment.sensitive!;
			return state;
		},
		{} as Record<string, boolean>,
	);

	const onForceViewSensitiveMedia = (attachment: Patchwork.Attachment) => {
		updateSensitiveImageCache(status.id, attachment);
	};

	const getVideoHeight = (index: number) => {
		const colCount = imageCount > 1 ? 2 : 1;
		const horizontalPadding = 16;
		const colWidth =
			(screenWidth - horizontalPadding * (colCount + 1)) / colCount;

		const original = status.media_attachments[index]?.meta?.original;
		if (original && original.width && original.height) {
			const height = (original.height / original.width) * colWidth;
			return height > maxHeight ? maxHeight : height;
		}
		return isTablet ? 400 : 232;
	};

	const getContainerHeight = () => {
		const heights = status.media_attachments.map((_, index) =>
			getVideoHeight(index),
		);
		return Math.max(...heights);
	};

	const containerHeight = useMemo(
		() => getContainerHeight(),
		[status.media_attachments],
	);

	const renderSensitiveImage = ({ index }: { index: number }) => {
		const height = getVideoHeight(index);
		const isPortrait = status.media_attachments[index]?.meta?.original
			? status.media_attachments[index].meta.original.width <
			  status.media_attachments[index].meta.original.height
			: false;

		return (
			<View
				className="flex-1 justify-center overflow-hidden rounded-md"
				style={{ height }}
			>
				<Blurhash
					blurhash={status.media_attachments[index]?.blurhash as string}
					style={{ height }}
				/>
				<SensitiveMedia
					mediaType="video"
					onViewSensitiveContent={() =>
						onForceViewSensitiveMedia(status.media_attachments[index])
					}
				/>
			</View>
		);
	};

	return (
		<View
			className={`flex-row mt-1 mb-2 w-full`}
			style={{ height: containerHeight }}
		>
			<View className="flex-1">
				{leftCol?.map((index, i) => {
					const borderRadius =
						imageCount > 1
							? getBorderRadius('left', i, leftCol.length)
							: 'rounded-xl';

					const isSensitive =
						status?.sensitive &&
						!imageSensitiveState[status.media_attachments[index]?.id];
					const height = getVideoHeight(index);
					return (
						<View
							key={index}
							className={`flex-1 ${
								i < leftCol.length - 1 ? 'mb-0.5' : 'mr-0'
							} overflow-hidden`}
							style={{ height }}
						>
							{status.media_attachments[index].type == 'gifv' ? (
								<Pressable
									disabled={isFromQuoteCompose}
									onPress={() => {
										navigation.navigate('GifPlayer', {
											gifUrl: status.media_attachments[index].url,
											status: status,
										});
									}}
									className="flex-1 h-full w-full"
								>
									<StyledVideo
										paused={false}
										controls={false}
										repeat
										resizeMode={ResizeMode.COVER}
										source={{ uri: status.media_attachments[index].url }}
										className={cn(
											`w-full h-full bg-slate-200 dark:bg-white overflow-hidden border border-slate-50 dark:border-slate-900`,
											borderRadius,
										)}
									/>

									{status.media_attachments[index].description && (
										<Pressable
											onPress={() => setShowAltText(!showAltText)}
											className="bg-[#36466366] border border-patchwork-grey-50 px-1.5 py-0.5 flex-row items-center rounded-lg justify-center absolute left-2 bottom-2 active:opacity-40"
										>
											<ThemeText size={'xs_12'} className="ml-1 text-white">
												ALT
											</ThemeText>
										</Pressable>
									)}
									{showAltText && (
										<AltTextModal
											onClose={() => setShowAltText(false)}
											altText={
												status.media_attachments[index].description || ''
											}
										/>
									)}
								</Pressable>
							) : isSensitive ? (
								renderSensitiveImage({ index: index })
							) : (
								<Pressable
									disabled={isFromQuoteCompose}
									onPress={() => {
										navigation.navigate('VideoPlayer', { status: status });
									}}
									className="flex-1 relative h-full w-full"
									style={{ height }}
								>
									<Image
										uri={status.media_attachments[index].preview_url}
										className={`w-full h-full bg-slate-100 ${borderRadius}`}
										resizeMode="cover"
									/>
									<View className="flex top-0 left-0 right-0 bottom-0 items-center justify-center absolute inset-0">
										<View className="bg-[#0007] rounded-full p-3">
											<PlayIcon width={35} height={35} fill="#fff" />
										</View>
									</View>
									{status.media_attachments[index].description && (
										<Pressable
											onPress={() => {
												setShowAltText(!showAltText);
											}}
											className="bg-[#36466366] border border-patchwork-grey-50 px-1.5 py-0.5 flex-row items-center rounded-lg justify-center absolute left-2 bottom-2 active:opacity-40"
										>
											<ThemeText size={'xs_12'} className="ml-1 text-white">
												ALT
											</ThemeText>
										</Pressable>
									)}
									{showAltText && (
										<AltTextModal
											onClose={() => {
												setShowAltText(false);
											}}
											altText={
												status.media_attachments[index].description || ''
											}
										/>
									)}
								</Pressable>
							)}
						</View>
					);
				})}
			</View>
			{imageCount > 1 && (
				<View className="flex-1">
					{rightCol?.map((index, i) => {
						const borderRadius = getBorderRadius('right', i, rightCol.length);
						const isSensitive =
							status?.sensitive &&
							!imageSensitiveState[status.media_attachments[index]?.id];
						const height = getVideoHeight(index);
						return (
							<View
								key={index}
								className={`flex-1 ${
									i < rightCol.length - 1 ? 'mb-1 ml-1' : 'ml-1'
								} overflow-hidden`}
								style={{ height }}
							>
								{status.media_attachments[index].type == 'gifv' ? (
									<>
										<StyledVideo
											paused={false}
											controls={false}
											repeat
											resizeMode={ResizeMode.COVER}
											source={{ uri: status.media_attachments[index].url }}
											className={`w-full h-full bg-white border border-slate-50 dark:border-slate-900 overflow-hidden ${borderRadius}`}
										/>
										{status.media_attachments[index].description && (
											<Pressable
												onPress={() => {
													setShowAltText(!showAltText);
												}}
												className="bg-[#36466366] border border-patchwork-grey-50 px-1.5 py-0.5 flex-row items-center rounded-lg justify-center absolute left-2 bottom-2 active:opacity-40"
											>
												<ThemeText size={'xs_12'} className="ml-1">
													ALT
												</ThemeText>
											</Pressable>
										)}
										{showAltText && (
											<AltTextModal
												onClose={() => {
													setShowAltText(false);
												}}
												altText={
													status.media_attachments[index].description || ''
												}
											/>
										)}
									</>
								) : isSensitive ? (
									renderSensitiveImage({ index: index })
								) : (
									<Pressable
										disabled={isFromQuoteCompose}
										onPress={() => {
											navigation.navigate('VideoPlayer', { status: status });
										}}
										className="flex-1 relative w-full"
										style={{ height }}
									>
										<Image
											uri={status.media_attachments[index].preview_url}
											className={`w-full h-full bg-slate-100 overflow-hidden ${borderRadius}`}
											resizeMode="cover"
										/>
										<View className="flex top-0 left-0 right-0 bottom-0 items-center justify-center absolute inset-0">
											<View className="bg-[#0007] rounded-full p-3">
												<PlayIcon width={35} height={35} fill="#fff" />
											</View>
										</View>
										{status.media_attachments[index].description && (
											<Pressable
												onPress={() => {
													setShowAltText(!showAltText);
												}}
												className="bg-[#36466366] border border-patchwork-grey-50 px-1.5 py-0.5 flex-row items-center rounded-lg justify-center absolute left-2 bottom-2 active:opacity-40"
											>
												<ThemeText size={'xs_12'} className="ml-1 text-white">
													ALT
												</ThemeText>
											</Pressable>
										)}
										{showAltText && (
											<AltTextModal
												onClose={() => {
													setShowAltText(false);
												}}
												altText={
													status.media_attachments[index].description || ''
												}
											/>
										)}
									</Pressable>
								)}
							</View>
						);
					})}
				</View>
			)}
		</View>
	);
};

export default StatusVideo;
