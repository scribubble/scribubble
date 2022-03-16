import { useEffect, useState, useRef } from 'preact/hooks';

import {
	createLineGeometry,
	addPosition,
	createLineAndAdd,
	removeLastLine,
	getLastLine,
	getCenterPos,
} from "../../util/drawLine";
import { getBasisPosition } from "../../util/position";

import './colorpicker.js';
import './plane.js';

import io from 'socket.io-client';
const server_host = process.env.SERVER_URL; // 배포
const socket = io(server_host, { transports: ['websocket'] });

let _drawingColor = '#000000';
let _lineWidth = 1;
let _lineDashed = false;

const AddPalleteBT = ({ posY, clicked, buttonColor="white", fontColor="#4262FF" }) => {
	const button = useRef();

	useEffect(() => {
		button.current.addEventListener('click', clicked);
		return () => {
			button.current.removeEventListener('click', clicked);
		}
	}, []);

	return (
		<a-plane border-plane="scale:1.1;" material="opacity: 0.0; transparent: true" ref={button} position={`1.5 ${posY} 0.1`} width="0.5" height="0.3" class="wheels" color={buttonColor}>
			<a-text value="ADD" color={fontColor} align="center" scale='0.5 0.5 1'></a-text>
		</a-plane>
	);
}
const Pallete = ({ posY, color, clicked, removed, removeButttonColor="#FF7EE3" }) => {
	const pallete = useRef();
	const removeButtton = useRef();

	useEffect(() => {
		pallete.current.addEventListener('click', clicked);
		removeButtton.current.addEventListener('click', removed);
		return () => {
			pallete.current.removeEventListener('click', clicked);
			removeButtton.current.removeEventListener('click', removed);
		}
	}, [color]);

	return (
		<>
			<a-plane ref={pallete} position={`1.5 ${posY} 0.1`} width="0.5" height="0.5" class="wheels" color={color}></a-plane>
			<a-plane ref={removeButtton} position={`1.875 ${posY} 0.1`} width="0.25" height="0.25" class="wheels" color={removeButttonColor}>
				<a-text value="X" color="white" align="center"></a-text>
			</a-plane>
		</>
	);
}

AFRAME.registerComponent('scribubble', {
	init: function() {
	}
});

