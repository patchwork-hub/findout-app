import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import EventActionButton from '@/components/molecules/calender/EventActionButton';

type EventActionGroupProps = {
	onRegister: () => void;
	onAddToCalendar: () => void;
	canRegister: boolean;
	canAddToCalendar: boolean;
	titleColor: string;
	outlineBorderColor: string;
	containerStyle?: StyleProp<ViewStyle>;
};

const EventActionGroup = ({
	onRegister,
	onAddToCalendar,
	canRegister,
	canAddToCalendar,
	titleColor,
	outlineBorderColor,
	containerStyle,
}: EventActionGroupProps) => (
	<View style={containerStyle}>
		<EventActionButton
			label="Register"
			containerStyle={styles.primaryBtn}
			onPress={onRegister}
			disabled={!canRegister}
		/>

		<EventActionButton
			label="Add to Calendar"
			variant="outline"
			borderColor={outlineBorderColor}
			textColor={titleColor}
			containerStyle={styles.outlineBtn}
			onPress={onAddToCalendar}
			disabled={!canAddToCalendar}
		/>
	</View>
);

const styles = {
	primaryBtn: {
		borderRadius: 8,
		paddingVertical: 14,
		marginBottom: 10,
	} satisfies ViewStyle,
	outlineBtn: {
		borderRadius: 8,
		paddingVertical: 14,
	} satisfies ViewStyle,
};

export default EventActionGroup;
