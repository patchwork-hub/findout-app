import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import Share from 'react-native-share';
import { handleError } from '@/util/helper/helper';
import { appIcon } from '@/util/constant/appIcon';
import { useColorScheme } from 'nativewind';
import { cn } from '@/util/helper/twutil';
import { AppIcons } from '@/util/icons/icon.common';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import customColor from '@/util/constant/color';
import { FALLBACK_PREVIEW_IMAGE_URL } from '@/util/constant';
import { StatusCopyIcon } from '@/util/svg/icon.status_actions';

type Props = {
	status: Patchwork.Status;
	isFromNoti?: boolean;
};

const StatusShareMenu: React.FC<Props> = ({ status }: Props) => {
	const [isShareVisible, setShareVisible] = useState(false);
	const toggleMenu = () => setShareVisible(!isShareVisible);
	const { colorScheme } = useColorScheme();

	const SHARE_LINK_URL = status.url;

	const onSocialShare = async () => {
		toggleMenu();

		const options: any = Platform.select({
			ios: {
				activityItemSources: [
					{
						placeholderItem: {
							type: 'url',
							content: appIcon,
						},
						item: {
							default: {
								type: 'url',
								content: SHARE_LINK_URL,
							},
						},
						linkMetadata: {
							title: 'Find Out Media',
							icon: FALLBACK_PREVIEW_IMAGE_URL,
						},
					},
				],
			},
			default: {
				title: 'Find Out Media',
				subject: 'Find Out Media',
				message: SHARE_LINK_URL,
			},
		});

		try {
			await Share.open(options);
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Pressable
			className={cn(
				'flex flex-row items-center gap-1 active:opacity-80 mb-0.5',
			)}
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			onPress={onSocialShare}
		>
			<StatusCopyIcon
				stroke={
					colorScheme == 'dark'
						? customColor['patchwork-grey-400']
						: customColor['patchwork-grey-100']
				}
			/>
		</Pressable>
	);
};

export default StatusShareMenu;
