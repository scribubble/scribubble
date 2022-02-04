import * as THREE from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { HalftonePass } from "three/examples/jsm/postprocessing/HalftonePass.js";

let renderer, clock, camera, stats;

const rotationSpeed = Math.PI / 64;

let composer, group;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    800
  );
  camera.position.z = 5;
  camera.position.y = 1;


  stats = new Stats();

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(stats.dom);

  // camera controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  // scene

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  group = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.SphereGeometry(100, 1, 100),
    new THREE.MeshPhongMaterial({})
  );
  floor.position.y = -10;
  //const light = new THREE.PointLight(0xffffff, 1.0, 50, 2);
  const light = new THREE.DirectionalLight( 0xffffff);
  light.position.y = 10;
  group.add(floor, light);
  scene.add(group);

  //   const mat = new THREE.ShaderMaterial({
  //     uniforms: {},

  //     vertexShader: [
  //       "varying vec2 vUV;",
  //       "varying vec3 vNormal;",

  //       "void main() {",

  //       "vUV = uv;",
  //       "vNormal = vec3( normal );",
  //       "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

  //       "}",
  //     ].join("\n"),

  //     fragmentShader: [
  //       "varying vec2 vUV;",
  //       "varying vec3 vNormal;",

  //       "void main() {",

  //       "vec4 c = vec4( abs( vNormal ) + vec3( vUV, 0.0 ), 0.0 );",
  //       "gl_FragColor = c;",

  //       "}",
  //     ].join("\n"),
  //   });
  const mat = new THREE.MeshPhongMaterial({ 
    //color: 0x61b5e5, 
    color: 0x8ad4ff,
    //emissive: 0x112244, 
    emissive: 0x61b5e5, 
    transparent: true, 
    opacity: 0.8,
    shininess: 60,
  });
  for (let i = 0; i < 200; ++i) {
    // fill scene with coloured cubes
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 16), mat);
    mesh.position.set(
      Math.random() * 16 - 8,
      Math.random() * 16 - 8,
      Math.random() * 16 - 8
    );
    mesh.rotation.set(
      Math.random() * Math.PI * 1.5,
      Math.random() * Math.PI * 1.5,
      Math.random() * Math.PI * 1.5
    );
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
  //   const halftonePass = new HalftonePass(
  //     window.innerWidth,
  //     window.innerHeight,
  //     params
  //   );
  composer.addPass(renderPass);
  //   composer.addPass(halftonePass);

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
  group.rotation.y += delta * rotationSpeed;
  composer.render(delta);
}

//export default Home;
