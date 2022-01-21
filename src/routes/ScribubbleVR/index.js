import { useEffect } from 'preact/hooks';

import { createLineGeometry, addPosition, createLineAndAdd, removeLastLine } from '../../util/drawLine';

import './colorpicker.js';

import io from 'socket.io-client';
// const server_host = ":4000";
// https 로 테스트할때
const server_host = "https://175.123.65.79:4000";

// const socket = io(server_host, {});
// https 로 테스트할때
const socket = io(server_host, {
	// secure:true,
	withCredentials: true,
	extraHeaders: {
	  "my-custom-header": "abcd"
	}
});

let palleteIdx = 0;
let pallete = [
	'#5766c9',
	'#6878de',
	'#3f498a',
	'#c7c7c7',
	'#b5b5b5',
	'#f76565',
	'#3d3b3b',
	'#ede4e4',
	'#d4bb2c',
	'#ba7d13',
	'#0a9106',
	'#0d7a0a'
]
let _drawingColor = pallete[palleteIdx];
let _lineWidth = 1;
let _lineDashed = false;

AFRAME.registerComponent('scribubble', {
	init: function () {
		this.initListener();
		this.ASSSS = 10000;
	},

	initListener: function() {
	}
});

AFRAME.registerComponent('primary-hand',{
	schema: {
		scribubble: { type: 'selector', default: '#scribubble' },
		raycaster: { type: 'selector', default: '#raycaster' }
	},

	init: function init () {
		var _data = this.data,
        scribubble = _data.scribubble;

		this.user_id = 'vr_id';
		
		this.isDrawing = false;
		this.pen = this.el.object3D;

		this.distThresh = 0.001;

		this.scribubbleEntity = scribubble.object3D;
		this.scribubbleComponent = scribubble.components.scribubble;

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

		// 버블에 저장된 데이터 요청
		let currentBubble = 'room1';
		socket.emit('enter bubble', currentBubble);

        socket.on('user_id', (data) => {
			this.user_id = data.user_id;
        });

		socket.on('draw start', (data) => {
			createLineAndAdd(data.user_id, {
				width: data.linewidth,
				color: data.color,
				dashed: data.dashed,
				geo: createLineGeometry(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z))
			}, this.scribubbleEntity);
		});

        socket.on('drawing', (data) => {
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.scribubbleEntity);
		});

		socket.on('get saved bubble', (data) => {
			for (let i = 0; i < data.line.length; i++) {
				let line = data.line[i];
				let pos = line.linePositions;
				let testUserId = data.userid[0]; // 데이터 구조에 오류가 있어서, 라인 작성자를 임시로 설정

				createLineAndAdd(testUserId, {
					width: line.lineWidth,
					color: line.lineColor,
					dashed: line.dashed,
					geo: createLineGeometry(
						testUserId, 
						new THREE.Vector3(pos[0].x, pos[0].y, pos[0].z))
				}, this.scribubbleEntity);
				
				for(let j = 1; j < pos.length; j++) {
					addPosition(testUserId, new THREE.Vector3(pos[j].x, pos[j].y, pos[j].z));
				}
			}
		});

		this.el.addEventListener('triggerdown', e => this.triggerdown(e));
		this.el.addEventListener('triggerup', e => this.triggerup(e));
		this.el.addEventListener('bbuttondown', e => this.bbuttondown(e));

		this.data.raycaster.addEventListener('raycaster-intersection', evt => {
			this.intersections = evt.detail.els;
		});
		this.data.raycaster.addEventListener('raycaster-intersection-cleared', evt => {
			this.intersections = evt.detail.els;
		});

		// this.el.addEventListener('thumbstickmoved', e => this.logThumbstick(e));
	},
	
	triggerdown: function triggerdown(event) {
		if (this.intersections)
			return;
		
		if (!this.isDrawing) {
			this.isDrawing = true;
			this.lastPos = this.getLocalPenPos();
			
			// createLineAndAdd({
			// 	width: 1,
			// 	color: new THREE.Color(0, 1, 1),
			// 	geo: createLineGeometry(data.user_id, this.lastPos)
			// }, this.scribubbleEntity);

			socket.emit('draw start', {
				user_id: this.user_id,
				linewidth: _lineWidth,
				color: _drawingColor,
				dashed: _lineDashed,
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

	bbuttondown:  function bbuttondown(event) {
		socket.emit('remove current', {
			user_id: this.user_id
		});
	},

	getLocalPenPos: function getLocalPenPos() {
		var pos = new THREE.Vector3();

		this.pen.localToWorld(pos);

		this.scribubbleEntity.worldToLocal(pos);

		return pos;
	},

	logThumbstick: function logThumbstick(event) {
		// if (event.detail.y > 0.95) { console.log("DOWN"); }
		// if (event.detail.y < -0.95) { console.log("UP"); }
		// if (event.detail.x < -0.95) { console.log("LEFT"); }
		// if (event.detail.x > 0.95) { console.log("RIGHT"); }
	}
});

AFRAME.registerComponent('secondary-hand',{
	schema: {
		penSphereSecondary: { type: 'selector', default: '#penSphereSecondary' },
		colorpicker: { type: 'selector', default: '#colorpicker' },
		target: { type: 'selector', default: '#target' }
	},

	init: function init () {
		// secondary controller 모델링 설정
        var penSphere = document.querySelector("#penSphereSecondary");
		this.el.setObject3D('penSphereSecondary', penSphere.object3D);
		
		this.penSphereSecondaryEnt = penSphereSecondary;
		this.penSphereSecondaryComp = penSphereSecondary.components.scribubble;

		this.penSphereSecondaryEnt.setAttribute('color', _drawingColor);
		this.penSphereSecondaryEnt.setAttribute('radius', _lineWidth);

		this.initEventListner();
	},
	initEventListner: function initEventListner() {
		this.el.addEventListener('xbuttondown', e => this.xbuttondown(e));
		this.el.addEventListener('ybuttondown', e => this.ybuttondown(e));
		
		this.data.colorpicker.addEventListener('color_changed', e => {
			_drawingColor = e.detail.color;
			this.data.target.setAttribute("material", "color", _drawingColor);
		});
		
		this.data.colorpicker.addEventListener('thickness_changed', e => {
			_lineWidth = (e.detail.thickness < 0.05) ? 1 : e.detail.thickness * 30;
		});

	},
	xbuttondown:  function xbuttondown(event) {
		
	},
	ybuttondown:  function ybuttondown(event) {
		
	}
});


const ScribubbleVR = () => {

	useEffect(() => {
    
        return () => {
            socket.off('user_id');
            socket.off('draw start');
            socket.off('drawing');
			socket.off('remove current');
			socket.off('get saved bubble');
            socket.close();
        };
	}, []);


	return (
		<a-scene id="scene" cursor="rayOrigin: mouse">
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


			<a-box id="target" position="3 0 -3"></a-box>

			<a-entity
				secondary-hand="penSphereSecondary: #penSphereSecondary; colorpicker: #colorpicker; target: #target;"
				oculus-touch-controls="hand: left; model:false"
			>
				<a-entity colorpicker="colorWheel: #colorWheel; lightWheel: #lightWheel; thicknessWheel: #thicknessWheel;" id="colorpicker" class="wheels">
					<a-circle id="colorWheel" position="0 0 -3" rotation="0 0 0" class="wheels"></a-circle>
					<a-plane id="lightWheel" position="1.2 0 -3" width="0.1" height="2" class="wheels"></a-plane>
					<a-triangle id="thicknessWheel" color="#000" position="-1.2 0 -3" vertex-a="-0.1 -1 0" vertex-b="0.1 -1 0" vertex-c="0 1 0" class="wheels"></a-triangle>
				</a-entity>
			</a-entity>
			
			<a-entity
				primary-hand="scribubble: #scribubble; raycaster: #raycaster;"
				oculus-touch-controls="hand: right; model:false"
			></a-entity>

			<a-sphere
				id="penSpherePrimary"
				color="red" 
				radius="0.001" 
				material="opacity: 1"
			></a-sphere>
			<a-sphere
				id="penSphereSecondary"
				color="red" 
				radius="0.01" 
				material="opacity: 0.7"
			></a-sphere>

			{/* <a-entity laser-controls="hand: left;" raycaster="lineColor: red; lineOpacity: 0.5"></a-entity> */}
			<a-entity id="raycaster" laser-controls="hand: right;" raycaster="objects: .wheels; lineColor: blue; lineOpacity: 0.5"></a-entity>

			{/* <a-box  class="wheels" position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9" shadow="" material="" geometry=""></a-box> */}
			{/* <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E" shadow="" material="" geometry=""></a-sphere>
			<a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D" shadow="" material="" geometry=""></a-cylinder>
			<a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4" shadow="" material="" geometry=""></a-plane> */}
		</a-scene>
	);
};

export default ScribubbleVR;