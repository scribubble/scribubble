import { h, render, Component } from 'preact';
import { useEffect, useState, useCallback } from 'preact/hooks';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import TextSprite from '@seregpie/three.text-sprite';

import { createLineGeometry, addPosition, createLineInScene, removeLastLine, getLastLine, getCenterPos } from '../../util/drawLine';
import { refreshMousePosition } from '../../util/mouse';

import RightPanel from '../../components/panel/RightPanel';
import { TextButton, ExploreToolButton, SelectToolButton, EraseToolButton, DrawingToolButton, AddPalleteButton, PalleteButton } from '../../components/Button';
import { ColorPicker, ColorInput, LengthInput } from '../../components/Input';

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

const MODE = {
	EXPLORING: 'EXPLORING',
    SELECTING: 'SELECTING',
    DRAWING: 'DRAWING',
	ERASEING: 'ERASING'
};

class Scribubble extends Component {
	state = {
		mode: MODE.EXPLORING,
		openPanel: false,
		drawingColor: '#000000',
		linewidth: 1,
		pallete: [
		]
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
		this.scene.background = new THREE.Color( 0xFFFFFF );
	
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 10000);
		// camera = new THREE.OrthographicCamera(  window.innerWidth / - 2,  window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
		this.camera.position.set(0, 0, 1);

		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		// document.body.appendChild(this.renderer.domElement);
		this.element.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		this.objEntity = new THREE.Object3D();
		this.scene.add(this.objEntity);

		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshBasicMaterial( {color: 0x4CC3D9} );
		const cube = new THREE.Mesh( geometry, material );
		cube.position.x = -1;
		cube.position.y = 0.5;
		cube.position.z = -3;
		cube.rotation.x = 0;
		cube.rotation.y = 45;
		cube.rotation.z = 0;
		this.objEntity.add( cube );
		const geometry2 = new THREE.SphereGeometry( 1.25, 36, 18 );
		const material2 = new THREE.MeshBasicMaterial( { color: 0xEF2D5E } );
		const sphere = new THREE.Mesh( geometry2, material2 );
		sphere.position.x = 0;
		sphere.position.y = 1.25;
		sphere.position.z = -5;
		this.objEntity.add( sphere );
		const geometry3 = new THREE.CylinderGeometry( 0.5, 0.5, 1.5, 36 );
		const material3 = new THREE.MeshBasicMaterial( {color: 0xFFC65D } );
		const cylinder = new THREE.Mesh( geometry3, material3 );
		cylinder.position.x = 1;
		cylinder.position.y = 0.75;
		cylinder.position.z = -3;
		this.objEntity.add( cylinder );
		const geometry4 = new THREE.PlaneGeometry( 4, 4 );
		const material4 = new THREE.MeshBasicMaterial( {color: 0x7BC8A4, side: THREE.DoubleSide} );
		const plane = new THREE.Mesh( geometry4, material4 );
		plane.position.x = 0;
		plane.position.y = 0;
		plane.position.z = -4;
		plane.rotation.x = 55;
		plane.rotation.y = 0;
		plane.rotation.z = 0;
		this.objEntity.add( plane );

