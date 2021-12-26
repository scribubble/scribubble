import { useEffect, useState, useCallback } from 'preact/hooks';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import TextSprite from '@seregpie/three.text-sprite';

import { createLineGeometry, addPosition, createLineInScene, removeLastLine, getLastLine, getCenterPos } from '../../util/drawLine';
import { refreshMousePosition } from '../../util/mouse';

import RightPanel from '../../components/panel/RightPanel';
import { NavButton } from '../../components/Button';

import io from 'socket.io-client';

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
		this.color = "#FFFFFF";
		this.linewidth = 5;
	}
}

const params = new Params();
const gui = new GUI(  );
gui.domElement.id = 'gui';

window.addEventListener('load', function () {
	gui.addColor(params, 'color').onChange();
	gui.add(params, 'linewidth', 1, 10).onChange();
});

const Scribubble = () => {
	// Three 기본 요소
	let scene, camera, renderer, controls, transformControls, raycaster;

	// 그리고 있는지 여부
	// let isDrawing = false;
	const [isDrawing, setDrawing] = useState(false);


	// 마우스 위치
	let mousePos = new THREE.Vector3();
	
	// 누르거나 누르고있는 키 들
	let keysPressed = {};		// 키 다중 입력 처리용

	// 유저 고유 id
	let user_id = 'aaa';

	// 접속해 있는 유저들의 id와 Tag저장됨
	let nameTag = {};

	function init() {
		scene = new THREE.Scene(); 
		// scene.background = new THREE.Color( 0xEEFFEE );
	
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
		// camera = new THREE.OrthographicCamera(  window.innerWidth / - 2,  window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
		camera.position.set(0, 0, 100);

		renderer = new THREE.WebGLRenderer({ antialias:true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);
	
		controls = new OrbitControls(camera, renderer.domElement);

		const geometry = new THREE.BoxGeometry(10, 10, 10)
		const material = new THREE.MeshNormalMaterial({ transparent: true })
		
		const cube = new THREE.Mesh(geometry, material)
		// cube.position.y = 10;
		// cube.position.z = 2;
		
		scene.add(cube)

		const cube2 = new THREE.Mesh(geometry, material)
		// cube.position.y = 10;
		cube2.position.x = 100;
		
		scene.add(cube2)

		transformControls = new TransformControls(camera, renderer.domElement);
		// transformControls.attach(cube)
		// transformControls.setMode('rotate')
		scene.add(transformControls);
		
		transformControls.addEventListener('dragging-changed', (e) => {
			controls.enabled = !e.value;
		});
		
		raycaster = new THREE.Raycaster();

	}

	function render() {
		requestAnimationFrame(render);

		// console.log(controls);
		controls.update();

		renderer.render(scene, camera);
	}

	function listener() {
		window.addEventListener('resize', () => {
			const width = document.body.clientWidth;
			const height = document.body.clientHeight;
	
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
	
			renderer.setSize(width, height);
		});

		document.addEventListener("mousemove", event => {
			console.log(isDrawing);

			refreshMousePosition(event, camera, scene.position, raycaster, mousePos);
			
			if (isDrawing) {
				// addPosition(user_id, mousePos);
				socket.emit('drawing', {
					user_id: user_id,
					mousePos: {
						x: mousePos.x,
						y: mousePos.y,
						z: mousePos.z,
					}
				});
			}
		});
		
		document.addEventListener("keydown", event => {
			let key = event.key || event.keyCode;

			keysPressed[key] = true;

			if ((key === ' ' || key === 32) && !isDrawing) {
				// isDrawing = true;
				setDrawing(true);
				transformControls.detach();
				
				// controls.enabled = false;
				
				// createLineInScene(user_id, {
				// 	width: params.linewidth,
				// 	color: params.color,
				// 	geo: createLineGeometry(user_id, mousePos)
				// }, scene);

				socket.emit('draw start', {
					user_id: user_id,
					linewidth: params.linewidth,
					color: params.color,
					mousePos: {
						x: mousePos.x,
						y: mousePos.y,
						z: mousePos.z,
					}
				});
			}
			
			if (keysPressed['Control'] && event.key == 'z' && !event.repeat) {
				// removeLastLine(user_id, scene);

				socket.emit('remove current', {
					user_id: user_id
				});
			}

			if (keysPressed['q']) {
				transformControls.setMode('translate');
			} else if (keysPressed['w']) {
				transformControls.setMode('rotate');
			} else if (keysPressed['e']) {
				transformControls.setMode('scale');
			}			

		});

		document.addEventListener("keyup", event => {
			let key = event.key || event.keyCode;
			
			delete keysPressed[key];
		
			if ((key === ' ' || key === 32)) {
				// isDrawing = false;
				setDrawing(false);
				
				let curLine = getLastLine(user_id);
				let curPos = getCenterPos(user_id, curLine);				
				
				let obj = new THREE.Object3D();
				obj.position.x = curPos.x;
				obj.position.y = curPos.y;
				obj.position.z = curPos.z;

				curLine.parent = obj;
				
				curLine.position.x = -curPos.x;
				curLine.position.y = -curPos.y;
				curLine.position.z = -curPos.z;
				
				scene.add(obj);

				transformControls.attach(obj);
			}
		});
	}

	useEffect(() => {
		init();

		listener();
		
		render();

		initSocketListener();

        return () => {
            socket.off('user_id');
            socket.off('draw start');
            socket.off('drawing');
            socket.off('move line');
            socket.off('remove current');
            socket.close();
			// document.removeEventListener('resize', );
			// document.removeEventListener('mousemove', );
			// document.removeEventListener('keydown', );
			// document.removeEventListener('keyup', );
        };
	}, []);

	function initSocketListener() {
        socket.on('user_id', (data) => {
			user_id = data.user_id;
        });

		socket.on('draw start', (data) => {
			createLineInScene(data.user_id, {
				width: data.linewidth,
				color: data.color,
				geo: createLineGeometry(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z))
			}, scene);
				
			if (!nameTag[data.user_id]) {
				nameTag[data.user_id] = new TextSprite({
					text: data.user_id,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 1,
					color: '#ffbbff',
				});	
				scene.add(nameTag[data.user_id]);
			}
			nameTag[data.user_id].position.x = data.mousePos.x;
			nameTag[data.user_id].position.y = data.mousePos.y;
			nameTag[data.user_id].position.z = data.mousePos.z;

		});

        socket.on('drawing', (data) => {
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('move line', (data) => {
			
		});
		
		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, scene);
		});
	}
	
	const changeDrawingState = useCallback(
		() => {
			setDrawing(bf => {
				controls.enabled = bf;
				return !bf
			});
		},
		[controls]
	);

	const [openPanel, setOpenPanel] = useState(false);
	return (
		<div id="Scribubble">
			<div class={style.rightSide}>
				<button class={style.openBT} onClick={() => { setOpenPanel(!openPanel)}}>2D</button>
				{
					openPanel && <RightPanel></RightPanel>
				}
			</div>
			<div class={style.leftSide}>
				<NavButton isActive={isDrawing} onClick={changeDrawingState}>
					그리기
				</NavButton>
			</div>
		</div>
	);
};

export default Scribubble;