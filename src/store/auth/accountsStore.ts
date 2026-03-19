import { create } from 'zustand';
import { AuthState, getMultiAuthState } from '@/util/storage';

interface AccountsState {
	accounts: AuthState[];
	activeAccId?: string;
	fetchAccounts: () => Promise<void>;
	setAccounts: (accs: AuthState[], activeId?: string) => void;
	openAccSwitcher: (() => void) | null;
	setOpenAccSwitcher: (fn: (() => void) | null) => void;
}

export const useAccountsStore = create<AccountsState>(set => ({
	accounts: [],
	activeAccId: undefined,
	fetchAccounts: async () => {
		const state = await getMultiAuthState();
		if (state && state.accounts) {
			set({
				accounts: Object.values(state.accounts),
				activeAccId: state.activeId,
			});
		}
	},
	setAccounts: (accs, activeId) =>
		set({ accounts: accs, activeAccId: activeId }),
	openAccSwitcher: null,
	setOpenAccSwitcher: fn => set({ openAccSwitcher: fn }),
}));
