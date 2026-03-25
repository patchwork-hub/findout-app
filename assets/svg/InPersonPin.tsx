import Svg, { Circle, Path } from 'react-native-svg';

const InPersonPin = () => (
	<Svg width={18} height={24} viewBox="0 0 14 18">
		<Path
			d="M7 0C3.134 0 0 3.134 0 7c0 5.25 7 11 7 11S14 12.25 14 7C14 3.134 10.866 0 7 0z"
			fill="#F6958A"
		/>
		{/* <Circle cx={7} cy={7} r={2.5} fill="rgba(255,255,255,0.5)" /> */}
	</Svg>
);

export default InPersonPin;
