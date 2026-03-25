import React, { useState } from 'react';
import WebView from 'react-native-webview';
import { Linking, Pressable, View } from 'react-native';
import { RootScreenProps } from '@/types/navigation';
import { Flow } from 'react-native-animated-spinkit';
import customColor from '@/util/constant/color';
import SafeScreen from '@/components/template/SafeScreen/SafeScreen';
import Header from '@/components/atoms/common/Header/Header';
import BackButton from '@/components/atoms/common/BackButton/BackButton';
import * as Progress from 'react-native-progress';
import { Browser } from '@/util/svg/icon.common';
import { cn } from '@/util/helper/twutil';
import { useColorScheme } from 'nativewind';

const WebViewer: React.FC<RootScreenProps<'WebViewer'>> = ({ route }) => {
	const { url, hideHeader, hideExternalOpen } = route.params;
	const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\\/\n?]+)/i);
	const customTitle = route.params.customTitle;
	const [progress, setProgress] = useState(0);
	const [isLoaded, setLoaded] = useState(false);
	const { colorScheme } = useColorScheme();

	return (
		<SafeScreen>
			{!hideHeader && (
				<Header
					title={customTitle || match![0]}
					leftCustomComponent={<BackButton extraClass="border-0" />}
					rightCustomComponent={
						hideExternalOpen ? undefined : (
							<OpenInBrowser url={route.params.url} />
						)
					}
					hideUnderline
				/>
			)}
			{!isLoaded && (
				<Progress.Bar
					progress={progress}
					width={null}
					borderWidth={0}
					borderRadius={0}
					height={3}
					color={
						colorScheme === 'dark'
							? customColor['patchwork-primary-dark']
							: customColor['patchwork-primary']
					}
				/>
			)}
			<WebView
				originWhitelist={['*']}
				style={{
					flex: 1,
					backgroundColor:
						colorScheme == 'dark'
							? customColor['patchwork-dark-100']
							: customColor['patchwork-grey-50'],
				}}
				startInLoadingState={true}
				source={{ uri: route?.params?.url }}
				onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
				renderLoading={() => {
					return (
						// <View className="absolute top-0 left-0 w-full h-full bg-patchwork-dark-100 justify-center items-center">
						// 	<Flow size={50} color={customColor['patchwork-red-50']} />
						// </View>
						<></>
					);
				}}
				mediaPlaybackRequiresUserAction={true}
				mixedContentMode={'compatibility'}
				onLoadEnd={() => setLoaded(true)}
			/>
		</SafeScreen>
	);
};

const OpenInBrowser = ({ url }: { url: string }) => {
	const { colorScheme } = useColorScheme();
	return (
		<Pressable
			onPress={() => Linking.openURL(url)}
			className={cn('w-10 h-10 items-center justify-center rounded-full')}
		>
			<Browser colorScheme={colorScheme} />
		</Pressable>
	);
};

export default WebViewer;