AFRAME.registerComponent('primary-hand',{
	schema: {
		scribubble: { type: 'selector', default: '#scribubble' },
		raycaster: { type: 'selector', default: '#raycaster' }
	},

	init: function init() {
		var _data = this.data,
        scribubble = _data.scribubble;

		// 유저 고유 id
		this.user_id = '(unknown)';
		this.user_nickname = '(unknown)';

		// 참여한 버블 이름
		this.bubbleName = 'room1';
		
		// 다음에 생성할 오브젝트의 인덱스
		this.objIdx = 0;

		// 그리고 있는지 여부
		this.isDrawing = false;
		this.pen = this.el.object3D;

		this.distThresh = 0.001;

		this.scene = scribubble.object3D.parent;
		this.objEntity = new THREE.Object3D();
		this.scene.add(this.objEntity);
		this.scribubbleComponent = scribubble.components.scribubble;

		// primary controller 모델링 설정
        var penSphere = document.querySelector("#penSpherePrimary");
		this.el.setObject3D('penSpherePrimary', penSphere.object3D);

		this.initSocketListener();
		
		this.initListener();
	},
	
	tick: function tick() {
		if (this.isDrawing) {
			var currentPos = this.getLocalPenPos();
			var distToLastPos = this.lastPos.distanceTo(currentPos);
		
			if (distToLastPos > this.distThresh) {
				socket.emit('drawing', {
					bubbleName: this.bubbleName,
					objName: getLastLine(this.user_id).name,
					user_id: this.user_id,
					mousePos: getBasisPosition(currentPos)
				});
				
				this.lastPos = currentPos;
			}
		}
	},

	initSocketListener: function initSocketListener() {

		// 버블에 저장된 데이터 요청
		socket.emit('enter bubble', this.bubbleName);

        socket.on('user_id', (data) => {
			this.user_id = data.user_id;
			this.user_nickname = data.user_nickname;
        });

		socket.on('draw start', (data) => {
			createLineAndAdd(data.user_id, {
				width: data.linewidth,
				color: data.color,
				dashed: data.dashed,
				objName: data.objName,
				geo: createLineGeometry(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z))
			}, this.objEntity);
		});

        socket.on('drawing', (data) => {
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('draw stop', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);
			target.parent.position.copy(data.tfcPosition);
			target.position.copy(data.position);
			target.type = 'Line2';
		});

		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.objEntity);
		});

		socket.on('get saved bubble', (data) => {
			// 라인
			for (let i = 0; i < data.lines.length; i++) {
				let line = data.lines[i];
				let linePos = line.linePositions;

				createLineAndAdd(line.drawer_id, {
					width: line.lineWidth,
					color: line.lineColor,
					dashed: line.lineDashed,
					objName: line.objName,
					geo: createLineGeometry(
						line.drawer_id, 
						new THREE.Vector3(linePos[0].x, linePos[0].y, linePos[0].z)),
				}, this.objEntity);
				
				for (let j = 1; j < linePos.length; j++) {
					addPosition(line.drawer_id, new THREE.Vector3(linePos[j].x, linePos[j].y, linePos[j].z));
				}

				let curLine = getLastLine(line.drawer_id);
				
				curLine.parent.position.set(line.tfcPosition.x, line.tfcPosition.y, line.tfcPosition.z);
				curLine.position.set(line.position.x, line.position.y, line.position.z);
				curLine.parent.rotation.set(line.tfcRotation.x, line.tfcRotation.y, line.tfcRotation.z);
				curLine.parent.scale.set(line.tfcScale.x, line.tfcScale.y, line.tfcScale.z);

				curLine.type = 'Line2';
			}

			// 도형
			for (let i = 0; i < data.shapes.length; i++) {
				let item = data.shapes[i];
				this.createShape(item.shape, {
					objName: item.objName, 
					color: item.color, 
					position: item.position, 
					rotation: item.rotation, 
					scale: item.scale
				});
			}
		});

		socket.on("delete obj", (data) => {
			let obj = this.objEntity.getObjectByName(data.objName);
			if (obj.type === 'Line2') {
				this.objEntity.remove(obj.parent);
			}
			this.objEntity.remove(obj);
		});

		socket.on("create shape", (data) => {
			this.createShape(data.shape, {
				objName: data.objName, 
				color: data.color, 
				position: data.position, 
				rotation: data.rotation,
				scale: data.scale
			});
		});

		socket.on('change obj color', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);
			target.material.color = new THREE.Color(data.color);
		});

		socket.on('move obj', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);

			if(data.tfcPosition) {
				target.parent.position.set(data.tfcPosition.x, data.tfcPosition.y, data.tfcPosition.z); 
			} else {
				target.position.set(data.position.x, data.position.y, data.position.z); 
			}
		});

		socket.on('scale obj', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);

			if (target.type === 'Line2') {
				target.parent.scale.set(data.scale.x, data.scale.y, data.scale.z);
			} else {
				target.scale.set(data.scale.x, data.scale.y, data.scale.z);
			}
		});

		socket.on('rotate obj', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);
			
			if (target.type === 'Line2') {
				target.parent.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
			} else {
				target.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
			}
		});
	},
	
	initListener: function initListener() {
		this.el.addEventListener('triggerdown', e => this.triggerdown(e));
		this.el.addEventListener('triggerup', e => this.triggerup(e));
		// this.el.addEventListener('bbuttondown', e => this.bbuttondown(e));

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
			
			socket.emit('draw start', {
				bubbleName: this.bubbleName,
				user_id: this.user_id,
				user_nickname: this.user_nickname,
				linewidth: _lineWidth,
				color: _drawingColor,
				dashed: _lineDashed,
				objName: this.user_id + this.objIdx,
				mousePos: getBasisPosition(this.lastPos)
			});

			this.objIdx++;
		}
	},

	triggerup:  function triggerup(event) {
		this.isDrawing = false;

		const curLine = getLastLine(this.user_id);
		const curPos = getCenterPos(curLine);

		socket.emit('draw stop', {
			bubbleName: this.bubbleName,
			user_id: this.user_id,
			objName: curLine.name,
			tfcPosition: getBasisPosition(curPos),
			position: {
				x: -curPos.x,
				y: -curPos.y,
				z: -curPos.z
			}
		});
	},

	bbuttondown:  function bbuttondown(event) {
		socket.emit('remove current', {
			user_id: this.user_id
		});
	},

	getLocalPenPos: function getLocalPenPos() {
		var pos = new THREE.Vector3();

		this.pen.localToWorld(pos);

		this.objEntity.worldToLocal(pos);

		return pos;
	}
});

