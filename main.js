import * as THREE from '/three';
import { MTLLoader } from '/three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from '/three/examples/jsm/loaders/OBJLoader.js';

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

// Load MTL file first
const mtlLoader = new MTLLoader();
mtlLoader.load('/cottage_obj.mtl', (materials) => {
    materials.preload(); // Preload the materials

    // Then load the OBJ file with the loaded materials
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
        '/cottage_obj.obj',  // Use a fixed path for your OBJ model
        function (object) {
            object.position.set(0, 0, 0); // Adjust position if needed
            scene.add(object);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
        }
    );
});

// Mouse Look Variables
let yaw = 0; // Horizontal rotation
let pitch = 0; // Vertical rotation
const sensitivity = 0.005;

// Mouse movement event
document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        yaw -= event.movementX * sensitivity; // Rotate left/right
        pitch -= event.movementY * sensitivity; // Rotate up/down
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Limit vertical look

        // Create a quaternion for rotation
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')); // Order: Yaw (Y) then Pitch (X)

        camera.quaternion.copy(quaternion); // Apply rotation to camera
    }
});

// Click to lock the mouse
document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

// WASD Movement
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.24;

// Track key state
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
});

// Move camera based on key input
function updateCameraMovement() {
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

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
