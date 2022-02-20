import { h, render, Component } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import TextSprite from "@seregpie/three.text-sprite";

import {
  createLineGeometry,
  addPosition,
  createLineAndAdd,
  removeLastLine,
  getLastLine,
  getCenterPos,
} from "../../util/drawLine";
import { refreshMousePosition, getCenterPosition, getBasisPosition } from "../../util/position";

import RightPanel from "../../components/panel/RightPanel";
import {
  TextButton,
  ExploreToolButton,
  SelectToolButton,
  EraseToolButton,
  DrawingToolButton,
  ShapeToolButton,
  AddPalleteButton,
  PalleteButton,
  PlaneButton,
  SquareButton,
  SphereButton,
  CylinderButton,
  DashedButton,
  PlusButton,
  MinusButton,
  MoveButton,
  RotateButton,
  ScaleButton,
} from "../../components/Button";
import { ProfileBlock, ProfileSM } from '../../components/Profile';
import { ColorPicker, LengthInput, ZoomInput } from "../../components/Input";
import { ColBar, DivisionLine, RowBottomBar } from "../../components/Bar";

import io, { connect } from "socket.io-client";

import style from "./style.css";
import theme from "../../style/theme"

const server_host = ":4000"; // 로컬
// const server_host = process.env.SERVER_URL; // 배포
// https 로 테스트할때
// const server_host = "";

const socket = io(server_host, {});
// https 로 테스트할때
// const socket = io(server_host, {
// 	// secure:true,
// 	withCredentials: true,
// 	extraHeaders: {
// 	  "my-custom-header": "abcd"
// 	}
// });

const MODE = {
  EXPLORING: "EXPLORING",
  SELECTING: "SELECTING",
  DRAWING: "DRAWING",
  ERASEING: "ERASING",
  SHAPE: "SHAPE",
};

class Scribubble extends Component {
	state = {
		mode: MODE.EXPLORING,
		openPanel: false,
		drawingColor: '#000000',
		linewidth: 1,
		lineDashed: false,
		pallete: [],
		zoom: 1,
		tfcMode: 'translate',
		userList: []
	};

	constructor() {
		super();
	}

	componentDidMount() {
		this.init();

		this.initListener();
		
		this.initSocketListener();

		// 데이터 24시간 유지 안내
		// setTimeout(() => { 
		// 	alert('This site is available for 24hour');
		// }, 1000);
	}

	componentWillUnmount() {
		this.removeSocketListener();
	}

	init() {
		this.scene = new THREE.Scene(); 
		this.scene.background = new THREE.Color( 0xFFFFFF );
	
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 10000);
		this.camera.position.set(0, 0, 1);

		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.element.appendChild(this.renderer.domElement);

		// 도형 생성시 입체표현을 위한 빛 추가
		this.scene.add( new THREE.AmbientLight( 0x404040 ));
		const light = new THREE.PointLight( 0xffffff, 1.5 );
		light.position.set( 0, 500, 3000 );
		this.scene.add( light );

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		
		this.scaleVector = new THREE.Vector3();

		document.addEventListener('mousewheel', (e) => {
			this.setState({ zoom:  this.controls.getDistance() });
		})
		this.controls.addEventListener('change', (e) => {
			this.nametagEntity.children.forEach((nt) => {
				var scale = this.scaleVector.subVectors(nt.position, this.camera.position).length() / 70;
				nt.scale.set(scale, scale, 1);
			});
		})
		
		this.controls.maxDistance = 10;

		// 다른 오브젝트들의 부모가 될 상위 오브젝트 (line 및 도형 등 선택이 가능한 오브젝트들의 부모)
		this.objEntity = new THREE.Object3D();
		this.scene.add(this.objEntity);
		// 네임 태그들의 부모가 될 상위 오브젝트
		this.nametagEntity = new THREE.Object3D();
		this.scene.add(this.nametagEntity);

