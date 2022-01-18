import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

let renderer, clock, camera, stats;

const rotationSpeed = Math.PI / 128;

let composer, group;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(0x000000, 0);

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.z = -20;
  camera.position.y = 10;

  stats = new Stats();

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(stats.dom);

  // camera controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // scene

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("rgb(250, 250, 250)");

  group = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.SphereGeometry(500, 1, 100),
    new THREE.MeshPhongMaterial({})
  );

  floor.position.y = -10;
  //const light = new THREE.PointLight(0xffffff, 1.0, 50, 2);
  const light = new THREE.DirectionalLight(0xe8e2d3, 0.1);
  light.position.x = 0;
  light.position.y = 100;
  group.add(floor, light);
  scene.add(group);

  let colorsArray = [
    "d5e2f5",
    "c3cfe2",
    "edd8ed",
    "b9e5eb",
    "b3c5e8",
    "95b4de",
    "bdbcf7",
    "f5cbd5",
    "fff1eb",
    "c2ebff",
    "accbee",
    "e7f0fd",
    "e6e9f0",
    "eef1f5",
    "f7ecda",
    "d8daf2",
    "efe1f2",
  ];

  for (let i = 0; i < 300; ++i) {
    // fill scene with coloured cubes
    let randomRadius = Math.random();
    let colorPick = colorsArray[Math.floor(Math.random() * colorsArray.length)];
    let color = parseInt(`0x${colorPick}`, 16);
    let mat = new THREE.MeshPhongMaterial({
      //color: 0x61b5e5,
      //color: 0x8ad4ff,
      //emissive: 0x112244,
      color: color,
      emissive: color,
      transparent: true,
      opacity: 0.6,
      shininess: 100,
    });
    // console.log(mat.color);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(randomRadius, 32, 16),
      mat
    );

    mesh.position.x = Math.random() * 36 - 18;
    mesh.position.y = Math.random() * 30 - 15;
    mesh.position.z = Math.random() * 30 - 15;

    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;

    group.add(mesh);
  }

  // post-processing
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const params = {
    shape: 1,
    radius: 4,
    rotateR: Math.PI / 12,
    rotateB: (Math.PI / 12) * 2,
    rotateG: (Math.PI / 12) * 3,
    scatter: 0,
    blending: 1,
    blendingMode: 1,
    greyscale: false,
    disable: false,
  };

  composer.addPass(renderPass);

  window.onresize = function () {
    // resize composer
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
}
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  stats.update();
  group.rotation.x += (delta * rotationSpeed) / 10;
  group.rotation.y += delta * rotationSpeed;
  composer.render(delta);
}

export default HomeBubble;
