import { create } from 'zustand';

type ChannelComposePrefill = {
	prefilledHashtags?: Patchwork.PostHashtag[];
	prefilledAudience?: Patchwork.PostHashtagDetail;
	channelType?: 'local' | 'public';
	channelId?: string;
};

type ComposePrefillState = {
	channelPrefill: ChannelComposePrefill | null;
	isChannelLoading: boolean;
	isComposeDisabled: boolean;
	setChannelLoading: (loading: boolean) => void;
	setChannelPrefill: (prefill: ChannelComposePrefill) => void;
	clearChannelPrefill: () => void;
	setComposeDisabled: (disabled: boolean) => void;
};

export const useComposePrefillStore = create<ComposePrefillState>(set => ({
	channelPrefill: null,
	isChannelLoading: false,
	isComposeDisabled: false,
	setChannelLoading: loading => set({ isChannelLoading: loading }),
	setChannelPrefill: prefill =>
		set({ channelPrefill: prefill, isChannelLoading: false }),
	clearChannelPrefill: () =>
		set({ channelPrefill: null, isChannelLoading: false }),
	setComposeDisabled: disabled => set({ isComposeDisabled: disabled }),
}));
