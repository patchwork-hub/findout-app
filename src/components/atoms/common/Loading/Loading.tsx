import { ActivityIndicator } from 'react-native';
import customColor from '@/util/constant/color';

const Loading = ({ isDark }: { isDark?: boolean }) => {
	return (
		<>
			<ActivityIndicator
				size="small"
				color={
					isDark
						? customColor['patchwork-soft-primary']
						: customColor['patchwork-primary']
				}
			/>
		</>
	);
};

export default Loading;
