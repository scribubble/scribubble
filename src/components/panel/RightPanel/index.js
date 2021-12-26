import { useEffect, useRef } from 'preact/hooks';

import style from './style.css'

const RightPanel = () => {
    const rightPanel = useRef(null);
    const MIN_WIDTH = 320;

	useEffect(() => {
		initRightPanel();
	}, []);
    
	function initRightPanel() {
		const BORDER_SIZE = 4;
		
		let m_pos;
		function resize(e){
		  const dx = m_pos - e.x;
		  m_pos = e.x;
		  
          const newSize = (parseInt(getComputedStyle(rightPanel.current, '').width) + dx);

		  if (newSize > MIN_WIDTH)
            rightPanel.current.style.width = newSize + "px";
		}
		
		rightPanel.current.addEventListener("mousedown", (e) => {
		  if (e.offsetX < BORDER_SIZE) {
			m_pos = e.x;
			document.addEventListener("mousemove", resize, false);
		  }
		}, false);
		
		document.addEventListener("mouseup", () => {
			document.removeEventListener("mousemove", resize, false);
		}, false);
	}

	return (
		<div id="right-panel" ref={rightPanel} class={style.rightPanel}></div>
	);
};

export default RightPanel;
