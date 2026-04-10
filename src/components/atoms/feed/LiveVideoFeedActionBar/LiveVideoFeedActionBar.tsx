import React from 'react';
import { View, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
	faHeart as faHeartRegular,
	faComment as faCommentRegular,
} from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { formatNumber } from '@/util/helper/helper';
import customColor from '@/util/constant/color';
import { cn } from '@/util/helper/twutil';
import { WPShareIcon } from '@/util/svg/icon.status_actions';

interface ActionButtonsProps {
	onLike?: () => void;
	onLikeCountPress?: () => void;
	onComment?: () => void;
	onShare?: () => void;
	onMore?: () => void;
	color?: string;
	likeCount?: number;
	commentCount?: number;
	isLiked?: boolean;
}

export const LiveVideoFeedActionBar: React.FC<ActionButtonsProps> = ({
	onLike,
	onLikeCountPress,
	onComment,
	onShare,
	onMore,
	color = 'white',
	likeCount = 0,
	commentCount = 0,
	isLiked = false,
}) => {
	return (
		<View className="flex-row justify-between px-4 py-3 items-center mb-2">
			<View className="flex-row gap-4">
				<View className="items-center flex-row">
					<Pressable onPress={onLike} className="p-1 active:opacity-80">
						<FontAwesomeIcon
							icon={isLiked ? faHeartSolid : faHeartRegular}
							size={24}
							color={isLiked ? customColor['patchwork-primary'] : color}
						/>
					</Pressable>
					{likeCount > 0 && (
						<Pressable
							onPress={onLikeCountPress}
							className="active:opacity-80 py-1 pl-0.5 pr-2"
						>
							<ThemeText
								style={{ color }}
								className="text-xs font-Inter_Regular"
							>
								{formatNumber(likeCount)}
							</ThemeText>
						</Pressable>
					)}
				</View>
				<Pressable
					onPress={onComment}
					className="items-center flex-row active:opacity-80 mr-2"
				>
					<View className="p-1">
						<FontAwesomeIcon icon={faCommentRegular} size={24} color={color} />
					</View>
					{commentCount > 0 && (
						<ThemeText
							style={{ color }}
							className="text-xs font-Inter_Regular ml-0.5"
						>
							{formatNumber(commentCount)}
						</ThemeText>
					)}
				</Pressable>

				<Pressable
					className={cn('flex flex-row items-center active:opacity-80 mb-1 ')}
					hitSlop={{ top: 10, bottom: 10, left: 3, right: 10 }}
					onPress={onShare}
				>
					<WPShareIcon stroke={color} width={26} height={26} strokeWidth={35} />
				</Pressable>
			</View>
		</View>
	);
};
