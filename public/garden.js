import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );

scene.add(camera);
camera.position.z = 15;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x87ceeb,1);
document.body.appendChild(renderer.domElement);

let ambientLight = new THREE.AmbientLight(0x101010,1.0);

// ambientLight.position = camera.position;
scene.add(ambientLight);

const menuPanel = document.getElementById('menuPanel');

const controls = new PointerLockControls(camera,renderer.domElement);
controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))
const clock = new THREE.Clock()

let sunLight = new THREE.DirectionalLight(0xdddddd,1.0);
scene.add(sunLight);

let textureLoader = new THREE.TextureLoader();

//ground
let floorTexture = textureLoader.load('./assets/grass.jpg');

let plane = new THREE.PlaneGeometry(200,200);
let planeMaterial = new THREE.MeshBasicMaterial({map: floorTexture,side: THREE.DoubleSide});

let floorPlane = new THREE.Mesh(plane,planeMaterial);

floorPlane.rotation.x = Math.PI / 2;
floorPlane.position.y = -Math.PI;

scene.add(floorPlane);


const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click',function(){
    controls.lock();
},false);

//walls

const wallGroup = new THREE.Group();
scene.add(wallGroup);

const frontWall = new THREE.Mesh(
    new THREE.BoxGeometry(50,20,0.01),
    new THREE.MeshBasicMaterial({
        color: 'green'
    })
);

frontWall.position.z = -20;


const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(50,20,0.01),
    new THREE.MeshBasicMaterial({
        color: 'blue'
    })
);

leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -20;

const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(50,20,0.01),
    new THREE.MeshBasicMaterial({
        color: 'red'
    })
);

rightWall.position.x = 20;
rightWall.rotation.y = Math.PI/2;

// wallGroup.add(frontWall);
// wallGroup.add(leftWall);
// wallGroup.add(rightWall);



const onKeyDown = function (event) {
    switch (event.code) {
      case 'KeyW':
        controls.moveForward(0.45)
        break
      case 'KeyA':
        controls.moveRight(-0.45)
        break
      case 'KeyS':
        controls.moveForward(-0.45)
        break
      case 'KeyD':
        controls.moveRight(0.45)
        break
    }
  }
document.addEventListener('keydown', onKeyDown, false)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  animate()
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
animate();