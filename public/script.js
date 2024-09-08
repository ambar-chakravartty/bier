import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth / 2, window.innerHeight);
renderer.setClearColor(0xffffff,0);
document.getElementById('plantModel').appendChild(renderer.domElement);


const ambientLight = new THREE.AmbientLight(0x404040);
ambientLight.intensity = 45;
scene.add(ambientLight);

// Load 3D Model
const loader = new GLTFLoader();
loader.load(
    'assets/tulsi.glb', // Path to the .glb file
    function (gltf) {
        const model = gltf.scene;

        gltf.scene.traverse( function( node ) {

            if ( node.isMesh ) { node.castShadow = true; }
    
        } );

        // Scale and position the model
        model.scale.set(1, 1, 1);
        model.position.set(0, 0, 0);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        scene.add(model);
    },
    undefined, // Function for the loading progress
    function (error) {
        console.error('An error happened:', error);
    }
);


//responsive shiii
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth/2, window.innerHeight );

}

camera.position.z = 5;
    

// OrbitControls for better model interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.dampingFactor = 0.02;
controls.update();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required if OrbitControls is used
    renderer.render(scene, camera);
}

animate();