		const sphGeometry = new THREE.SphereGeometry( 0.1 );
		const sphMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
		this.sphereInter = new THREE.Mesh( sphGeometry, sphMaterial );
		this.sphereInter.visible = false;
		this.scene.add( this.sphereInter );

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
			}, this.objEntity);
				
			if (!this.nameTag[data.user_id]) {
				this.nameTag[data.user_id] = new TextSprite({
					text: data.user_id,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 1,
					color: '#ffbbff',
				});	
				this.scene.add(this.nameTag[data.user_id]);
			}
			this.nameTag[data.user_id].position.copy(data.mousePos);

		});

        socket.on('drawing', (data) => {
			// console.log(this.camera.position);
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('move line', (data) => {
			
		});
		
		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.scene);
		});

		socket.on('get saved bubble', (data) => {
			console.log(data);

			console.log(data.line.length);

			for(let i = 0; i < data.line.length; i++) {
				let line = data.line[i];
				console.log(';', line);
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
		socket.off('get saved bubble');
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
			linewidth: this.state.linewidth,
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
		obj.position.copy(curPos);

		curLine.parent = obj;
		curLine.position.copy(curPos.negate());
		
		this.objEntity.add(obj);

		// this.transformControls.attach(obj);
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
		} else if(this.keysPressed['s']) {
			socket.emit('save bubble', {userid: this.user_id});
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

		if (!this.transformControls.dragging && this.sphereInter.visible) {
			this.transformControls.attach(
				this.intersects[0].object.type === 'Line2' ?
					this.intersects[0].object.parent:
					this.intersects[0].object
			);			
		}

		if (!this.transformControls.dragging && this.state.mode === MODE.DRAWING)
			this.drawStart();
	}
	mouseMove = (event) => {
		refreshMousePosition(event, this.camera, this.scene.position, this.raycaster, this.mousePos);

		if (this.state.mode === MODE.SELECTING) {
			this.intersects = this.raycaster.intersectObjects(this.objEntity.children, true);
			if (this.intersects.length > 0) {
				this.sphereInter.visible = true;
				this.sphereInter.position.copy(this.intersects[0].point);
			} else {
				this.sphereInter.visible = false;
			}
		}
		
		if (this.isDrawing) {
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

	modeChange = (event, modeChangeTo) => {
		if (this.state.mode === modeChangeTo)
			return;

		// 선택 모드 해제
		if (this.state.mode === MODE.SELECTING && modeChangeTo !== MODE.SELECTING) {
			this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
		}
		// 그림 모드 해제
		else if ((this.state.mode === MODE.DRAWING && modeChangeTo !== MODE.DRAWING)) {
			// this.setState({ mode: modeChangeTo });

			this.controls.enabled = true;

			this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.removeEventListener('mouseup',  this.mouseUp);
			
			// return;
		}

		// 다른 모드 중 그림 모드로 변경할 때
		if (modeChangeTo === MODE.DRAWING) {
			// this.setState({ mode: MODE.DRAWING });

			this.controls.enabled = false;

			this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.addEventListener('mouseup',  this.mouseUp);
			
			// return;
		}		
		// 선택 모드
		else if (modeChangeTo === MODE.SELECTING) {
			this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
		}

		this.setState({ mode: modeChangeTo });
	}

	render() {
		return (	
		<div id="Scribubble" ref={el => this.element = el} >
			<div class={style.rightSide}>
				<TextButton onClick={() => { this.setState((prev) => ({ openPanel: !prev.openPanel })) }}>

				</TextButton>
				{/* <button class={style.openBT} onClick={() => { this.setState((prev) => ({ openPanel: !prev.openPanel })) }}>
					<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-vocabulary" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
						<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
						<path d="M10 19h-6a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1h6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2z" />
						<path d="M12 5v16" />
						<path d="M7 7h1" />
						<path d="M7 11h1" />
						<path d="M16 7h1" />
						<path d="M16 11h1" />
						<path d="M16 15h1" />
					</svg>
				</button> */}
				{
					this.state.openPanel && <RightPanel></RightPanel>
				}
			</div>
			<div class={style.leftSide}>
				<div class={style.toolbar}>
					<ExploreToolButton
						onClick={e => { this.modeChange(e, MODE.EXPLORING) }}
						isActive={this.state.mode === MODE.EXPLORING}
					></ExploreToolButton>

					<SelectToolButton
						onClick={e => { this.modeChange(e, MODE.SELECTING) }}
						isActive={this.state.mode === MODE.SELECTING}
					></SelectToolButton>
					
					<DrawingToolButton
						isActive={this.state.mode === MODE.DRAWING}
						onClick={e => { this.modeChange(e, MODE.DRAWING) }}
					></DrawingToolButton>
					
					<EraseToolButton
						isActive={this.state.mode === MODE.ERASEING}
						onClick={e => { this.modeChange(e, MODE.ERASEING) }}
					></EraseToolButton>					
				</div>
				{
					this.state.mode === MODE.DRAWING &&
					<div class={style.subbar}>
						<ColorPicker
							value={this.state.drawingColor}
							onChange={e => { this.setState({ drawingColor: e.target.value })}}
						></ColorPicker>
						
						<LengthInput
							value={this.state.linewidth}
							onChange={e => { this.setState({ linewidth: e.target.value })}}
							step="0.5" min="1" max="10"
						></LengthInput>

						<div
							style="background: #c9c9c9; width: 50%; height: .125rem;"
						></div>

						<AddPalleteButton
							onClick={e => { this.setState(prev => ({ pallete: [this.state.drawingColor, ...prev.pallete]})) }}>
						</AddPalleteButton>

						{
							this.state.pallete.map((color, idx) => 
								<PalleteButton
									color={color}
									selecting={this.state.drawingColor === color}
									onClick={e => {
										if (this.state.drawingColor === color) {
											let arr = [...this.state.pallete];
											arr.splice(idx, 1);
											this.setState({ pallete: arr });
										} else {
											this.setState({ drawingColor: color });
										}
									}}
								></PalleteButton>
							)
						}
					</div>
				}
			</div>
		</div>
		);
	} 
};

export default Scribubble;