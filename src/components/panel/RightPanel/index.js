import { useEffect, useRef } from 'preact/hooks';
import styled from 'styled-components';
import ContentEditablePage from './contentEditablePage';

const Panel = styled.div`
	width: 20rem;
	height: calc(100vh - 0.5rem);
	border-radius: 1rem;
	margin: 0.25rem 0.25rem 0.25rem 0.5rem;
	background-color: white;
	-webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
	box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.1);
	&:after {
		content: '';
		position: absolute;
		width: .25rem;
		height: 100%;
		cursor: ew-resize;
	}
`;

const RightPanel = () => {
    const rightPanel = useRef(null);
    const MIN_WIDTH = 320;

	useEffect(() => {
		initRightPanel();
	}, []);
    
	function initRightPanel() {
		const BORDER_SIZE = 4;
		
		let tempPos;
		function resize(e) {		  
          const newSize = (parseInt(getComputedStyle(rightPanel.current, '').width) + tempPos - e.x);
		  tempPos = e.x;

		  if (newSize > MIN_WIDTH)
            rightPanel.current.style.width = newSize + "px";
		}
		
		rightPanel.current.addEventListener("mousedown", (e) => {
		  if (e.offsetX < BORDER_SIZE) {
			tempPos = e.x;
			document.addEventListener("mousemove", resize, false);
		  }
		}, false);
		
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", resize, false);
		}, false);
	}

	return (
		<Panel ref={rightPanel}>
			<ContentEditablePage />
		</Panel>
	);
};

export default RightPanel;
