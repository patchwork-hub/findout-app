export const getAgeInYears = (dateOfBirth: Date, now = new Date()) => {
	let age = now.getFullYear() - dateOfBirth.getFullYear();
	const monthDiff = now.getMonth() - dateOfBirth.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && now.getDate() < dateOfBirth.getDate())
	) {
		age -= 1;
	}

	return age;
};

export const parseDateOfBirth = (value?: string) => {
	if (!value) return null;
	const parsed = new Date(`${value}T00:00:00`);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};
