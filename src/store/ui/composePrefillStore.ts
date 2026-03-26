import { create } from 'zustand';

type ChannelComposePrefill = {
	prefilledHashtags?: Patchwork.PatchworkCommunityHashtag[];
	prefilledAudience?: Patchwork.ChannelAttributes;
	channelType?: 'local' | 'public';
	channelId?: string;
};

type ComposePrefillState = {
	channelPrefill: ChannelComposePrefill | null;
	isChannelLoading: boolean;
	setChannelLoading: (loading: boolean) => void;
	setChannelPrefill: (prefill: ChannelComposePrefill) => void;
	clearChannelPrefill: () => void;
};

export const useComposePrefillStore = create<ComposePrefillState>(set => ({
	channelPrefill: null,
	isChannelLoading: false,
	setChannelLoading: loading => set({ isChannelLoading: loading }),
	setChannelPrefill: prefill =>
		set({ channelPrefill: prefill, isChannelLoading: false }),
	clearChannelPrefill: () =>
		set({ channelPrefill: null, isChannelLoading: false }),
}));