		// 선택모드 시 선택될 수 있는 오브젝트 위치를 보여줄 오브젝트
		const sphGeometry = new THREE.SphereGeometry( 0.1 );
		const sphMaterial = new THREE.MeshBasicMaterial( { color: theme.secondary } );
		this.sphereInter = new THREE.Mesh( sphGeometry, sphMaterial );
		this.sphereInter.visible = false;
		this.scene.add( this.sphereInter );

		this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
		this.scene.add(this.transformControls);
		
		this.transformControls.addEventListener('dragging-changed', (e) => {
			if (this.state.mode === MODE.SELECTING) 
			this.controls.enabled = !e.value;
		});

		this.transformControls.addEventListener('objectChange', (e) => {
			let msg = '';
			let data = {
				bubbleName: this.bubbleName,
				objName: this.targetObj.name
			};

			if (this.transformControls.mode === 'translate') {
				msg = 'move obj';
				if (this.targetObj.type === 'Line2') {
					data.tfcPosition = getBasisPosition(this.targetObj.parent.position);
				} else {
					data.position = getBasisPosition(this.targetObj.position);
				}
			} else if (this.transformControls.mode === 'rotate') {
				msg = 'rotate obj';
				if (this.targetObj.type === 'Line2') {
					data.rotation = getBasisPosition(this.targetObj.parent.rotation);
				} else {
					data.rotation = getBasisPosition(this.targetObj.rotation);
				}
			} else if (this.transformControls.mode === 'scale') {
				msg = 'scale obj';
				if (this.targetObj.type === 'Line2') {
					data.scale = getBasisPosition(this.targetObj.parent.scale);
				} else {
					data.scale = getBasisPosition(this.targetObj.scale);
				}
			}
			socket.emit(msg, data);
		});
		
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
		this.renderer.render( this.scene, this.camera );

		this.raycaster = new THREE.Raycaster();

		// 그리고 있는지 여부
		this.isDrawing = false;

		// 마우스 위치
		this.mousePos = new THREE.Vector3();

		// 누르거나 누르고있는 키 들
		this.keysPressed = {};		// 키 다중 입력 처리용

		// 유저 고유 id
		this.user_id = '(unknown)';
		this.user_nickname = '(unknown)';

		// 참여한 버블 이름
		this.bubbleName = 'room1';

		// 접속해 있는 유저들의 id와 Tag저장됨
		this.nameTag = {};

		// 타겟팅 중인 오브젝트
		this.targetObj = null;

		// 다음에 생성할 오브젝트의 인덱스
		this.objIdx = 0;
		// console.log(this.objIdx);
		
