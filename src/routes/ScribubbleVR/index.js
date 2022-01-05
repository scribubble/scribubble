import { useEffect } from 'preact/hooks';

import { createLineGeometry, addPosition, createLineInScene, removeLastLine } from '../../util/drawLine';


import io from 'socket.io-client';
const server_host = ":4000";
// https 로 테스트할때
// const server_host = "https:// :4000";

const socket = io(server_host, {});
// https 로 테스트할때
// const socket = io(server_host, {
// 	// secure:true,
// 	withCredentials: true,
// 	extraHeaders: {
// 	  "my-custom-header": "abcd"
// 	}
// });

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
let color = pallete[palleteIdx];
let lineList = [
	1, 5, 10, 30
];
let lengthList = [
	0.001, 0.005, 0.01, 0.03
]
let lineIdx = 0;
let lineWidth = lineList[lineIdx];

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

		// 버블에 저장된 데이터 요청
		let currentBubble = 'room1';
		socket.emit('enter bubble', currentBubble);

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

		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.scribubbleEnt.object3D);
		});

		socket.on('get saved bubble', (data) => {
			for (let i = 0; i < data.line.length; i++) {
				let line = data.line[i];
				let pos = line.linePositions;
				let testUserId = data.userid[0]; // 데이터 구조에 오류가 있어서, 라인 작성자를 임시로 설정

				createLineInScene(testUserId, {
					width: line.lineWidth,
					color: line.lineColor,
					geo: createLineGeometry(
						testUserId, 
						new THREE.Vector3(pos[0].x, pos[0].y, pos[0].z))
				}, this.scribubbleEnt.object3D);
				
				for(let j = 1; j < pos.length; j++) {
					addPosition(testUserId, new THREE.Vector3(pos[j].x, pos[j].y, pos[j].z));
				}
			}
		});

		this.el.addEventListener('triggerdown', e => this.triggerdown(e));
		this.el.addEventListener('triggerup', e => this.triggerup(e));
		this.el.addEventListener('bbuttondown', e => this.bbuttondown(e));
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
				linewidth: lineWidth,
				color: color,
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

AFRAME.registerComponent('secondary-hand',{
	schema: {
		penSphereSecondary: { type: 'selector', default: '#penSphereSecondary' }
	},

	init: function init () {
		// secondary controller 모델링 설정
        var penSphere = document.querySelector("#penSphereSecondary");
		this.el.setObject3D('penSphereSecondary', penSphere.object3D);
		
		this.penSphereSecondaryEnt = penSphereSecondary;
		this.penSphereSecondaryComp = penSphereSecondary.components.scribubble;

		this.penSphereSecondaryEnt.setAttribute('color', color);
		this.penSphereSecondaryEnt.setAttribute('radius', lengthList[lineIdx]);

		this.initEventListner();
	},
	initEventListner: function initEventListner() {
		this.el.addEventListener('xbuttondown', e => this.xbuttondown(e));
		this.el.addEventListener('ybuttondown', e => this.ybuttondown(e));
	},
	// 색상 변경
	xbuttondown:  function xbuttondown(event) {
		palleteIdx++;
		if (palleteIdx >= pallete.length) {
			palleteIdx = 0;
		}

		color = pallete[palleteIdx];
		
		this.penSphereSecondaryEnt.setAttribute('color', color);
	},
	// 라인 크기 변경
	ybuttondown:  function ybuttondown(event) {
		lineIdx++;
		if (lineIdx >= lineList.length) {
			lineIdx = 0;
		}

		lineWidth = lineList[lineIdx];
		this.penSphereSecondaryEnt.setAttribute('radius', lengthList[lineIdx]);
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
				secondary-hand="penSphereSecondary: #penSphereSecondary"
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
				material="opacity: 1"
			></a-sphere>
			<a-sphere
				id="penSphereSecondary"
				color="red" 
				radius="0.01" 
				material="opacity: 0.7"
			></a-sphere>

		</a-scene>
	);
};

export default ScribubbleVR;