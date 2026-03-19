import { CloseIcon } from '@/util/svg/icon.common';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { ThemeText } from '../../common/ThemeText/ThemeText';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
	altText: string;
	onClose: () => void;
};

export const AltTextModal = ({ altText, onClose }: Props) => {
	const { bottom } = useSafeAreaInsets();
	const { colorScheme } = useColorScheme();
	return (
		<Modal
			visible={true}
			animationType="fade"
			transparent={true}
			onRequestClose={onClose}
			statusBarTranslucent
			navigationBarTranslucent
		>
			<Pressable
				className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 flex items-center justify-center"
				onPress={onClose}
				style={{ paddingBottom: bottom }}
			>
				<View
					className="bg-white/90 p-4 rounded-2xl w-5/6 max-h-[50%] min-h-[12vh]"
					onStartShouldSetResponder={e => {
						e.stopPropagation();
						return false;
					}}
				>
					<Pressable
						onPress={onClose}
						className="z-50 absolute right-1 top-1 p-2 rounded-full"
					>
						<CloseIcon stroke={'#000'} />
					</Pressable>
					<ThemeText
						variant="textBold"
						size="md_16"
						className="text-patchwork-dark-900 text-center mb-3"
					>
						Alt text
					</ThemeText>

					<ScrollView className="max-h-[40vh] px-3">
						<ThemeText className="text-patchwork-dark-100">{altText}</ThemeText>
					</ScrollView>
				</View>
			</Pressable>
		</Modal>
	);
};