AFRAME.registerComponent('secondary-hand', {
	init: function init() {
	}
});


const ScribubbleVR = () => {
	const colorpicker = useRef();
	const target = useRef();

	const [pallete, setPallete] = useState([
		{
			color: "#000",
			lightness: 0,
			point: { x : 0, y : 0 }
		},
	]);	

	function colorChanged(color) {
		_drawingColor = color;
		target.current.setAttribute("material", "color", _drawingColor);
	}

	useEffect(() => {
		colorpicker.current.addEventListener('color_changed', e => {
			colorChanged(e.detail.color);
		});
		colorpicker.current.addEventListener('thickness_changed', e => {
			_lineWidth = (e.detail.thickness < 0.05) ? 1 : e.detail.thickness * 30;
		});

        return () => {
            socket.off('user_id');
            socket.off('draw start');
            socket.off('drawing');
            socket.off('draw stop');
			socket.off('remove current');
			socket.off('get saved bubble');
			socket.off('delete obj');
			socket.off('create shape');
			socket.off('change obj color');
			socket.off('move obj');
			socket.off('scale obj');
			socket.off('rotate obj');
            socket.close();
        };
	}, []);

	function selectPallete(palleteData) {
		colorChanged(palleteData.color);
		colorpicker.current.components.colorpicker.setData(palleteData.color, palleteData.point, palleteData.lightness);
	}

	return (
		<a-scene id="scene" cursor="rayOrigin: mouse" antialias="true">
			<a-sky color="#FFF"></a-sky>

			<a-camera 
				id="camera" 
				wasd-controls="acceleration: 15; fly:true"
				position="0 0 0"
			></a-camera>

			<a-entity
				scribubble
				id="scribubble"
			></a-entity>


			<a-box ref={target} id="target" position="3 0 -3"></a-box>

			<a-entity
				secondary-hand
				oculus-touch-controls="hand: left; model:false"
			>
				<a-circle ref={colorpicker} colorpicker="colorWheel: #colorWheel; lightWheel: #lightWheel; thicknessWheel: #thicknessWheel;" id="colorpicker" color="#a8a8a8" radius="2" opacity="1" scale="0.1 0.1 0.1">
					<a-circle id="colorWheel" position="0 0 0.1" rotation="0 0 0" class="wheels"></a-circle>
					<a-plane id="lightWheel" position="0 -1.1 0.1" width="2" height="0.15" class="wheels"></a-plane>
					<a-triangle id="thicknessWheel" color="#000" position="0 1.1 0.1" vertex-a="-1 0 0" vertex-b="1 -0.1 0" vertex-c="1 0.1 0"></a-triangle>
					<a-plane id="thicknessWheelCol" position="0 1.1 0.11" material="side: double; color: #FFF; transparent: true; opacity: 0"  width="2" height="0.2" class="wheels"></a-plane>
					
					<AddPalleteBT
						posY={0.75 + 0.6}
						buttonColor={"red"}
						clicked={() => {
							setPallete(prev => [...prev, colorpicker.current.components.colorpicker.getData() ])
						}}
					>
					</AddPalleteBT>
					{
						pallete.map((e, idx) => {
							return (
								<Pallete
									posY={0.75 - 0.6 * idx}
									color={e.color}
									clicked={() => {
										selectPallete(e)
									}}
									removed={() => {
										setPallete(prev => {
											prev.splice(idx, 1);
											return [...prev];
										});
									}
								}></Pallete>
							)
						})
					}
				</a-circle>
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

			<a-entity id="raycaster" laser-controls="hand: right;" raycaster="objects: .wheels; lineColor: blue; lineOpacity: 0.5"></a-entity>

			{/* <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E" shadow="" material="" geometry=""></a-sphere>
			<a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D" shadow="" material="" geometry=""></a-cylinder>
			<a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4" shadow="" material="" geometry=""></a-plane> */}
		</a-scene>
	);
};

export default ScribubbleVR;