
export const Helper = ({ pos, msg, isHover = false }) => {
	return  (
		<>
		{
			isHover &&
			<div style={`left:${pos.left}px; top:${pos.top}px; padding: .125rem .325rem; background: black; color: white; display: inline; position:fixed; z-index:100;`}>
				{ msg }
			</div>
		}
		</>
	);
}