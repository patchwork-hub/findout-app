import {
	BookmarkList,
	FeedDetail,
	MuteAndBlockList,
	MyInformation,
	Settings,
	UpdatePassword,
	HashTagDetail,
	Welcome,
	DeleteAccount,
	AllContributorList,
	AllMutedContributorList,
	NewsmastChannelTimeline,
	FollowingAccounts,
	FollowerAccounts,
	Compose,
	LoginAnotherAccount,
} from '@/screens';
import ProfileOther from '@/screens/ProfileOther/ProfileOther';
import { SettingStackParamList } from '@/types/navigation';
import ListsStack from './ListsStackNavigator';
import ChangeEmail from '@/screens/ChangeEmail/ChangeEmail';
import ChangeEmailVerification from '@/screens/ChangeEmailVerification/ChangeEmailVerification';
import FavoritedBy from '@/screens/FavoritedBy/FavoritedBy';
import BoostedBy from '@/screens/BoostedBy/BoostedBy';
import Appearance from '@/screens/Appearance/Appearance';
import NMChannelAllContributorList from '@/screens/NMChannelAllContributorList/NMChannelAllContributorList';
import NMChannelAllHashtagList from '@/screens/NMChannelAllHashtagList/NMChannelAllHashtagList';
import ScheduledPostList from '@/screens/ScheduledPostList/ScheduledPostList';
import LanguageScreen from '@/screens/Language/Language';
import ArticleDetail from '@/screens/ArticleDetail/ArticleDetail';
import Timeline from '@/screens/Timeline/Timeline';
import AccountSettingsScreen from '@/screens/AccountSettings/AccountSettingsScreen';
import NotificationSettingsScreen from '@/screens/NotificationSettings/NotificationSettingsScreen';
import FeedSettingsScreen from '@/screens/FeedSettings/FeedSettingsScreen';
import PrivacySettingsScreen from '@/screens/PrivacySettings/PrivacySettingsScreen';
import PersonalizationSettingsScreen from '@/screens/PersonalizationSettings/PersonalizationSettingsScreen';
import AccountManagementScreen from '@/screens/AccountManagement/AccountManagementScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<SettingStackParamList>();

const SettingStack = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="Settings" component={Settings} />
			<Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
			<Stack.Screen
				name="NotificationSettings"
				component={NotificationSettingsScreen}
				options={{ presentation: 'modal', headerShown: false }}
			/>
			<Stack.Screen name="FeedSettings" component={FeedSettingsScreen} />
			<Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
			<Stack.Screen
				name="PersonalizationSettings"
				component={PersonalizationSettingsScreen}
				options={{ presentation: 'modal', headerShown: false }}
			/>
			<Stack.Screen
				name="AccountManagement"
				component={AccountManagementScreen}
			/>
			<Stack.Screen name="UpdatePassword" component={UpdatePassword} />
			<Stack.Screen name="MuteAndBlockList" component={MuteAndBlockList} />
			<Stack.Screen name="MyInformation" component={MyInformation} />
			<Stack.Screen name="BookmarkList" component={BookmarkList} />
			<Stack.Screen name="ProfileOther" component={ProfileOther} />
			<Stack.Screen name="FeedDetail" component={FeedDetail} />
			<Stack.Screen name="ListsStack" component={ListsStack} />
			<Stack.Screen name="HashTagDetail" component={HashTagDetail} />
			<Stack.Screen name="ChangeEmail" component={ChangeEmail} />
			<Stack.Screen
				name="ChangeEmailVerification"
				component={ChangeEmailVerification}
			/>
			<Stack.Screen name="Welcome" component={Welcome} />
			<Stack.Screen name="DeleteAccount" component={DeleteAccount} />
			<Stack.Screen name="AllContributorList" component={AllContributorList} />
			<Stack.Screen
				name="NewsmastChannelTimeline"
				component={NewsmastChannelTimeline}
			/>
			<Stack.Screen
				name="AllMutedContributorList"
				component={AllMutedContributorList}
			/>
			<Stack.Screen name="FavoritedBy" component={FavoritedBy} />
			<Stack.Screen name="BoostedBy" component={BoostedBy} />
			<Stack.Screen name="Appearance" component={Appearance} />
			<Stack.Screen name="Language" component={LanguageScreen} />
			<Stack.Screen name="FollowingAccounts" component={FollowingAccounts} />
			<Stack.Screen name="FollowerAccounts" component={FollowerAccounts} />
			<Stack.Screen
				name="NMChannelAllContributorList"
				component={NMChannelAllContributorList}
			/>
			<Stack.Screen
				name="NMChannelAllHashtagList"
				component={NMChannelAllHashtagList}
			/>
			<Stack.Screen name="ScheduledPostList" component={ScheduledPostList} />
			<Stack.Screen name="Compose" component={Compose} />
			<Stack.Screen name="ArticleDetail" component={ArticleDetail} />
			<Stack.Screen name="Timeline" component={Timeline} />
			<Stack.Screen
				name="LoginAnotherAccount"
				component={LoginAnotherAccount}
				options={{ presentation: 'modal', headerShown: false }}
			/>
		</Stack.Navigator>
	);
};

export default SettingStack;
