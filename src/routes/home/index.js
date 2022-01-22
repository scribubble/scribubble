import { Link } from "preact-router/match";
import Nav from "../../components/Nav/Nav";
import Bubble from "../../components/Bubble/Bubble";
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
      "2CD8D5",
      "C5C1FF",
      "FFBAC3",
      "5D9FFF",
      "B8DCFF",
      "6BBBFF",

      // "d5e2f5",
      // "c3cfe2",
      // "edd8ed",
      // "b9e5eb",
      // "b3c5e8",
      // "95b4de",
      // "bdbcf7",
      // "f5cbd5",
      // "fff1eb",
      // "c2ebff",
      // "accbee",
      // "e7f0fd",
      // "e6e9f0",
      // "eef1f5",
      // "f7ecda",
      // "d8daf2",
      // "efe1f2",
    ];

    for (let i = 0; i < 300; ++i) {
      // fill scene with coloured cubes
      let randomRadius = Math.random();
      let colorPick =
        colorsArray[Math.floor(Math.random() * colorsArray.length)];
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

  useEffect(() => {
    init();
    animate();
  }, []);

  return (
    <div>
      <Nav />
      <Wrapper>
        <BubbleContainer>
          <Link href="/web">
            <CreateBubble>
              <Text>Click to </Text>
              <Text>Create your Bubble</Text>
            </CreateBubble>
          </Link>
          <Bubble />
        </BubbleContainer>
        <Inner>
          {/* <Link activeClassName="active" href="/vr">
            VR
          </Link> */}
          <IntroText top={`0`} left={`100px`}>
            Welcome to
          </IntroText>
          <IntroText top={`50px`} left={`640px`}>
            new ways to Scribble,
          </IntroText>
          <IntroText top={`150px`} left={`80px`}>
            an interactive expression of your thoughts
          </IntroText>
          <IntroText top={`250px`} left={`680px`}>
            on this Website
          </IntroText>
        </Inner>
      </Wrapper>
    </div>
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

const CreateBubble = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 0.2px dashed grey;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  opacity: 0.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 1s ease-in-out;

  &:hover {
    background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    opacity: 0.8;
  }
`;

const Text = styled.span`
  padding: 5px 0;
  font-size: 14px;
  z-index: 9;
`;
const Inner = styled.div`
  padding-top: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 1120px;
  position: relative;
`;

const IntroText = styled.h1`
  font-family: "Poiret One", cursive;
  font-size: 40px;
  color: ${({ theme }) => theme.black};
  position: absolute;
  top: ${({ top }) => top};
  left: ${({ left }) => left};
`;

const BubbleContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: inherit;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: center;
  /* display: block;
  margin: 0 auto;
  cursor: move; */
`;
