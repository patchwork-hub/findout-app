import { create } from 'zustand';

type AudienceStore = {
	selectedAudience: Patchwork.PostHashtagDetail[];
	setSelectedAudience: (audience: Patchwork.PostHashtagDetail[]) => void;
	toggleAudience: (audience: Patchwork.PostHashtagDetail) => void;
	clearAudience: () => void;
};

export const useAudienceStore = create<AudienceStore>((set, get) => ({
	selectedAudience: [],
	setSelectedAudience: audience => set({ selectedAudience: audience }),
	toggleAudience: audience => {
		const { selectedAudience } = get();
		const exists = selectedAudience.find(
			a => a.patchwork_community_id === audience.patchwork_community_id,
		);
		set({
			selectedAudience: exists
				? selectedAudience.filter(
						a => a.patchwork_community_id !== audience.patchwork_community_id,
				  )
				: [...selectedAudience, audience],
		});
	},
	clearAudience: () => set({ selectedAudience: [] }),
}));
