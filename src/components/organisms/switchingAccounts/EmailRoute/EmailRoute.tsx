import EmailLoginAnotherAccountForm from '@/components/molecules/loginAnotherAccount/EmailLoginAnotherAccountForm/EmailLoginAnotherAccountForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const EmailRoute = ({
	openAccSwitcher,
}: {
	openAccSwitcher: () => void;
}) => (
	<KeyboardAwareScrollView
		className="mx-8"
		keyboardShouldPersistTaps="handled"
		showsVerticalScrollIndicator={false}
	>
		<EmailLoginAnotherAccountForm openAccSwitcher={openAccSwitcher} />
	</KeyboardAwareScrollView>
);
