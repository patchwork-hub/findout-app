import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

const VirtualGlobe = () => (
	<Svg width={14} height={14} viewBox="0 0 16 16">
		<Circle
			cx={8}
			cy={8}
			r={7}
			fill="white"
			stroke="#F6958A"
			strokeWidth={1.5}
		/>
		<Ellipse
			cx={8}
			cy={8}
			rx={3}
			ry={7}
			fill="none"
			stroke="#F6958A"
			strokeWidth={1}
		/>
		<Line x1={1} y1={8} x2={15} y2={8} stroke="#F6958A" strokeWidth={1} />
		<Path
			d="M2.5 5 Q8 6.5 13.5 5"
			fill="none"
			stroke="#F6958A"
			strokeWidth={1}
		/>
		<Path
			d="M2.5 11 Q8 9.5 13.5 11"
			fill="none"
			stroke="#F6958A"
			strokeWidth={1}
		/>
	</Svg>
);

export default VirtualGlobe;
