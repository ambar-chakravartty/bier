import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer;
let models = []; // Array to store loaded models
let currentModelIndex = 0;
let fadeDuration = 2000; // Time for fading transition (in ms)
let modelDisplayTime = 5000; // Time each model is fully visible (in ms)
let lastSwitchTime = 0;
let transitionPhase = "fadeIn"; // Could be "fadeIn", "fadeOut", or "display"

// Initialize the scene
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff,0);
    document.getElementById('cnv').appendChild(renderer.domElement);

    // Add a light to the scene
    const light = new THREE.AmbientLight(0xffffff, 1);
    // light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Load models
    const loader = new GLTFLoader();
    loadModel(loader, 'assets/slideshow/vine.glb');  // Replace with your model path
    loadModel(loader, 'assets/Tulsi.glb');  // Replace with your model path
    // loadModel(loader, 'assets/slideshow/alvera.glb');  // Add more as needed
    camera.position.z = 5;
    // Start the render loop
    animate();
}

// Load a GLTF model and push it to the models array
function loadModel(loader, path) {
    // loader.load(path, (gltf) => {
    //     const model = gltf.scene;
    //     applyTransparentMaterial(model); // Apply transparent material to support fading
    //     model.visible = false; // Hide initially
    //     models.push(model);
    //     scene.add(model);
    // });

    loader.load(path,function (gltf) {
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

        applyTransparentMaterial(model); // Apply transparent material to support fading
        model.visible = false; // Hide initially
        models.push(model);

        scene.add(model);
    },
    undefined, // Function for the loading progress
    function (error) {
        console.error('An error happened:', error);
    }
    );

}

// Apply a transparent material to all the children of the model (for fading effect)
function applyTransparentMaterial(object) {
    object.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 0; // Start fully transparent
        }
    });
}

// Set the opacity of the current model
function setModelOpacity(model, opacity) {
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.opacity = opacity;
        }
    });
}

// Render loop with fade transition and rotation logic
function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    let elapsedTime = currentTime - lastSwitchTime;

    if (models.length > 0) {
        const currentModel = models[currentModelIndex];

        // Rotate the current model
        currentModel.rotation.y += 0.01; // Rotate around the Y axis
        // currentModel.rotation.x += 0.005; // Rotate around the X axis (optional)

        if (transitionPhase === "fadeIn") {
            if (elapsedTime <= fadeDuration) {
                // Fade in the model
                const opacity = elapsedTime / fadeDuration;
                setModelOpacity(currentModel, opacity);
            } else {
                // Fully visible now, move to display phase
                setModelOpacity(currentModel, 1);
                transitionPhase = "display";
                lastSwitchTime = currentTime; // Reset the timer for display time
            }
        } else if (transitionPhase === "display") {
            if (elapsedTime > modelDisplayTime) {
                // Time to start fading out
                transitionPhase = "fadeOut";
                lastSwitchTime = currentTime; // Reset the timer for fading out
            }
        } else if (transitionPhase === "fadeOut") {
            if (elapsedTime <= fadeDuration) {
                // Fade out the model
                const opacity = 1 - (elapsedTime / fadeDuration);
                setModelOpacity(currentModel, opacity);
            } else {
                // Fully invisible now, move to the next model and fade it in
                setModelOpacity(currentModel, 0);
                currentModel.visible = false;

                // Move to the next model in the array
                currentModelIndex = (currentModelIndex + 1) % models.length;
                models[currentModelIndex].visible = true;
                transitionPhase = "fadeIn";
                lastSwitchTime = currentTime; // Reset the timer for fading in
            }
        }
    }

    renderer.render(scene, camera);
}

// Call the init function
init();

// Handle window resize
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth/2, window.innerHeight );

}