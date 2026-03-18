import React from 'react';
import { Route } from 'react-native-tab-view';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';

type NotiTabBarItemLabelProps = {
	route: Route;
	focused: boolean;
};
const NotiTabBarItemLabel = ({ route, focused }: NotiTabBarItemLabelProps) => {
	return (
		<ThemeText
			className={`text-sm font-NewsCycle_Bold ${
				focused
					? 'text-patchwork-primary dark:text-patchwork-soft-primary'
					: 'text-slate-400 dark:text-patchwork-grey-100'
			}`}
		>
			{route.title}
		</ThemeText>
	);
};

export default NotiTabBarItemLabel;
