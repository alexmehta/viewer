import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

let freeCameraEnabled = false; // Toggle state

// Toggle free camera control when the user presses `
document.addEventListener('click', () => {
    freeCameraEnabled = !freeCameraEnabled; // Toggle state

    if (freeCameraEnabled) {
        document.body.requestPointerLock(); // Lock mouse for free look
    } else {
        document.exitPointerLock(); // Exit free look mode
    }
});

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 30); // Adjust position if needed      

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

const mtlLoader = new MTLLoader();
mtlLoader.load('public/r2-d2.mtl', (materials) => {
  materials.preload();

  // Load the OBJ file
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials); // Set the loaded materials
  objLoader.load('public/r2-d2.obj', (object) => {
    scene.add(object); // Add the object to the scene
    object.position.set(0, 0, 0); // Set the position of the object
  });
});

// Mouse Look Variables
let yaw = 0; // Horizontal rotation
let pitch = 0; // Vertical rotation
const sensitivity = 0.005;

// Mouse movement event
document.addEventListener('mousemove', (event) => {
    if (freeCameraEnabled && document.pointerLockElement === document.body) {
        yaw -= event.movementX * sensitivity; // Rotate left/right
        pitch -= event.movementY * sensitivity; // Rotate up/down
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Limit vertical look

        // Create a quaternion for rotation
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')); // Order: Yaw (Y) then Pitch (X)

        camera.quaternion.copy(quaternion); // Apply rotation to camera
    }
});

// WASD Movement
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.24;

// Track key state
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key) && freeCameraEnabled) keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key) && freeCameraEnabled) keys[event.key] = false;
});

// Move camera based on key input
function updateCameraMovement() {
    if (!freeCameraEnabled) return; // Prevent movement when free control is disabled

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); // Get camera's forward direction
    direction.y = 0; // Ignore vertical movement to keep it flat on the ground
    direction.normalize(); // Keep movement consistent

    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();

    if (keys.w) camera.position.addScaledVector(direction, moveSpeed);  // Move forward
    if (keys.s) camera.position.addScaledVector(direction, -moveSpeed); // Move backward
    if (keys.a) camera.position.addScaledVector(right, moveSpeed);      // Move left
    if (keys.d) camera.position.addScaledVector(right, -moveSpeed);     // Move right
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateCameraMovement();
    renderer.render(scene, camera);
}



function moveCameraSmoothly(targetPosition, targetRotation, duration = 1.5) {
    const startPosition = camera.position.clone();
    const startQuaternion = camera.quaternion.clone();

    const targetPos = new THREE.Vector3(...targetPosition);
    const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetRotation, 'YXZ'));

    let elapsedTime = 0;

    function update() {
        elapsedTime += 0.016; // Approximate frame time (60 FPS)
        const t = Math.min(elapsedTime / duration, 1); // Clamp t between 0 and 1

        camera.position.lerpVectors(startPosition, targetPos, t); // Smoothly interpolate position
        camera.quaternion.slerp(targetQuat, t); // Smoothly interpolate rotation

        if (t < 1) requestAnimationFrame(update); // Continue animation until completed
    }

    requestAnimationFrame(update);
}

// Listen for keypress event
window.addEventListener('keydown', (event) => {
    if (event.key === "1") {
        // Move camera to a new position and rotation when "1" is pressed
        freeCameraEnabled = false;
        document.exitPointerLock();
        moveCameraSmoothly([100, 5, 100], [0, -Math.PI / 4, 0], 2);
    }
});


animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
