import CalendarScreen from '@/screens/Calendar/CalendarScreen';
import EventDetail from '@/screens/Calendar/EventDetail';
import OrganiserDetail from '@/screens/Calendar/OrganiserDetail';
import type { CalendarStackParamList } from '@/types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStack() {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="CalendarHome" component={CalendarScreen} />
			<Stack.Screen name="CalendarEventDetail" component={EventDetail} />
			<Stack.Screen name="CalendarOrganiserDetail" component={OrganiserDetail} />
		</Stack.Navigator>
	);
}
