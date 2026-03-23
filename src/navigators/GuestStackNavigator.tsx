import { GuestStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';
import {
	Welcome,
	Login,
	ServerInstance,
	MastodonSignInWebView,
	SignUp,
	SignUpOTP,
} from '@/screens';
import ForgotPassword from '@/screens/ForgotPassword/ForgotPassword';
import ForgotPasswordOTP from '@/screens/ForgotPasswordOTP/ForgotPasswordOTP';
import ChangePassword from '@/screens/ChangePassword/ChangePassword';
import WebViewer from '@/screens/WebViewer/WebViewer';
import AddUserNameScreen from '@/screens/AddUserNameScreen/AddUserNameScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createStackNavigator<GuestStackParamList>();

const Guest = () => {
	return (
		<Stack.Navigator
			initialRouteName={'Welcome'}
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen name="Welcome" component={Welcome} />
			<Stack.Screen name="Login" component={Login} />
			<Stack.Screen name="ForgotPassword" component={ForgotPassword} />
			<Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTP} />
			<Stack.Screen name="ChangePassword" component={ChangePassword} />
			<Stack.Screen name="ServerInstance" component={ServerInstance} />
			<Stack.Screen
				name="MastodonSignInWebView"
				component={MastodonSignInWebView}
			/>
			<Stack.Screen name="WebViewer" component={WebViewer} />
			<Stack.Screen name="SignUp" component={SignUp} />
			<Stack.Screen name="SignUpOTP" component={SignUpOTP} />
			<Stack.Screen name="AddUserNameScreen" component={AddUserNameScreen} />
		</Stack.Navigator>
	);
};

export default Guest;
