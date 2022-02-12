import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

let drawData = {}; /*  유저마다의 그림 데이터들이 들어감
drawData = {
    'id_1': {
        linePositions: [],          // 라인 좌표 저장
        drawingCount: 0,            // 좌표 개수 카운팅 안해주면 간혹 길이 계산 못해서 안그려짐
        myLines: []                 // 그린 선들
    },
    'id_2': {
        ...
    }
    ...
}
*/

/**
 * Line Geometry 생성
 * @param {String} user_id 유저의 고유 id
 * @param {THREE.Vector3} point 라인의 시작위치
 */
export const createLineGeometry = (user_id, point) => {
  // 처음 그리는 유저라면 등록
  if (!drawData[user_id]) {
    drawData[user_id] = {
      drawingCount: 0,
      linePositions: [point.x, point.y, point.z],
      myLines: [],
    };
  } else {
    drawData[user_id].drawingCount = 0;
    drawData[user_id].linePositions = [point.x, point.y, point.z];
  }

  var geo = new LineGeometry();
  geo.setPositions(drawData[user_id].linePositions);

  return geo;
};

/**
 * Line 오브젝트 생성
 * @param {Object} opt 라인 옵션
 * @param {Number} opt.width 라인 두께 (default 1)
 * @param {THREE.Color} opt.color 라인 색상 (default black)
 * @param {Boolean} opt.dashed dashed 모드 (default false)
 */
export const createLine = (opt) => {
  opt = opt || {};
  opt.width = opt.width || 1;
  opt.color = opt.color || new THREE.Color(0, 0, 0);
  opt.dashed = opt.dashed || false;

  var matLine = new LineMaterial({
    color: opt.color,
    linewidth: opt.width,
    dashSize: 0.1,
    gapSize: 0.1,
    dashed: opt.dashed,
    name: opt.name,
  });

  if (window) matLine.resolution.set(window.innerWidth, window.innerHeight);

  var line = new Line2(opt.geo, matLine);
  line.computeLineDistances();
  line.name = opt.objName;

  return line;
};

/**
 * Line 오브젝트 생성 후 scene 에 추가
 * @param {String} user_id 유저의 고유 id (socket_id)
 * @param {Object} opt 라인 옵션
 * @param {Number} opt.width 라인 두께 (default 1)
 * @param {THREE.Color} opt.color 라인 색상 (default black)
 * @param {Boolean} opt.dashed dashed 모드 (default false)
 * @param {THREE.Object3D} parent 라인의 부모
 */
export const createLineAndAdd = (user_id, opt, parent) => {
  drawData[user_id].myLines.push(createLine(opt));

  parent.add(getLastLine(user_id));
};

/**
 * 현재 좌표 추가
 * @param {String} user_id 유저의 고유 id
 * @param {THREE.Vector3} point 라인의 시작위치
 */

export const addPosition = (user_id, point) => {
  drawData[user_id].linePositions.push(point.x, point.y, point.z);

  getLastLine(user_id).geometry._maxInstanceCount = ++drawData[user_id]
    .drawingCount;
  getLastLine(user_id).geometry.setPositions(drawData[user_id].linePositions);
  getLastLine(user_id).computeLineDistances();
};

/**
 * 마지막으로 그린 선 Pop
 * @param {String} user_id 유저의 고유 id
 */
export const popLastLine = (user_id) => {
  return drawData[user_id].myLines.pop();
};

/**
 * 마지막으로 그린 선 scene 에서 제거
 * @param {String} user_id 유저의 고유 id
 * @param {THREE.Object3D} parent 라인의 부모
 */
export const removeLastLine = (user_id, parent) => {
  if (drawData[user_id].myLines.length) parent.remove(popLastLine(user_id));
};

/**
 * 마지막으로 그린 선 가져오기
 * @param {String} user_id 유저의 고유 id
 */
export const getLastLine = (user_id) => {
  return drawData[user_id].myLines[drawData[user_id].myLines.length - 1];
};

/**
 * 선의 중간위치 받아오기
 * @param {Line2} line 대상이 될 선
 */
export const getCenterPos = (line) => {
  let arr = line.geometry.getAttribute("instanceStart").array;

  return new THREE.Vector3(
    (arr[0] + arr[arr.length - 3]) / 2,
    (arr[1] + arr[arr.length - 2]) / 2,
    (arr[2] + arr[arr.length - 1]) / 2
  );
};