		const animate = () => {
			this.renderer.render(this.scene, this.camera);
			this.controls.update();
			requestAnimationFrame(animate);
		}
		animate();
	}

	initListener() {
		window.addEventListener('resize', this.windowResize);

		this.renderer.domElement.addEventListener("mousemove", this.mouseMove);
				
		document.addEventListener("keydown", this.keyDown);

		document.addEventListener("keyup", this.keyUp);
	}

	initSocketListener() {
		// 버블에 저장된 데이터 요청
		const currentBubble = this.bubbleName;
		socket.emit('enter bubble', currentBubble);

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

			if (!this.nameTag[data.user_id]) {
				const nametagText = new TextSprite({
					text: data.user_nickname,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 1,
					color: theme.primary,
					backgroundColor: theme.surface,
				});
				
				const nametag = new THREE.Object3D();
				nametag.add(nametagText);

				var scale = this.scaleVector.subVectors(nametag.position, this.camera.position).length() / 70;
				nametag.scale.set(scale, scale, 1);

				this.nameTag[data.user_id] = nametag;
				this.nametagEntity.add(this.nameTag[data.user_id]);
			}
			this.nameTag[data.user_id].position.copy(data.mousePos);

		});

        socket.on('drawing', (data) => {
			// console.log('drawing');
			addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
        });

		socket.on('draw stop', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);
			target.parent.position.copy(data.tfcPosition);
			target.position.copy(data.position);
			target.type = 'Line2';
		});
		
		socket.on('remove current', (data) => {
			removeLastLine(data.user_id, this.scene);
		});

		socket.on('get saved bubble', (data) => {
			// console.log(`get saved bubble ${data}`);
			// console.log(data.lines);

			// 라인
			for(let i = 0; i < data.lines.length; i++) {
				let line = data.lines[i];
				// console.log(';', line);
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
				
				for(let j = 1; j < linePos.length; j++) {
					addPosition(line.drawer_id, new THREE.Vector3(linePos[j].x, linePos[j].y, linePos[j].z));
				}
				let curLine = getLastLine(line.drawer_id);
				
				curLine.parent.position.set(line.tfcPosition.x, line.tfcPosition.y, line.tfcPosition.z);
				curLine.position.set(line.position.x, line.position.y, line.position.z);
				curLine.parent.rotation.set(line.tfcRotation.x, line.tfcRotation.y, line.tfcRotation.z);
				curLine.parent.scale.set(line.tfcScale.x, line.tfcScale.y, line.tfcScale.z);
			}

			// 도형
			for(let i = 0; i < data.shapes.length; i++) {
				let item = data.shapes[i];
				this.createShape(item.shape, {
					objName: item.objName, 
					color: item.color, 
					position: item.position, 
					rotation: item.rotation, 
					scale: item.scale
				});
			}

			socket.on('drawing', (data) => {
				// console.log('drawing');
				addPosition(data.user_id, new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z));
			});
		});

		socket.on("delete obj", (data) => {
			let obj = this.objEntity.getObjectByName(data.objName)
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
			// console.log(data);
			const target = this.objEntity.getObjectByName(data.objName);
			// console.log(target);
			target.material.color = new THREE.Color(data.color);
		});

		socket.on('move obj', (data) => {
			const target = this.objEntity.getObjectByName(data.objName);
			// console.log(target);
			if(data.tfcPosition) {
				target.parent.position.set(data.tfcPosition.x, data.tfcPosition.y, data.tfcPosition.z); 
			} else {
				target.position.set(data.position.x, data.position.y, data.position.z); 
			}
		});

		socket.on('scale obj', (data) => {
			// console.log(data);
			const target = this.objEntity.getObjectByName(data.objName);

			if (target.type === 'Line2') {
				target.parent.scale.set(data.scale.x, data.scale.y, data.scale.z);
			} else {
				target.scale.set(data.scale.x, data.scale.y, data.scale.z);
			}
		});

		socket.on('rotate obj', (data) => {
			// console.log(data);
			const target = this.objEntity.getObjectByName(data.objName);
			
			if (target.type === 'Line2') {
				target.parent.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
			} else {
				target.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
			}
		});

		socket.on('user enter', (data) => {
			this.setState({ userList: [ ...this.state.userList, {
				user_id: data.user_id,
				user_nickname: data.user_nickname
			}]});
		});
		socket.on('user list', (data) => {
			this.setState({ userList: [ ...this.state.userList, ...data.userList]});
		})
		socket.on('user exit', (data) => {
			this.setState({
				userList: this.state.userList.filter(user => user.user_id != data.user_id)
			});
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
		socket.off('draw stop');
		socket.off('create shape');
		socket.off('change obj color');
		socket.off('move obj');
		socket.off('rotate obj');
		socket.off('scale obj');
		socket.off('delete obj');
		socket.off('remove current');
		socket.off('get saved bubble');
		socket.off('user enter');
		socket.off('user list');
		socket.off('user exit');
		
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
			bubbleName: this.bubbleName,
			user_id: this.user_id,
			user_nickname: this.user_nickname,
			linewidth: this.state.linewidth,
			color: this.state.drawingColor,
			dashed: this.state.lineDashed,
			objName: this.user_id + this.objIdx,
			mousePos: getBasisPosition(this.mousePos)
		});

		this.objIdx++;
	}

	drawStop = () => {
		this.isDrawing = false;
		
		let curLine = getLastLine(this.user_id);
		let curPos = getCenterPos(curLine);

		// curLine.parent.position.copy(curPos);
		// curLine.position.copy(curPos.negate());
		// this.transformControls.attach(obj);

		// console.log(`draw stop ${this.bubbleName}`);
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
	}

	/**
	 * 현재 target 오브젝트 삭제
	 */
	deleteTargetObject = () => {
		if (!this.targetObj)
			return;

		this.transformControls.detach();
		
		if (this.targetObj.type === 'Line2') {
			this.objEntity.remove(this.targetObj.parent);
		}
		this.objEntity.remove(this.targetObj);

		socket.emit("delete obj", {
			bubbleName: this.bubbleName, 
			objName: this.targetObj.name
		});
		
		this.targetObj = null;
		this.setState({ mode: MODE.EXPLORING });
	}

	keyDown = (event) => {
		let key = event.key || event.keyCode;

		this.keysPressed[key] = true;

		if (event.repeat)
			return;

		// 스페이브바 입력해서 그리기 시작
		if ((key === ' ' || key === 32) && !this.isDrawing) {
			this.drawStart();
		}
		
		// Control + Z, 뒤로가기
		if (this.keysPressed['Control'] && event.key == 'z') {
			// removeLastLine(user_id, scene);

			socket.emit('remove current', {
				user_id: this.user_id
			});
		}
		
		// 타겟팅 중인 오브젝트 삭제
		if (this.keysPressed['Delete']) {
			this.deleteTargetObject();
		}

		if (this.keysPressed['q']) {
			this.setTFCMode('translate');
		} else if (this.keysPressed['w']) {
			this.setTFCMode('rotate');
		} else if (this.keysPressed['e']) {
			this.setTFCMode('scale');
		}
	}
	keyUp = (event) => {
		let key = event.key || event.keyCode;
		
		delete this.keysPressed[key];
	
		if ((key === ' ' || key === 32) && this.isDrawing) {
			this.drawStop();
		}
	}

	mouseDown = (e) => {
		if (e.which !== 1) return;

		// 오브젝트를 선택했다면 해당 오브젝트를 targetObj 로 변경
		if (!this.transformControls.dragging && this.sphereInter.visible) {
			this.targetObj = this.selectingObj;
			if (this.targetObj.type !== 'Line2Drawing') {
				this.transformControls.attach(
					this.targetObj.type === 'Line2' ?
						this.targetObj.parent:
						this.targetObj
				);
			}
			this.setState({ drawingColor: '#' + this.targetObj.material.color.getHexString() });
		}


		// 그리기 모드일시 그리기 시작
		if (!this.transformControls.dragging && this.state.mode === MODE.DRAWING)
			this.drawStart();
	}

	mouseMove = (event) => {
		// mosePos 위치 갱신
		refreshMousePosition(event, this.camera, this.scene.position, this.raycaster, this.mousePos);

		// 선택모드일시 충돌된 오브젝트를 확인할 수 있게 보여주며 targetObj로 변경될 수 있게 대기상태(selectingObj)로 둠
		if (this.state.mode === MODE.SELECTING) {
			const intersects = this.raycaster.intersectObjects(this.objEntity.children, true);
			if (intersects.length > 0) {
				this.sphereInter.visible = true;
				this.sphereInter.position.copy(intersects[0].point);
				this.selectingObj = intersects[0].object;
			} else {
				this.sphereInter.visible = false;
			}
		}
		
		// 그리는 중일때 해당 좌표를 선에 추가
		if (this.isDrawing) {
			// addPosition(user_id, mousePos);
			socket.emit('drawing', {
				bubbleName: this.bubbleName,
				objName: getLastLine(this.user_id).name,
				user_id: this.user_id,
				mousePos: getBasisPosition(this.mousePos)
			});
		}
	}
	mouseUp = (e) => {
		if (e.which !== 1) return;

		if (this.isDrawing)
			this.drawStop();
	}

	/**
	 * 모드 변경하기
	 * @param {MODE} modeChangeTo 변경할 모드
	 */
	modeChange = (modeChangeTo) => {
		if (this.state.mode === modeChangeTo)
			return;

		// 선택 모드 해제
		if (this.state.mode === MODE.SELECTING && modeChangeTo !== MODE.SELECTING) {
			this.transformControls.detach();
			this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
		}
		// 그림 모드 해제
		else if ((this.state.mode === MODE.DRAWING && modeChangeTo !== MODE.DRAWING)) {
			this.controls.enabled = true;

			this.renderer.domElement.removeEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.removeEventListener('mouseup',  this.mouseUp);
		}

		// 다른 모드 중 그림 모드로 변경할 때
		if (modeChangeTo === MODE.DRAWING) {
			this.controls.enabled = false;

			this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
			this.renderer.domElement.addEventListener('mouseup',  this.mouseUp);
		}
		// 선택 모드
		else if (modeChangeTo === MODE.SELECTING) {
			this.renderer.domElement.addEventListener('mousedown', this.mouseDown);
		}

		this.setState({ mode: modeChangeTo });
	}

	/**
	 * 화면 중앙에 도형 생성
	 * @param {String} shape 생성할 도형 이름
	 * @param {Obejct} shape 생성할 도형 속성들
	 */
	createShape = (shape, shapeAttribute) => {
		if(shapeAttribute === null) { // 내가 그린 경우
			const material = new THREE.MeshPhongMaterial( { color: this.state.drawingColor, shininess: 0 } );

			let geometry, shapeObj;

			if (shape === 'SQUARE') {
				geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
			} else if (shape === 'SPHERE') {
				geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
			} else if (shape === 'CYLINDER') {
				geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.1, 36 );
			} else if (shape === 'PLANE') {
				geometry = new THREE.PlaneGeometry( 0.1, 0.1 );
				material.side = THREE.DoubleSide;
			}

			shapeObj = new THREE.Mesh(geometry, material);
			shapeObj.position.copy(getCenterPosition(this.camera, this.scene.position, this.raycaster));

			let newObjName = this.user_id + this.objIdx;
			this.objIdx++;
			shapeObj.name = newObjName;

			this.objEntity.add( shapeObj );

			socket.emit('create shape', {
				bubbleName: this.bubbleName,
				shape: shape, 
				color: this.state.drawingColor,
				objName: newObjName, 
				position: getBasisPosition(shapeObj.position),
				rotation: getBasisPosition(shapeObj.rotation),
				scale: getBasisPosition(shapeObj.scale)
			});
		} else { // 타인이 그린 경우, 저장된 데이터로 그리는 경우
			const material = new THREE.MeshPhongMaterial( { color: shapeAttribute.color, shininess: 0 } );

			let geometry, shapeObj;

			if (shape === 'SQUARE') {
				geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
			} else if (shape === 'SPHERE') {
				geometry = new THREE.SphereGeometry( 0.1, 32, 16 );
			} else if (shape === 'CYLINDER') {
				geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.1, 36 );
			} else if (shape === 'PLANE') {
				geometry = new THREE.PlaneGeometry( 0.1, 0.1 );
				material.side = THREE.DoubleSide;
			}

			shapeObj = new THREE.Mesh(geometry, material);

			const pos = shapeAttribute.position;
			shapeObj.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z));

			const scale = shapeAttribute.scale;
			shapeObj.scale.set(scale.x, scale.y, scale,z);

			const rotation = shapeAttribute.rotation;
			shapeObj.rotation.set(rotation.x, rotation.y, rotation.z);

			shapeObj.name = shapeAttribute.objName;

			this.objEntity.add( shapeObj );
		}
	}

	zoomControl = (diff) => {
		const wheelEvt = document.createEvent('MouseEvents');
		wheelEvt.initEvent('wheel', true, true);
		wheelEvt.deltaY = diff;
		this.renderer.domElement.dispatchEvent(wheelEvt);
  
		this.setState({ zoom:  this.controls.getDistance() });  
	}

	setTFCMode = mode => {
		this.setState({ tfcMode : mode });
		this.transformControls.setMode(mode);
	}

	render() {
		return (	
		<div id="Scribubble" ref={el => this.element = el} >
			<div class={style.rightSide}>
				<div class={style.rightSideUI}>
					<div style="display: flex;">
						<ProfileBlock>
							{
								this.state.userList.map(user => {
									return <ProfileSM>{user.user_nickname}</ProfileSM>
								})
							}
						</ProfileBlock>
						<TextButton onClick={() => { this.setState((prev) => ({ openPanel: !prev.openPanel })) }}>
						</TextButton>
					</div>
					{/* <TextButton onClick={() => { this.setState((prev) => ({ openPanel: !prev.openPanel })) }}>
					</TextButton> */}
					<RowBottomBar>
						<MinusButton onClick={() => this.zoomControl(-0.01)}></MinusButton>
						<ZoomInput value={this.state.zoom} min={0} max={10} step={0.01}></ZoomInput>
						<PlusButton onClick={() => this.zoomControl(0.01)}></PlusButton>
					</RowBottomBar>
				</div>
				{/* {
					this.state.openPanel && <RightPanel></RightPanel>
				} */}
			</div>
			<div class={style.leftSide}>
				<ColBar>
					<ExploreToolButton
						onClick={e => { this.modeChange(MODE.EXPLORING) }}
						isActive={this.state.mode === MODE.EXPLORING}
					></ExploreToolButton>

					<SelectToolButton
						onClick={e => { this.modeChange(MODE.SELECTING) }}
						isActive={this.state.mode === MODE.SELECTING}
					></SelectToolButton>
					
					<DrawingToolButton
						isActive={this.state.mode === MODE.DRAWING}
						onClick={e => { this.modeChange(MODE.DRAWING) }}
					></DrawingToolButton>
					
					<EraseToolButton
						onClick={e => { this.deleteTargetObject() }}
						disabled={ !this.targetObj }
					></EraseToolButton>
					
					<ShapeToolButton
						isActive={this.state.mode === MODE.SHAPE}
						onClick={e => { this.modeChange(MODE.SHAPE) }}
					></ShapeToolButton>

					<ColorPicker
						value={this.state.drawingColor}
						onChange={e => { 
							this.setState({ drawingColor: e.target.value });
							if (this.targetObj) {
								this.targetObj.material.color = new THREE.Color(e.target.value);
								socket.emit('change obj color', {
									bubbleName: this.bubbleName,
									objName: this.targetObj.name, 
									objType: this.targetObj.type,
									color: e.target.value,
								});
							}
						}}
					></ColorPicker>

					<DivisionLine></DivisionLine>

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

									if (this.targetObj)
										this.targetObj.material.color = new THREE.Color(color);
								}}
							></PalleteButton>
						)
					}
				</ColBar>
				{
					this.state.mode === MODE.DRAWING &&
					<ColBar>
						<DashedButton
							onClick={e => {
								this.setState(prev => ({ lineDashed: !prev.lineDashed }))
							}}
							isActive={ this.state.lineDashed }
						>
						</DashedButton>
						
						<LengthInput
							value={this.state.linewidth}
							onChange={e => { this.setState({ linewidth: e.target.value })}}
							step="0.5" min="1" max="10"
						></LengthInput>
				</ColBar>
        		}
				{
					this.state.mode === MODE.SHAPE &&
					<ColBar>
						<SquareButton onClick={e => { this.createShape('SQUARE', null) }}></SquareButton>
						<SphereButton onClick={e => { this.createShape('SPHERE', null) }}></SphereButton>
						<CylinderButton onClick={e => { this.createShape('CYLINDER', null) }}></CylinderButton>
						<PlaneButton onClick={e => { this.createShape('PLANE', null) }}></PlaneButton>
					</ColBar>
				}
				{
					this.state.mode === MODE.SELECTING &&
					<ColBar>
						<MoveButton isActive={this.state.tfcMode === 'translate'} onClick={e => { this.setTFCMode('translate'); }}></MoveButton>
						<RotateButton isActive={this.state.tfcMode === 'rotate'} onClick={e => { this.setTFCMode('rotate'); }}></RotateButton>
						<ScaleButton isActive={this.state.tfcMode === 'scale'} onClick={e => { this.setTFCMode('scale'); }}></ScaleButton>
					</ColBar>
				}
			</div>
		</div>
		);
	} 
};

export default Scribubble;