var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();

/*
    saveHere 에 저장
*/
export const refreshMousePosition = (event, camera, scenePosition, raycaster, saveHere) => {
    // 화면에서 마우스 위치 받아오기
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // plane 이용해서 마우스 위치를 3d 에서 얻어오기
    // planeNormal.copy(camera.el.getAttribute('position')).normalize();
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), scenePosition);
    // plane.setFromNormalAndCoplanarPoint(planeNormal, scenePosition);

    // raycaster
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, saveHere);
}
