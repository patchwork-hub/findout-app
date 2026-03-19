import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import { useColorScheme } from 'nativewind';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
	Modal,
	StyleSheet,
	View,
	Dimensions,
	TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ThemeModalprops = {
	isFlex?: boolean;
	openThemeModal: boolean;
	onCloseThemeModal?: () => void;
	children: React.ReactElement;
	parentPaddingEnabled?: boolean;
	containerStyle?: StyleProp<ViewStyle>;
	modalPositionStyle?: StyleProp<ViewStyle>;
	hasNotch?: boolean;
};

const device = Dimensions.get('window');

const ThemeModal = ({
	isFlex = false,
	openThemeModal,
	onCloseThemeModal,
	children,
	containerStyle,
	modalPositionStyle,
	parentPaddingEnabled = true,
	hasNotch = true,
}: ThemeModalprops) => {
	const color = useAppropiateColorHash(
		'patchwork-dark-100',
		'patchwork-light-900',
	);
	const { colorScheme } = useColorScheme();
	const insets = useSafeAreaInsets();

	const modalViewParentContainer = () => {
		if (isFlex) {
			return {
				paddingTop: device.height - (device.height - (insets.top + 55)),
			};
		}
		return {};
	};

	return (
		<Modal
			animationType="fade"
			transparent
			visible={openThemeModal}
			onRequestClose={onCloseThemeModal}
			statusBarTranslucent
			navigationBarTranslucent
		>
			<View
				style={[
					styles.modalView,
					{
						justifyContent: 'flex-end',
						height: 190,
						...modalViewParentContainer(),
					},
					modalPositionStyle,
				]}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={onCloseThemeModal}
					style={[
						styles.overlay,
						{
							backgroundColor: colorScheme === 'dark' ? '#0009' : '#0003',
						},
					]}
				/>
				<View
					style={[
						styles.contentContainer,
						{
							...(isFlex && { flex: 1 }),
							backgroundColor: color,
							paddingHorizontal: parentPaddingEnabled ? 16 : 0,
							paddingBottom: insets.bottom,
						},
						containerStyle,
					]}
				>
					{hasNotch && (
						<TouchableOpacity
							style={styles.modalHandlerNotch}
							activeOpacity={0.7}
						/>
					)}
					{children}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalView: {
		flex: 1,
	},
	overlay: {
		flex: 1,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
	},
	contentContainer: {
		justifyContent: 'flex-end',
		borderRadius: 12,
		paddingTop: 16,
	},
	modalHandlerNotch: {
		backgroundColor: '#DCE0EB',
		height: 5,
		width: 60,
		borderRadius: 80,
		position: 'absolute',
		top: 6,
		alignSelf: 'center',
	},
});
export default ThemeModal;
