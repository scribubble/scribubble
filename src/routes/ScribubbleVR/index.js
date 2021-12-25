import { useEffect } from 'preact/hooks';

import { createLineGeometry, addPosition, createLineInScene, removeLastLine } from '../../util/drawLine';


import io from 'socket.io-client';
const server_host = ":4000";
// https 로 테스트할때
// const server_host = "https://localhost:4000";

const socket = io(server_host, {});
// https 로 테스트할때
// const socket = io(server_host, {
// 	// secure:true,
// 	withCredentials: true,
// 	extraHeaders: {
// 	  "my-custom-header": "abcd"
// 	}
// });

AFRAME.registerComponent('scribubble', {
	init: function () {
		this.initListener();
	},

	initListener: function() {
	}
});
  
AFRAME.registerComponent('primary-hand',{
	schema: {
		scribubble: { type: 'selector', default: '#scribubble' }
	},

	init: function init () {
		var _data = this.data,
        scribubble = _data.scribubble;

		this.user_id = 'vr_id';
		
		this.isDrawing = false;
		this.pen = this.el.object3D;

		this.distThresh = 0.001;

		this.scribubbleEnt = scribubble;
		this.scribubbleComp = scribubble.components.scribubble;

		// primary controller 모델링 설정
        var penSphere = document.querySelector("#penSpherePrimary");
		this.el.setObject3D('penSpherePrimary', penSphere.object3D);

		this.initEventListner();
	},
	
	tick: function tick () {
		if (this.isDrawing) {
			var currentPos = this.getLocalPenPos();
			var distToLastPos = this.lastPos.distanceTo(currentPos);
		
			if (distToLastPos > this.distThresh) {
				// addPosition(currentPos);

				socket.emit('drawing', {
					user_id: this.user_id,
					mousePos: {
						x: currentPos.x,
						y: currentPos.y,
						z: currentPos.z,
					}
				});
				
				this.lastPos = currentPos;
			}
		}
	},

	initEventListner: function initEventListner() {
        socket.on('user_id', (data) => {
			this.user_id = data.user_id;
        });

		socket.on('draw start', (data) => {
			createLineInScene(data.user_id, {
				width: data.linewidth,
				color: data.color,
				geo: createLineGeometry(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z))
			}, this.scribubbleEnt.object3D);
		});

        socket.on('drawing', (data) => {
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		this.el.addEventListener('triggerdown', e => this.triggerdown(e));
		this.el.addEventListener('triggerup', e => this.triggerup(e));
		// this.el.addEventListener('thumbstickmoved', e => this.logThumbstick(e));
	},
	
	triggerdown: function triggerdown(event) {
		if (!this.isDrawing) {
			this.isDrawing = true;
			this.lastPos = this.getLocalPenPos();
			
			// createLineInScene({
			// 	width: 1,
			// 	color: new THREE.Color(0, 1, 1),
			// 	geo: createLineGeometry(data.user_id, this.lastPos)
			// }, this.scribubbleEnt.object3D);

			socket.emit('draw start', {
				user_id: this.user_id,
				linewidth: 1,
				color: new THREE.Color(0, 1, 1),
				mousePos: {
					x: this.lastPos.x,
					y: this.lastPos.y,
					z: this.lastPos.z,
				}
			});

		}
	},

	triggerup:  function triggerup(event) {
		this.isDrawing = false;
	},

	getLocalPenPos: function getLocalPenPos() {
		var pos = new THREE.Vector3();

		this.pen.localToWorld(pos);

		this.scribubbleEnt.object3D.worldToLocal(pos);

		return pos;
	},

	logThumbstick: function logThumbstick(event) {
		// if (event.detail.y > 0.95) { console.log("DOWN"); }
		// if (event.detail.y < -0.95) { console.log("UP"); }
		// if (event.detail.x < -0.95) { console.log("LEFT"); }
		// if (event.detail.x > 0.95) { console.log("RIGHT"); }
	}
  });

const ScribubbleVR = () => {

	useEffect(() => {
    
        return () => {
            socket.off('user_id');
            socket.off('draw start');
            socket.off('drawing');
            socket.close();
        };
	}, []);


	return (
		<a-scene id="scene">
			<a-sky color="#fff"></a-sky>

			<a-camera 
				id="camera" 
				wasd-controls="acceleration: 15; fly:true"
				position="0 0 0"
			></a-camera>

			<a-entity
				scribubble
				id="scribubble"
			></a-entity>

			<a-entity
				oculus-touch-controls="hand: left; model:false"
			></a-entity>
			<a-entity
				primary-hand="scribubble: #scribubble;"
				oculus-touch-controls="hand: right; model:false"
			></a-entity>

			<a-sphere
				id="penSpherePrimary"
				color="red" 
				radius="0.001" 
				material="opacity: 0.7"
			></a-sphere>
			<a-sphere
				id="penSphereSecondary"
				color="red" 
				radius="0.001" 
				material="opacity: 0.7"
			></a-sphere>

			<a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
			<a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
			<a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
			<a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
		</a-scene>
	);
};

export default ScribubbleVR;