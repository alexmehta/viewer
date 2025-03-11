import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
const viewer = new GaussianSplats3D.Viewer({
    'cameraUp': [0.015, 0.25, 0.97],
    'initialCameraPosition': [0.5, 0.85, 0.11],
    'initialCameraLookAt': [0, 4, 0],
    'sharedMemoryForWorkers': false,
});
// use splat from url 
viewer.addSplatScene('', {
    'splatAlphaRemovalThreshold': 5,
    'showLoadingUI': true,
    'position': [0, 1, 0],
    'rotation': [0, 0, 0, 1],
    'scale': [1.5, 1.5, 1.5]
})
.then(() => {
    viewer.start();
});
// WASD Movement
const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.5;
const camera = viewer.camera;
const freeCameraEnabled = true;
// Track key state
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key) && freeCameraEnabled) keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key) && freeCameraEnabled) keys[event.key] = false;
});
// Move camera based on key input
function updateCameraMovement() {
    console.log('updateCameraMovement');
    if (!freeCameraEnabled) return; // Prevent movement when free control is disabled

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); // Get camera's forward direction
    direction.y = 0; // Ignore vertical movement to keep it flat on the ground
    direction.normalize(); // Keep movement consistent

    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
    if (keys.w) camera.position.addScaledVector(direction, moveSpeed);  // Move forward
    if (keys.s) camera.position.addScaledVector(direction, -moveSpeed); // Move backward
    if (keys.a) camera.position.addScaledVector(right, -moveSpeed);      // Move left
    if (keys.d) camera.position.addScaledVector(right,moveSpeed);     // Move right
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateCameraMovement();
}

animate();