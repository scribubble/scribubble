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
import { refreshMousePosition, getCenterPosition } from "../../util/position";

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
} from "../../components/Button";
import { ColorPicker, LengthInput, ZoomInput } from "../../components/Input";
import { ColBar, DivisionLine, RowBottomBar } from "../../components/Bar";

import io, { connect } from "socket.io-client";

import style from "./style.css";

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
    drawingColor: "#000000",
    linewidth: 1,
    lineDashed: false,
    pallete: [],
    zoom: 3,
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
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.001,
      10000
    );
    this.camera.position.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.element.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    document.addEventListener("mousewheel", (e) => {
      console.log(this.controls.getDistance());

      this.setState({ zoom: this.controls.getDistance() });
    });
    this.controls.addEventListener("change", (e) => {
      console.log("AA", this.camera.position.z);
    });

    this.controls.maxDistance = 10;

    // 다른 오브젝트들의 부모가 될 상위 오브젝트 (line 및 도형 등 선택이 가능한 오브젝트들의 부모)
    this.objEntity = new THREE.Object3D();
    this.scene.add(this.objEntity);
    console.log("@@@@@@@@", this.controls.getDistance());

    // 선택모드 시 선택될 수 있는 오브젝트 위치를 보여줄 오브젝트
    const sphGeometry = new THREE.SphereGeometry(0.1);
    const sphMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.sphereInter = new THREE.Mesh(sphGeometry, sphMaterial);
    this.sphereInter.visible = false;
    this.scene.add(this.sphereInter);

    this.transformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.scene.add(this.transformControls);

    this.transformControls.addEventListener("dragging-changed", (e) => {
      if (this.state.mode === MODE.SELECTING) this.controls.enabled = !e.value;
    });

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x4cc3d9 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = -1;
    cube.position.y = 0.5;
    cube.position.z = -3;
    cube.rotation.x = 0;
    cube.rotation.y = 45;
    cube.rotation.z = 0;
    this.objEntity.add(cube);
    const geometry2 = new THREE.SphereGeometry(1.25, 36, 18);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xef2d5e });
    const sphere = new THREE.Mesh(geometry2, material2);
    sphere.position.x = 0;
    sphere.position.y = 1.25;
    sphere.position.z = -5;
    this.objEntity.add(sphere);
    const geometry3 = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 36);
    const material3 = new THREE.MeshBasicMaterial({ color: 0xffc65d });
    const cylinder = new THREE.Mesh(geometry3, material3);
    cylinder.position.x = 1;
    cylinder.position.y = 0.75;
    cylinder.position.z = -3;
    this.objEntity.add(cylinder);
    const geometry4 = new THREE.PlaneGeometry(4, 4);
    const material4 = new THREE.MeshBasicMaterial({
      color: 0x7bc8a4,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry4, material4);
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = -4;
    plane.rotation.x = 55;
    plane.rotation.y = 0;
    plane.rotation.z = 0;
    this.objEntity.add(plane);
    this.renderer.render(this.scene, this.camera);

    this.raycaster = new THREE.Raycaster();

    // 그리고 있는지 여부
    this.isDrawing = false;

    // 마우스 위치
    this.mousePos = new THREE.Vector3();

    // 누르거나 누르고있는 키 들
    this.keysPressed = {}; // 키 다중 입력 처리용

    // 유저 고유 id
    this.user_id = "aaa";

    // 접속해 있는 유저들의 id와 Tag저장됨
    this.nameTag = {};

    // 타겟팅 중인 오브젝트
    this.targetObj = null;

    const animate = () => {
      this.renderer.render(this.scene, this.camera);
      this.controls.update();
      requestAnimationFrame(animate);
    };
    animate();
  }

  initListener() {
    window.addEventListener("resize", this.windowResize);

    this.renderer.domElement.addEventListener("mousemove", this.mouseMove);

    document.addEventListener("keydown", this.keyDown);

    document.addEventListener("keyup", this.keyUp);
  }

  initSocketListener() {
    // 버블에 저장된 데이터 요청
    const currentBubble = "room1";
    socket.emit("enter bubble", currentBubble);

    socket.on("user_id", (data) => {
      this.user_id = data.user_id;
    });

    socket.on("draw start", (data) => {
      createLineAndAdd(
        data.user_id,
        {
          width: data.linewidth,
          color: data.color,
          dashed: data.dashed,
          geo: createLineGeometry(
            data.user_id,
            new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z)
          ),
        },
        this.objEntity
      );

      if (!this.nameTag[data.user_id]) {
        this.nameTag[data.user_id] = new TextSprite({
          text: data.user_id,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 1,
          color: "#ffbbff",
        });
        this.scene.add(this.nameTag[data.user_id]);
      }
      this.nameTag[data.user_id].position.copy(data.mousePos);
    });

    socket.on("drawing", (data) => {
      addPosition(
        data.user_id,
        new THREE.Vector3(data.mousePos.x, data.mousePos.y, data.mousePos.z)
      );
    });

    socket.on("move line", (data) => {});

    socket.on("remove current", (data) => {
      removeLastLine(data.user_id, this.scene);
    });

    socket.on("get saved bubble", (data) => {
      console.log(data);

      console.log(data.line.length);

      for (let i = 0; i < data.line.length; i++) {
        let line = data.line[i];
        console.log(";", line);
        let pos = line.linePositions;
        let testUserId = data.userid[0]; // 데이터 구조에 오류가 있어서, 라인 작성자를 임시로 설정

        createLineAndAdd(
          testUserId,
          {
            width: line.lineWidth,
            color: line.lineColor,
            dashed: line.dashed,
            geo: createLineGeometry(
              testUserId,
              new THREE.Vector3(pos[0].x, pos[0].y, pos[0].z)
            ),
          },
          this.scene
        );

        for (let j = 1; j < pos.length; j++) {
          addPosition(
            testUserId,
            new THREE.Vector3(pos[j].x, pos[j].y, pos[j].z)
          );
        }
      }
    });
  }

  removeSocketListener = () => {
    window.removeEventListener("resize", this.windowResize);

    this.renderer.domElement.removeEventListener("mousemove", this.mouseMove);

    document.removeEventListener("keydown", this.keyDown);

    document.removeEventListener("keyup", this.keyUp);

    socket.off("user_id");
    socket.off("draw start");
    socket.off("drawing");
    socket.off("move line");
    socket.off("remove current");
    socket.off("get saved bubble");
    socket.close();
  };

  windowResize = () => {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  drawStart = () => {
    this.isDrawing = true;

    this.transformControls.detach();

    // createLineInScene(user_id, {
    // 	width: params.linewidth,
    // 	color: params.color,
    // 	geo: createLineGeometry(user_id, mousePos)
    // }, scene);

    socket.emit("draw start", {
      user_id: this.user_id,
      linewidth: this.state.linewidth,
      color: this.state.drawingColor,
      dashed: this.state.lineDashed,
      mousePos: {
        x: this.mousePos.x,
        y: this.mousePos.y,
        z: this.mousePos.z,
      },
    });
  };

  drawEnd = () => {
    this.isDrawing = false;

    let curLine = getLastLine(this.user_id);
    let curPos = getCenterPos(curLine);

    let obj = new THREE.Object3D();
    obj.position.copy(curPos);

    curLine.parent = obj;
    curLine.position.copy(curPos.negate());

    this.objEntity.add(obj);

    // this.transformControls.attach(obj);
  };

  /**
   * 현재 target 오브젝트 삭제
   */
  deleteTargetObject = () => {
    if (!this.targetObj) return;

    this.transformControls.detach();

    if (this.targetObj.type === "Line2")
      this.objEntity.remove(this.targetObj.parent);
    this.objEntity.remove(this.targetObj);

    this.targetObj = null;
  };

  keyDown = (event) => {
    let key = event.key || event.keyCode;

    this.keysPressed[key] = true;

    if (event.repeat) return;

    // 스페이브바 입력해서 그리기 시작
    if ((key === " " || key === 32) && !this.isDrawing) {
      this.drawStart();
    }

    // Control + Z, 뒤로가기
    if (this.keysPressed["Control"] && event.key == "z") {
      // removeLastLine(user_id, scene);

      socket.emit("remove current", {
        user_id: this.user_id,
      });
    }

    // 타겟팅 중인 오브젝트 삭제
    if (this.keysPressed["Delete"]) {
      this.deleteTargetObject();
    }

    if (this.keysPressed["q"]) {
      this.transformControls.setMode("translate");
    } else if (this.keysPressed["w"]) {
      this.transformControls.setMode("rotate");
    } else if (this.keysPressed["e"]) {
      this.transformControls.setMode("scale");
    } else if (this.keysPressed["s"]) {
      socket.emit("save bubble", { userid: this.user_id });
    }
  };
  keyUp = (event) => {
    let key = event.key || event.keyCode;

    delete this.keysPressed[key];

    if ((key === " " || key === 32) && this.isDrawing) {
      this.drawEnd();
    }
  };

  mouseDown = (e) => {
    if (e.which !== 1) return;

    // 오브젝트를 선택했다면 해당 오브젝트를 targetObj 로 변경
    if (!this.transformControls.dragging && this.sphereInter.visible) {
      this.targetObj = this.selectingObj;
      this.transformControls.attach(
        this.targetObj.type === "Line2" ? this.targetObj.parent : this.targetObj
      );
      this.setState({
        drawingColor: "#" + this.targetObj.material.color.getHexString(),
      });
    }

    // 그리기 모드일시 그리기 시작
    if (!this.transformControls.dragging && this.state.mode === MODE.DRAWING)
      this.drawStart();
  };
  mouseMove = (event) => {
    // mosePos 위치 갱신
    refreshMousePosition(
      event,
      this.camera,
      this.scene.position,
      this.raycaster,
      this.mousePos
    );

    // 선택모드일시 충돌된 오브젝트를 확인할 수 있게 보여주며 targetObj로 변경될 수 있게 대기상태(selectingObj)로 둠
    if (this.state.mode === MODE.SELECTING) {
      const intersects = this.raycaster.intersectObjects(
        this.objEntity.children,
        true
      );
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
      socket.emit("drawing", {
        user_id: this.user_id,
        mousePos: {
          x: this.mousePos.x,
          y: this.mousePos.y,
          z: this.mousePos.z,
        },
      });
    }
  };
  mouseUp = (e) => {
    if (e.which !== 1) return;

    if (this.isDrawing) this.drawEnd();
  };

  /**
   * 모드 변경하기
   * @param {MODE} modeChangeTo 변경할 모드
   */
  modeChange = (modeChangeTo) => {
    if (this.state.mode === modeChangeTo) return;

    // 선택 모드 해제
    if (this.state.mode === MODE.SELECTING && modeChangeTo !== MODE.SELECTING) {
      this.transformControls.detach();
      this.renderer.domElement.removeEventListener("mousedown", this.mouseDown);
    }
    // 그림 모드 해제
    else if (
      this.state.mode === MODE.DRAWING &&
      modeChangeTo !== MODE.DRAWING
    ) {
      this.controls.enabled = true;

      this.renderer.domElement.removeEventListener("mousedown", this.mouseDown);
      this.renderer.domElement.removeEventListener("mouseup", this.mouseUp);
    }

    // 다른 모드 중 그림 모드로 변경할 때
    if (modeChangeTo === MODE.DRAWING) {
      this.controls.enabled = false;

      this.renderer.domElement.addEventListener("mousedown", this.mouseDown);
      this.renderer.domElement.addEventListener("mouseup", this.mouseUp);
    }
    // 선택 모드
    else if (modeChangeTo === MODE.SELECTING) {
      this.renderer.domElement.addEventListener("mousedown", this.mouseDown);
    }

    this.setState({ mode: modeChangeTo });
  };

  /**
   * 화면 중앙에 도형 생성
   * @param {String} shape 생성할 도형 이름
   */
  createShape = (shape) => {
    const material = new THREE.MeshBasicMaterial({
      color: this.state.drawingColor,
    });
    let geometry, shapeObj;

    if (shape === "SQUARE") {
      geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    } else if (shape === "SPHERE") {
      geometry = new THREE.SphereGeometry(0.1, 32, 16);
    } else if (shape === "CYLINDER") {
      geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 36);
    } else if (shape === "PLANE") {
      geometry = new THREE.PlaneGeometry(0.1, 0.1);
      material.side = THREE.DoubleSide;
    }

    shapeObj = new THREE.Mesh(geometry, material);
    shapeObj.position.copy(
      getCenterPosition(this.camera, this.scene.position, this.raycaster)
    );
    this.objEntity.add(shapeObj);
    console.log("dd");
  };

  zoomControl = (diff) => {
    this.setState((prev) => ({ zoom: prev.zoom + diff }));
    // this.controls.zoom
  };

  render() {
    return (
      <div id="Scribubble" ref={(el) => (this.element = el)}>
        <div class={style.rightSide}>
          <div class={style.rightSideUI}>
            <TextButton
              onClick={() => {
                this.setState((prev) => ({ openPanel: !prev.openPanel }));
              }}
            ></TextButton>
            <RowBottomBar>
              <MinusButton
                onClick={() => this.zoomControl(-0.01)}
              ></MinusButton>
              <ZoomInput
                value={this.state.zoom}
                min={0}
                max={10}
                step={0.01}
              ></ZoomInput>
              <PlusButton onClick={() => this.zoomControl(0.01)}></PlusButton>
            </RowBottomBar>
          </div>
          {this.state.openPanel && <RightPanel></RightPanel>}
        </div>
        <div class={style.leftSide}>
          <ColBar>
            <ExploreToolButton
              onClick={(e) => {
                this.modeChange(MODE.EXPLORING);
              }}
              isActive={this.state.mode === MODE.EXPLORING}
            ></ExploreToolButton>

            <SelectToolButton
              onClick={(e) => {
                this.modeChange(MODE.SELECTING);
              }}
              isActive={this.state.mode === MODE.SELECTING}
            ></SelectToolButton>

            <DrawingToolButton
              isActive={this.state.mode === MODE.DRAWING}
              onClick={(e) => {
                this.modeChange(MODE.DRAWING);
              }}
            ></DrawingToolButton>

            <EraseToolButton
              onClick={(e) => {
                this.deleteTargetObject();
              }}
              disabled={!this.targetObj}
            ></EraseToolButton>

            <ShapeToolButton
              isActive={this.state.mode === MODE.SHAPE}
              onClick={(e) => {
                this.modeChange(MODE.SHAPE);
              }}
            ></ShapeToolButton>

            <ColorPicker
              value={this.state.drawingColor}
              onChange={(e) => {
                this.setState({ drawingColor: e.target.value });
                if (this.targetObj) {
                  this.targetObj.material.color = new THREE.Color(
                    e.target.value
                  );
                }
              }}
            ></ColorPicker>

            <DivisionLine></DivisionLine>

            <AddPalleteButton
              onClick={(e) => {
                this.setState((prev) => ({
                  pallete: [this.state.drawingColor, ...prev.pallete],
                }));
              }}
            ></AddPalleteButton>
            {this.state.pallete.map((color, idx) => (
              <PalleteButton
                color={color}
                selecting={this.state.drawingColor === color}
                onClick={(e) => {
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
            ))}
          </ColBar>
          {this.state.mode === MODE.DRAWING && (
            <ColBar>
              <DashedButton
                onClick={(e) => {
                  this.setState((prev) => ({ lineDashed: !prev.lineDashed }));
                }}
                isActive={this.state.lineDashed}
              ></DashedButton>

              <LengthInput
                value={this.state.linewidth}
                onChange={(e) => {
                  this.setState({ linewidth: e.target.value });
                }}
                step="0.5"
                min="1"
                max="10"
              ></LengthInput>
            </ColBar>
          )}
          {this.state.mode === MODE.SHAPE && (
            <ColBar>
              <SquareButton
                onClick={(e) => {
                  this.createShape("SQUARE");
                }}
              ></SquareButton>
              <SphereButton
                onClick={(e) => {
                  this.createShape("SPHERE");
                }}
              ></SphereButton>
              <CylinderButton
                onClick={(e) => {
                  this.createShape("CYLINDER");
                }}
              ></CylinderButton>
              <PlaneButton
                onClick={(e) => {
                  this.createShape("PLANE");
                }}
              ></PlaneButton>
            </ColBar>
          )}
        </div>
      </div>
    );
  }
}

export default Scribubble;
