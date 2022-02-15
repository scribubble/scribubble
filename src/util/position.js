var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();

/**
 * 현재 마우스위치에 해당하는 좌표를 받아옴
 * @param event mousemove listener 의 event
 * @param camera 사용중인 메인 카메라
 * @param scenePosition scene.position
 * @param raycaster raycaster
 * @param saveHere 값이 저장될 위치 (Vector3)
 */
export const refreshMousePosition = (event, camera, scenePosition, raycaster, saveHere) => {
    // 화면에서 마우스 위치 받아오기
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // plane 이용해서 마우스 위치를 3d 에서 얻어오기
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), scenePosition);

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, saveHere);
}

/**
 * 현재 카메라 기준으로 가운데에 해당하는 좌표를 받아옴
 * @param camera 사용중인 메인 카메라
 * @param scenePosition scene.position
 * @param raycaster raycaster
 */
export const getCenterPosition = (camera, scenePosition, raycaster) => {
    let centerPos = new THREE.Vector3(0, 0, 0);

    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), scenePosition);

    raycaster.setFromCamera(centerPos, camera);
    raycaster.ray.intersectPlane(plane, centerPos);

    return centerPos;
}

/**
 * 순수 x, y, z 데이터만 받기
 * @param vec3Pos THREE.Vector3 데이터
 * @return x, y, z 데이터
 */
export const getBasisPosition = (vec3Pos) => {
    return {
        x: vec3Pos.x,
        y: vec3Pos.y,
        z: vec3Pos.z,
    }
}