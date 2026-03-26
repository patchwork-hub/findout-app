import { create } from 'zustand';

type ChannelComposePrefill = {
	prefilledHashtags?: Patchwork.PatchworkCommunityHashtag[];
	prefilledAudience?: Patchwork.ChannelAttributes;
	channelType?: 'local' | 'public';
	channelId?: string;
};

type ComposePrefillState = {
	channelPrefill: ChannelComposePrefill | null;
	setChannelPrefill: (prefill: ChannelComposePrefill) => void;
	clearChannelPrefill: () => void;
};

export const useComposePrefillStore = create<ComposePrefillState>(set => ({
	channelPrefill: null,
	setChannelPrefill: prefill => set({ channelPrefill: prefill }),
	clearChannelPrefill: () => set({ channelPrefill: null }),
}));
