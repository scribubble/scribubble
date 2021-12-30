import { h, render, Component } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import TextSprite from '@seregpie/three.text-sprite';

import { createLineGeometry, addPosition, createLineInScene, removeLastLine, getLastLine, getCenterPos } from '../../util/drawLine';
import { refreshMousePosition } from '../../util/mouse';

import RightPanel from '../../components/panel/RightPanel';
// import { ToolButton, ToolColorButton } from '../../components/Button';

import io, { connect } from 'socket.io-client';

import style from './style.css'

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

// javascript:(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

class Params {
	constructor() {
		this.color = "#000000";
		this.linewidth = 5;
	}
}

const params = new Params();
const gui = new GUI();
gui.domElement.id = 'gui';

const MODE = {
    SELECTING: 'SELECTING',
    DRAWING: 'DRAWING',
};

window.addEventListener('load', function () {
	gui.addColor(params, 'color').onChange();
	gui.add(params, 'linewidth', 1, 10).onChange();
});

class Scribubble extends Component {
	state = {
		mode: MODE.SELECTING,
		openPanel: false,
		drawingColor: '#000000'
	};

	constructor() {
		super();
	}

	componentDidMount() {
		this.init();

		this.initListener();
		
		this.initSocketListener();
	}

	componentWillUnmount() {
		this.removeSocketListener();
	}

	init() {
		this.scene = new THREE.Scene(); 
		this.scene.background = new THREE.Color( 0xEEFFEE );
	
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		// camera = new THREE.OrthographicCamera(  window.innerWidth / - 2,  window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
		this.camera.position.set(0, 0, 100);

		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		// document.body.appendChild(this.renderer.domElement);
		this.element.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const geometry = new THREE.BoxGeometry(10, 10, 10)
		const material = new THREE.MeshNormalMaterial({ transparent: true })
		
		const cube = new THREE.Mesh(geometry, material)
		this.scene.add(cube);

		const cube2 = new THREE.Mesh(geometry, material)
		cube2.position.x = 100;
		
		this.scene.add(cube2)

		this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
		this.scene.add(this.transformControls);
		
		this.transformControls.addEventListener('dragging-changed', (e) => {
			if (this.state.mode === MODE.SELECTING)
			this.controls.enabled = !e.value;
		});
		
		this.renderer.render( this.scene, this.camera );

		this.raycaster = new THREE.Raycaster();

		// 그리고 있는지 여부
		this.isDrawing = false;

		// 마우스 위치
		this.mousePos = new THREE.Vector3();

		// 누르거나 누르고있는 키 들
		this.keysPressed = {};		// 키 다중 입력 처리용

		// 유저 고유 id
		this.user_id = 'aaa';

		// 접속해 있는 유저들의 id와 Tag저장됨
		this.nameTag = {};
		
		const animate = () => {
			this.renderer.render(this.scene, this.camera);
			this.controls.update();
			requestAnimationFrame(animate);
		}
		animate();

		// 버블에 저장된 데이터 요청
		let currentBubble = 'room1';
		socket.emit('enter bubble', currentBubble);
	}

	initListener() {
		window.addEventListener('resize', this.windowResize);

		this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
				
		document.addEventListener("keydown", this.keyDown);

		document.addEventListener("keyup", this.keyUp);
	}

	initSocketListener() {
        socket.on('user_id', (data) => {
			this.user_id = data.user_id;
        });

		socket.on('draw start', (data) => {
			createLineInScene(data.user_id, {
				width: data.linewidth,
				color: data.color,
				geo: createLineGeometry(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z))
			}, this.scene);
				
			if (!this.nameTag[data.user_id]) {
				this.nameTag[data.user_id] = new TextSprite({
					text: data.user_id,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 1,
					color: '#ffbbff',
				});	
				this.scene.add(this.nameTag[data.user_id]);
			}
			this.nameTag[data.user_id].position.x = data.mousePos.x;
			this.nameTag[data.user_id].position.y = data.mousePos.y;
			this.nameTag[data.user_id].position.z = data.mousePos.z;

		});

