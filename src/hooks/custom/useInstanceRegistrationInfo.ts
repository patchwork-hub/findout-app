import { useAuthStore } from '@/store/auth/authStore';
import { useSearchServerInstance } from '../queries/auth.queries';

export const useInstanceRegisterationInfo = () => {
	const { userOriginInstance } = useAuthStore();
	const domain =
		typeof userOriginInstance === 'string'
			? userOriginInstance.replace(/^https?:\/\//, '')
			: '';
	const { data: searchInstanceRes, isFetching: isSearching } =
		useSearchServerInstance({
			domain,
			enabled: Boolean(domain),
		});

	return searchInstanceRes?.registrations;
};
