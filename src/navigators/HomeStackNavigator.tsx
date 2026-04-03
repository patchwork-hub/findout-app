import {
	FeedDetail,
	HomeFeed,
	Profile,
	HashTagDetail,
	FollowingAccounts,
	FollowerAccounts,
	PeopleFollowing,
	NewsmastChannelTimeline,
	ViewAllChannelScreen,
	QuotedBy,
} from '@/screens';
import ProfileOther from '@/screens/ProfileOther/ProfileOther';
import { HomeStackParamList } from '@/types/navigation';
import ConversationsStack from './ConversationsStackNavigator';
import ListsStack from './ListsStackNavigator';
import TrendingStatuses from '@/screens/TrendingStatuses/TrendingStatuses';
import HashtagsFollowing from '@/screens/HashtagsFollowing/HashtagsFollowing';
import NewsmastCollections from '@/screens/NewsmastCollections/NewsmastCollections';
import NewsmastCollectionDetail from '@/screens/NewsmastCollectionDetail/NewsmastCollectionDetail';
import FavoritedBy from '@/screens/FavoritedBy/FavoritedBy';
import BoostedBy from '@/screens/BoostedBy/BoostedBy';
import NMChannelAllContributorList from '@/screens/NMChannelAllContributorList/NMChannelAllContributorList';
import NMChannelAllHashtagList from '@/screens/NMChannelAllHashtagList/NMChannelAllHashtagList';
import ArticleDetail from '@/screens/ArticleDetail/ArticleDetail';
import WpStoryDetail from '@/screens/WpStoryDetail/WpStoryDetail';
import WpCategoryViewAll from '@/screens/WpCategoryViewAll/WpCategoryViewAll';
import AuthorDetail from '@/screens/AuthorDetail/AuthorDetail';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StarterPackDetail from '@/screens/StarterPackDetail/StarterPackDetail';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="HomeFeed" component={HomeFeed} />
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="ProfileOther" component={ProfileOther} />
			<Stack.Screen name="FollowingAccounts" component={FollowingAccounts} />
			<Stack.Screen name="FollowerAccounts" component={FollowerAccounts} />
			<Stack.Screen name="FeedDetail" component={FeedDetail} />
			<Stack.Screen name="HashTagDetail" component={HashTagDetail} />
			<Stack.Screen name="HashtagsFollowing" component={HashtagsFollowing} />
			<Stack.Screen name="Conversations" component={ConversationsStack} />
			<Stack.Screen name="PeopleFollowing" component={PeopleFollowing} />
			<Stack.Screen name="ListsStack" component={ListsStack} />
			<Stack.Screen name="TrendingStatuses" component={TrendingStatuses} />
			<Stack.Screen
				name="NewsmastChannelTimeline"
				component={NewsmastChannelTimeline}
			/>

			<Stack.Screen
				name="NewsmastCollections"
				component={NewsmastCollections}
			/>
			<Stack.Screen
				name="NewsmastCollectionDetail"
				component={NewsmastCollectionDetail}
			/>
			<Stack.Screen
				name="ViewAllChannelScreen"
				component={ViewAllChannelScreen}
			/>
			<Stack.Screen name="FavoritedBy" component={FavoritedBy} />
			<Stack.Screen name="BoostedBy" component={BoostedBy} />
			<Stack.Screen
				name="NMChannelAllContributorList"
				component={NMChannelAllContributorList}
			/>
			<Stack.Screen
				name="NMChannelAllHashtagList"
				component={NMChannelAllHashtagList}
			/>
			<Stack.Screen name="ArticleDetail" component={ArticleDetail} />
			<Stack.Screen name="WpStoryDetail" component={WpStoryDetail} />
			<Stack.Screen name="WpCategoryViewAll" component={WpCategoryViewAll} />
			<Stack.Screen name="AuthorDetail" component={AuthorDetail} />
			<Stack.Screen name="StarterPackDetail" component={StarterPackDetail} />
			<Stack.Screen name="QuotedBy" component={QuotedBy} />
		</Stack.Navigator>
	);
};

export default HomeStack;
