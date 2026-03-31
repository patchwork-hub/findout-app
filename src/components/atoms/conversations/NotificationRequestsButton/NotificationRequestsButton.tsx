import { cn } from '@/util/helper/twutil';
import { MessageRequestsIcon } from '@/util/svg/icon.conversations';
import { useNavigation } from '@react-navigation/native';
import { Pressable, View } from 'react-native';
import { useColorScheme } from 'nativewind';

type Props = {
	customOnPress?: () => void;
	extraClass?: string;
	isThereData?: boolean;
};
const NofiReqButton = ({
	customOnPress = undefined,
	extraClass,
	isThereData,
}: Props) => {
	const { colorScheme } = useColorScheme();
	const navigation = useNavigation();

	return (
		<Pressable
			onPress={() => (customOnPress ? customOnPress() : navigation.goBack())}
			className={cn(
				'w-10 h-10 items-center justify-center rounded-full border-[1px] border-patchwork-grey-100',
				isThereData ? 'bg-patchwork-primary border-none' : 'bg-transparent',
				extraClass,
			)}
		>
			<MessageRequestsIcon colorScheme={isThereData ? 'dark' : colorScheme} />
		</Pressable>
	);
};

export default NofiReqButton;
