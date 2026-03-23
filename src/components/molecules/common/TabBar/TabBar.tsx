import React from 'react';
import useAppropiateColorHash from '@/hooks/custom/useAppropiateColorHash';
import {
	TabBar as RNTabBar,
	TabBarItem,
	TabBarProps,
} from 'react-native-tab-view';
import customColor from '@/util/constant/color';
import { useColorScheme } from 'nativewind';

type Props = TabBarProps<any> & {
	renderLabel?: (props: {
		route: any;
		focused: boolean;
		color: string;
	}) => React.ReactNode;
};

const TabBar = (props: Props) => {
	const { colorScheme } = useColorScheme();
	const { renderLabel, ...rest } = props;

	const backgroundColor = useAppropiateColorHash(
		'patchwork-dark-100',
		'patchwork-light-900',
	);

	const indicatorStyle =
		colorScheme === 'dark'
			? customColor['patchwork-primary-dark']
			: customColor['patchwork-primary'];

	const inactiveColor =
		colorScheme === 'dark' ? customColor['patchwork-grey-100'] : '#94a3b8';

	const activeColor = colorScheme == 'dark' ? '#fff' : '#000';

	return (
		<RNTabBar
			{...rest}
			activeColor={activeColor}
			inactiveColor={inactiveColor}
			style={[
				{
					backgroundColor: backgroundColor,
					elevation: 0,
					marginHorizontal: 16,
				},
				rest.style,
			]}
			indicatorStyle={[
				{ backgroundColor: indicatorStyle },
				props.indicatorStyle,
			]}
			pressOpacity={1}
			pressColor="#82868922"
			renderTabBarItem={
				renderLabel
					? ({ key, ...itemProps }) => (
							<TabBarItem
								key={key}
								{...itemProps}
								label={({ route, focused, color }) =>
									renderLabel({ route, focused, color })
								}
							/>
					  )
					: undefined
			}
		/>
	);
};

export default TabBar;
