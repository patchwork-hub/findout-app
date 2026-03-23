import React, { useCallback } from 'react';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useGetNewsmastCommunityPeopleToFollow } from '@/hooks/queries/channel.queries';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { ThemeText } from '@/components/atoms/common/ThemeText/ThemeText';
import Bio from '@/components/atoms/profile/Bio/Bio';
import Underline from '@/components/atoms/common/Underline/Underline';
import { ChevronRightIcon } from '@/util/svg/icon.common';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '@/types/navigation';
import { useActiveDomainStore } from '@/store/feed/activeDomain';
import NewsmastPeopleToFollowItem from '@/components/atoms/channel/NewsmastPeopleToFollowItem/NewsmastPeopleToFollowItem';
import { StackNavigationProp } from '@react-navigation/stack';

interface ChannelAboutTabProps {
	note: string;
	adminUsername: string;
	rules: Patchwork.ChannelAboutHint[];
	hashtags: Patchwork.PatchworkCommunityHashtag[];
	channelId: string;
	channelSlug: string;
}

const ChannelAboutTab: React.FC<ChannelAboutTabProps> = ({
	note,
	adminUsername,
	rules,
	hashtags,
	channelId,
	channelSlug,
}) => {
	const { t } = useTranslation();
	const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
	const { domain_name } = useActiveDomainStore();

	const { data: newsmastCommunityPeopleToFollow } =
		useGetNewsmastCommunityPeopleToFollow({
			id: channelId,
			options: {
				enabled: !!channelId,
			},
		});

	const navigateToHashTagDetail = (name: string) => {
		navigation.navigate('HashTagDetail', {
			hashtag: name,
			hashtagDomain: domain_name,
		});
	};
	const renderItem = useCallback(
		({ item }: { item: Patchwork.NewsmastComunityContributorList }) => {
			return <NewsmastPeopleToFollowItem item={item} />;
		},
		[],
	);

	return (
		<Tabs.ScrollView showsVerticalScrollIndicator={false}>
			<View className="m-5">
				<View className="mb-3">
					<ThemeText size={'md_16'} variant={'textBold'}>
						{t('channel.about_this_community')}
					</ThemeText>
					{note && <Bio userBio={note} customMaxWordCount={500} />}
					<Underline className="mt-5" />
				</View>
				{hashtags && hashtags?.length > 0 && (
					<View className="mb-3">
						<View className="flex-row justify-center">
							<ThemeText
								size={'md_16'}
								variant={'textBold'}
								className="mb-3 flex-1"
							>
								{t('channel.community_hashtags')}
							</ThemeText>
							{hashtags.length > 5 && (
								<Pressable
									onPress={() => {
										navigation.navigate('NMChannelAllHashtagList', {
											slug: channelSlug,
										});
									}}
									className="active:opacity-80"
								>
									<ThemeText variant="textPrimary">
										{t('common.see_more')}
									</ThemeText>
								</Pressable>
							)}
						</View>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ marginBottom: 16 }}
						>
							{hashtags.length > 0 &&
								hashtags?.slice(0, 5).map(item => (
									<Pressable
										key={item.name}
										onPress={() => navigateToHashTagDetail(item.name)}
									>
										<View className="flex-row items-center my-2">
											<View className="flex-1">
												<ThemeText size="md_16">#{item.name}</ThemeText>
											</View>
											<ChevronRightIcon />
										</View>
									</Pressable>
								))}
						</ScrollView>

						<Underline />
					</View>
				)}

				<View className="mb-3">
					<ThemeText size={'md_16'} variant={'textBold'} className="mb-3">
						{t('channel.follow_us')}
					</ThemeText>

					<ThemeText className="mb-3">
						<Trans
							i18nKey="channel.follow_bot_instruction"
							values={{ botAccount: adminUsername }}
							components={{
								orangeText: (
									<ThemeText key={'orangeText'} variant="textPrimary" />
								),
							}}
						/>
					</ThemeText>
					<Underline />
				</View>

				{newsmastCommunityPeopleToFollow &&
					newsmastCommunityPeopleToFollow?.length > 0 && (
						<View className="mb-3">
							<View className="flex-row justify-center">
								<ThemeText
									size={'md_16'}
									variant={'textBold'}
									className="mb-3 flex-1"
								>
									{t('common.people_to_follow')}
								</ThemeText>
								{newsmastCommunityPeopleToFollow.length > 5 && (
									<Pressable
										onPress={() => {
											navigation.navigate('NMChannelAllContributorList', {
												id: channelId,
											});
										}}
										className="active:opacity-80"
									>
										<ThemeText variant="textPrimary">
											{t('common.see_more')}
										</ThemeText>
									</Pressable>
								)}
							</View>
							<FlatList
								data={newsmastCommunityPeopleToFollow.slice(0, 8)}
								horizontal
								showsHorizontalScrollIndicator={false}
								renderItem={renderItem}
								keyExtractor={item => item.id}
							/>
						</View>
					)}
				<Underline />

				<View className="my-4">
					<ThemeText size={'md_16'} variant={'textBold'} className="mb-3">
						{t('channel.community_guidelines')}
					</ThemeText>
					<View className="">
						{rules.map((guide, idx) => (
							<View key={idx} className="mb-4">
								<ThemeText>{'▪️ ' + guide.text}</ThemeText>
							</View>
						))}
					</View>
					<Underline />
				</View>
			</View>
		</Tabs.ScrollView>
	);
};

export default ChannelAboutTab;
