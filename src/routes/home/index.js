import { Link } from "preact-router/match";
import Nav from "../../components/Nav";
import Bubble from "../../components/Bubble";
import styled from "styled-components";
import { useEffect } from "preact/hooks";

import Stats from "three/examples/jsm/libs/stats.module.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

let renderer, clock, camera, stats;

const rotationSpeed = Math.PI / 128;

let composer, group;

const Home = () => {
  function init() {
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0xffffff, 0);
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
      "4567F6",
      "9FE3F7",
      "EF88DE",
      "E8ECF5",
      "E0E0E0",
      "6BBBFF",
    ];

    for (let i = 0; i < 200; i++) {
      // fill scene with coloured cubes
      let randomRadius = Math.random();
      let colorPick =
        colorsArray[Math.floor(Math.random() * colorsArray.length)];
      let color = parseInt(`0x${colorPick}`, 16);
      let mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(randomRadius, 36, 18),
        mat
      );

      mesh.position.x = Math.random() * 36 - 18;
      mesh.position.y = Math.random() * 30 - 15;
      mesh.position.z = Math.random() * 30 - 15;

      mesh.rotation.x = Math.random() * Math.PI * 3;
      mesh.rotation.y = Math.random() * Math.PI * 1;
      mesh.rotation.z = Math.random() * Math.PI * 3;

      group.add(mesh);
    }

    // post-processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);

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
    group.rotation.x += delta * rotationSpeed;
    group.rotation.y += (delta * rotationSpeed) / 5;
    composer.render(delta);
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return (
    <Wrapper>
      <Title>
        Welcome to new ways to Scribble, an interactive expression of your
        thoughts on this Website
      </Title>
      <Room>
        <CreateBubble>
          <Link href="/web">
            <Text>Create your Bubble with web</Text>
          </Link>
        </CreateBubble>

        <CreateBubble>
          <Link href="/vr">
            <Text>Create your Bubble with VR</Text>
          </Link>
        </CreateBubble>
      </Room>
      <Credits>
        Images by <a href="https://">Scribubble</a>, licensed under{" "}
        <span>youjin, hyejin, yechan, subin, jiheun, yeji</span>
      </Credits>
    </Wrapper>
  );
};

export default Home;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: absolute;
`;

const Title = styled.h1`
  font-size: 26px;
  margin-top: 15px;
  font-weight: bold;
  font-family: "Poiret One", cursive;
  color: ${({ theme }) => theme.black};
  cursor: pointer;
`;

const Room = styled.div`
  padding: 15vh 0;
  position: relative;
  display: flex;
  align-items: center;
`;

const CreateBubble = styled.div`
  width: 60vh;
  height: 60vh;
  margin: 0 70px;
  border-radius: 50%;
  background-image: linear-gradient(125deg, #e8ecf5 0%, #4567f6 100%);
  opacity: 0.6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 2s ease-in-out;

  &:hover {
    background-image: linear-gradient(135deg, #9fe3f7 0%, #4567f6 100%);
    opacity: 0.7;
  }
`;

const Text = styled.span`
  font-size: 18px;
  color: black;
`;

const Credits = styled.div`
  margin-bottom: 15px;
  font-size: 18px;
  font-family: "Poiret One", cursive;
`;