        socket.on('drawing', (data) => {
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('move line', (data) => {
			
		});
		
		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.scene);
		});

		socket.on('get saved bubble', (data) => {
			// console.log(data);

			for(let i = 0; i < data.line.length; i++) {
				let line = data.line[i];
				let pos = line.linePositions;
				let testUserId = data.userid[0]; // 데이터 구조에 오류가 있어서, 라인 작성자를 임시로 설정

				createLineInScene(testUserId, {
					width: line.lineWidth,
					color: line.lineColor,
					geo: createLineGeometry(
						testUserId, 
						new THREE.Vector3(pos[0].x, pos[0].y, pos[0].z))
				}, this.scene);
				
				for(let j = 1; j < pos.length; j++) {
					addPosition(testUserId, new THREE.Vector3(pos[j].x, pos[j].y, pos[j].z));
				}
			}
		});
	}

	removeSocketListener = () => {
		window.removeEventListener('resize', this.windowResize);

		this.renderer.domElement.removeEventListener("mousemove", this.mouseMove);
				
		document.removeEventListener("keydown", this.keyDown);

		document.removeEventListener("keyup", this.keyUp);

		socket.off('user_id');
		socket.off('draw start');
		socket.off('drawing');
		socket.off('move line');
		socket.off('remove current');
		socket.close();
	}

	windowResize = () => {
		const width = document.body.clientWidth;
		const height = document.body.clientHeight;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
	}

	drawStart = () => {
		this.isDrawing = true;
		
		this.transformControls.detach();
		
		// createLineInScene(user_id, {
		// 	width: params.linewidth,
		// 	color: params.color,
		// 	geo: createLineGeometry(user_id, mousePos)
		// }, scene);

		socket.emit('draw start', {
			user_id: this.user_id,
			linewidth: params.linewidth,
			color: this.state.drawingColor,
			mousePos: {
				x: this.mousePos.x,
				y: this.mousePos.y,
				z: this.mousePos.z,
			}
		});
	}

	drawEnd = () => {
		this.isDrawing = false;
		
		let curLine = getLastLine(this.user_id);
		let curPos = getCenterPos(this.user_id, curLine);
		
		let obj = new THREE.Object3D();
		obj.position.x = curPos.x;
		obj.position.y = curPos.y;
		obj.position.z = curPos.z;

		curLine.parent = obj;
		
		curLine.position.x = -curPos.x;
		curLine.position.y = -curPos.y;
		curLine.position.z = -curPos.z;
		
		this.scene.add(obj);

		this.transformControls.attach(obj);
	}


	keyDown = (event) => {
		let key = event.key || event.keyCode;

		this.keysPressed[key] = true;

		if ((key === ' ' || key === 32) && !this.isDrawing) {
			this.drawStart();
		}
		
		if (this.keysPressed['Control'] && event.key == 'z' && !event.repeat) {
			// removeLastLine(user_id, scene);

			socket.emit('remove current', {
				user_id: this.user_id
			});
		}

		if (this.keysPressed['q']) {
			this.transformControls.setMode('translate');
		} else if (this.keysPressed['w']) {
			this.transformControls.setMode('rotate');
		} else if (this.keysPressed['e']) {
			this.transformControls.setMode('scale');
		}			
	}

	keyUp = (event) => {
		let key = event.key || event.keyCode;
		
		delete this.keysPressed[key];
	
		if ((key === ' ' || key === 32) && this.isDrawing) {
			this.drawEnd();
		}
	}

	mouseDown = (e) => {
		if (e.which !== 1) return;

		if (!this.transformControls.dragging)
			this.drawStart();
	}
	mouseMove = (event) => {
		refreshMousePosition(event, this.camera, this.scene.position, this.raycaster, this.mousePos);
		
		if (this.isDrawing) {
			console.log('drawing');
			// addPosition(user_id, mousePos);
			socket.emit('drawing', {
				user_id: this.user_id,
				mousePos: {
					x: this.mousePos.x,
					y: this.mousePos.y,
					z: this.mousePos.z,
				}
			});
		}
	}
	mouseUp = (e) => {
		if (e.which !== 1) return;

		if (this.isDrawing)
			this.drawEnd();
	}

	modeChange = (event, chnageToMode) => {
		if (chnageToMode === MODE.DRAWING && this.state.mode !== MODE.DRAWING) {
			this.setState({ mode: MODE.DRAWING });

			this.controls.enabled = false;

			this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.addEventListener('mouseup',  this.mouseUp);

		} else if (chnageToMode === MODE.DRAWING && this.state.mode === MODE.DRAWING) {
			this.setState({ mode: MODE.SELECTING });
			
			this.controls.enabled = true;

			this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.removeEventListener('mouseup',  this.mouseUp);
		}

	}

	render() {
		return (	
		<div id="Scribubble" ref={el => this.element = el} >
			<div class={style.rightSide}>
				<button class={style.openBT} onClick={() => { this.setState((prev) => ({ openPanel: !prev.openPanel })) }}>2D</button>
				{
					this.state.openPanel && <RightPanel></RightPanel>
				}
			</div>
			<div class={style.leftSide}>
				<div class={style.toolbar}>
					{/* <ToolButton isActive={this.state.mode === MODE.DRAWING} onClick={e => {this.modeChange(e, MODE.DRAWING) }}>
						A
					</ToolButton>
					<ToolColorButton value={this.state.drawingColor} onChange={e => { this.setState({ drawingColor: e.target.value })}}></ToolColorButton> */}
					{/* <input type="color" id="" onchange={e => setColor(e.target.value)} value="#ff0000" style="width:85%;"></input> */}
					
				</div>
			</div>
		</div>
		);
	} 
};

export default Scribubble;