import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting - Implement two types of lighting for sunlight and indoor
// Sunlight simulation with DirectionalLight
const sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
sunlight.position.set(100, 100, 100);
// Point the sunlight towards the center of the scene/house
sunlight.target.position.set(0, 0, 0);
scene.add(sunlight);
scene.add(sunlight.target);

//Enhance sunlight with ambient light for softer shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

// Indoor lighting with PointLight
const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
pointLight.position.set(0, 2.5, 0);
scene.add(pointLight);

//indoor lighting with SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.5); // Use white light for a neutral color
// Position the spot light to illuminate the ceiling, and point it downwards
spotLight.position.set(0, 1, 0);
spotLight.target.position.set(0, 0, 0); // Point directly down
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5; // Soften the edge of the light
spotLight.decay = 1;
spotLight.distance = 100; 
scene.add(spotLight);
scene.add(spotLight.target);

camera.position.z = 15;
camera.position.set(0, 1.6, 4);

// Implement a Skydome/Skybox
// Load the sky texture
const textureLoader = new THREE.TextureLoader();
const skyTexture = textureLoader.load('images/nightSky.jpg', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
});

// Adjust renderer settings for antialiasing
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.antialias = true;

// Create the skydome geometry and material
const skyGeometry = new THREE.SphereGeometry(300, 60, 40); // Increase segment count to reduce geometric seams
const skyMaterial = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide // Render the inside of the sphere
});

// Create the skydome mesh and add it to the scene
const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyDome);

//Create a ground
// Load Ground Grass textures with unique names to prevent conflicts
const groundGrassColorMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_COL_2K.jpg');
const groundGrassNormalMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_NRM_2K.jpg');
const groundGrassDisplacementMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_DISP_2K.jpg');
const groundGrassAoMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_AO_2K.jpg');
const groundGrassRoughnessMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_GLOSS_2K.jpg'); // Might need to invert for roughness
// Load the higher fidelity 16-bit textures if supported by your renderer:
const groundGrassDispMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_DISP16_2K.tif');
// Use the 16-bit bump map if needed (optional):
const groundGrassBumpMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_BUMP16_2K.tif');

const groundGrassReflMap = textureLoader.load('textures/GroundGrass/GroundGrassGreen002_REFL_2K.jpg');
// Create the ground material with the new unique texture variables
const groundGrassMaterial = new THREE.MeshStandardMaterial({
    map: groundGrassColorMap, // Albedo
    normalMap: groundGrassNormalMap,
    displacementMap: groundGrassDispMap, // 16-bit displacement map for higher detail
    displacementScale: 0.1,
    aoMap: groundGrassAoMap, // Ambient Occlusion
    roughnessMap: groundGrassRoughnessMap, // Gloss map
    metalnessMap: groundGrassReflMap, // Reflection map for metalness
    bumpMap: groundGrassBumpMap // Bump map
});

// Ground mesh creation
const groundGrassGeometry = new THREE.PlaneGeometry(500, 500);
const groundGrassMesh = new THREE.Mesh(groundGrassGeometry, groundGrassMaterial);
groundGrassMesh.rotation.x = -Math.PI / 2; // Rotate to lie flat
scene.add(groundGrassMesh);


// Model the House Structure
// House group
const house = new THREE.Group();
scene.add(house);

// // Wall Material
// Load texture
// Load the color map
const colorMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_COL_2K.png');
// Load the ambient occlusion map
const aoMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_AO_2K.png');
// Load the displacement map
const displacementMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_DISP_2K.png');
// Load the normal map
const normalMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_NRM_2K.png');
// Load the gloss map
const glossMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_GLOSS_2K.png');
// Load the bump map
const bumpMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_BUMP_2K.png');

// Create the material with textures
const wallMaterial = new THREE.MeshStandardMaterial({
    map: colorMap,
    aoMap: aoMap,
    displacementMap: displacementMap,
    normalMap: normalMap,
    roughnessMap: glossMap,
    bumpMap: bumpMap,
    reflectivity: 0.5, // Adjust based on your needs
});

// scale the displacement and bump maps.
wallMaterial.displacementScale = 0.005; // This value depends on your scene scale
wallMaterial.bumpScale = 0.005; // This value depends on your scene scale

// Individual Wall Geometries
const wallDepth = 0.1;
const wallHeight = 3.5; // Increased wall height
const houseLength = 8; // Doubled the length
const houseWidth = 8; // Doubled the width

const frontWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const backWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const sideWallGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, houseWidth);

//1. Front wall with door opening space
// Door dimensions
const doorWidth = 1.5;
const doorHeight = 2.5;
const doorOffsetFromEdge = 1;

// Adjust doorPositionX to align the door to the left side
const doorPositionX = -(houseLength / 2 - doorWidth / 2) + 0.5;

// Wall segments to create an opening for the door
// Adjust the left wall segment to be just a thin strip since the door is now close to it
const leftWallSegmentWidth = 0.5; // Minimal width for structural support

// Right wall segment takes up the remaining width
const rightWallSegmentWidth = houseLength - doorWidth - leftWallSegmentWidth;

// Left side wall segment
const leftWallGeometry = new THREE.BoxGeometry(leftWallSegmentWidth, wallHeight, wallDepth);
const leftWallSegment = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWallSegment.position.set(-(houseLength / 2 - leftWallSegmentWidth / 2), wallHeight / 2, houseWidth / 2);
house.add(leftWallSegment);

// Right side wall segment
const rightWallGeometry = new THREE.BoxGeometry(rightWallSegmentWidth, wallHeight, wallDepth);
const rightWallSegment = new THREE.Mesh(rightWallGeometry, wallMaterial);
// Adjust position based on the new door position
rightWallSegment.position.set(doorPositionX + doorWidth / 2 + rightWallSegmentWidth / 2, wallHeight / 2, houseWidth / 2);
house.add(rightWallSegment);

// Top wall segment above the door
// It spans the width of the door plus the left wall segment
const topWallSegmentWidth = doorWidth + leftWallSegmentWidth;
const topWallGeometry = new THREE.BoxGeometry(topWallSegmentWidth, wallHeight - doorHeight, wallDepth);
const topWallSegment = new THREE.Mesh(topWallGeometry, wallMaterial);
// Position it above the door, aligned with the left side
topWallSegment.position.set(doorPositionX + doorWidth / 2 - topWallSegmentWidth / 4, doorHeight + (wallHeight - doorHeight) / 2, houseWidth / 2);
house.add(topWallSegment);

//1.1 front wallpaper
// Wallpaper material
const wallpaperMaterial = new THREE.MeshBasicMaterial({ color: 0xfce4ec }); // Example: pink wallpaper
const wallpaperDepth = 0.2; // Thinner depth for wallpaper

// Function to create and position wallpaper
function addWallpaper(geometry, position, isOffsetPositive) {
    const wallpaper = new THREE.Mesh(geometry, wallpaperMaterial);
    // Determine the direction of the offset based on the wall's facing direction
    const offsetZ = isOffsetPositive ? wallpaperDepth / 2 : -wallpaperDepth / 2;
    // Adjust the z-position further inside based on the specified offset
    wallpaper.position.set(position.x, position.y, position.z + offsetZ);
    house.add(wallpaper);
}

addWallpaper(new THREE.BoxGeometry(leftWallSegmentWidth, wallHeight, wallpaperDepth), leftWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(rightWallSegmentWidth, wallHeight, wallpaperDepth), rightWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(topWallSegmentWidth, wallHeight - doorHeight, wallpaperDepth), topWallSegment.position, false);


//2.Back wall
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.set(0, wallHeight / 2, -houseWidth / 2);
house.add(backWall);

//3. Left wall
const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
leftWall.position.set(-houseLength / 2, wallHeight / 2, 0);
house.add(leftWall);

//4. Right wall
const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
rightWall.position.set(houseLength / 2, wallHeight / 2, 0);
house.add(rightWall);

//5. Internal wall dividing the house lengthwise (creating a separating spaces)
// The length of the internal wall is half the house width
const internalWallLength = houseWidth / 2;
// The width of the left segment is the space from the right edge minus the door offset and door width
const internalLeftSegmentWidth = internalWallLength - doorWidth - doorOffsetFromEdge;
// The width of the right segment is just the door offset
const internalRightSegmentWidth = doorOffsetFromEdge;

// Calculate the position of the internal wall
const internalWallPositionY = -(houseWidth / 2.5);
//Left segment of the internal wall
const leftInternalSegmentGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, internalLeftSegmentWidth);
const leftInternalSegment = new THREE.Mesh(leftInternalSegmentGeometry, wallMaterial);
// Adjust the position of the left segment to be all the way to the left
leftInternalSegment.position.set(0, wallHeight / 2, internalWallPositionY);
house.add(leftInternalSegment);

// Right segment of the internal wall
const rightInternalSegmentGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, internalRightSegmentWidth);
const rightInternalSegment = new THREE.Mesh(rightInternalSegmentGeometry, wallMaterial);
// Position the right segment relative to the left segment
rightInternalSegment.position.set(0, wallHeight / 2, leftInternalSegment.position.z + internalLeftSegmentWidth / 2 + doorWidth + internalRightSegmentWidth / 2);
house.add(rightInternalSegment);

//Top segment of the internal wall (if door height is less than wall height)
if (doorHeight < wallHeight) {
    const topInternalSegmentHeight = wallHeight - doorHeight;
    const topInternalSegmentGeometry = new THREE.BoxGeometry(wallDepth, topInternalSegmentHeight, doorWidth);
    const topInternalSegment = new THREE.Mesh(topInternalSegmentGeometry, wallMaterial);
    // Position the top segment relative to the left segment
    topInternalSegment.position.set(0, wallHeight - topInternalSegmentHeight / 2, leftInternalSegment.position.z + internalLeftSegmentWidth / 2 + doorWidth / 2);
    house.add(topInternalSegment);
}

//6. Partition wall for creating two separate rooms on one side
const partitionWallGeometry = new THREE.BoxGeometry(houseLength / 2 - wallDepth, wallHeight, wallDepth); // Adjust length as necessary
// Room 1 partition wall
const room1PartitionWall = new THREE.Mesh(partitionWallGeometry, wallMaterial);
room1PartitionWall.position.set(-houseLength / 4, wallHeight / 2, 0); // Adjust position as necessary
house.add(room1PartitionWall);

// Room 2 partition wall (mirror position of Room 1 wall on the other side of the internal wall)
// Calculate the dimensions for the side wall segments
const sideWallSegmentLength = (houseLength / 2 - wallDepth - doorWidth) / 2;
const sideWallSegmentHeight = wallHeight;
const sideWallSegmentDepth = wallDepth;

// Create the left side wall segment for Room 2 partition
const leftSideWallGeometry = new THREE.BoxGeometry(sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);
const leftSideWall = new THREE.Mesh(leftSideWallGeometry, wallMaterial);
leftSideWall.position.set(houseLength / 4 - sideWallSegmentLength / 2 - doorWidth / 2, wallHeight / 2, 0);
house.add(leftSideWall);

// Create the right side wall segment for Room 2 partition
const rightSideWallGeometry = new THREE.BoxGeometry(sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);
const rightSideWall = new THREE.Mesh(rightSideWallGeometry, wallMaterial);
rightSideWall.position.set(houseLength / 4 + sideWallSegmentLength / 2 + doorWidth / 2, wallHeight / 2, 0);
house.add(rightSideWall);

// Create a top wall segment if the door height is less than the wall height
if (doorHeight < wallHeight) {
    const topWallSegmentLength = doorWidth;
    const topWallSegmentHeight = wallHeight - doorHeight;
    const topWallGeometry = new THREE.BoxGeometry(topWallSegmentLength, topWallSegmentHeight, wallDepth);
    const topWallSegment = new THREE.Mesh(topWallGeometry, wallMaterial);
    // Position the top wall segment above the door space, centered between the side segments
    topWallSegment.position.set(houseLength / 4, wallHeight - topWallSegmentHeight / 2, 0);
    house.add(topWallSegment);
}

//load ceiling texture
const loader = new THREE.TextureLoader();

// Load the textures
const ceilingColorTexture = loader.load('textures/PlainCeiling/PlasterPlain001_COL_1K_METALNESS.png');
const ceilingNormalTexture = loader.load('textures/PlainCeiling/PlasterPlain001_NRM_1K_METALNESS.png');
const ceilingDisplacementTexture = loader.load('textures/PlainCeiling/PlasterPlain001_DISP_1K_METALNESS.png');
const ceilingRoughnessTexture = loader.load('textures/PlainCeiling/PlasterPlain001_ROUGHNESS_1K_METALNESS.png');
const ceilingMetalnessTexture = loader.load('textures/PlainCeiling/PlasterPlain001_METALNESS_1K_METALNESS.png');
const ceilingBumpTexture = loader.load('textures/PlainCeiling/PlasterPlain001_BUMP_1K_METALNESS.png');

// Ceiling Material with textures
const ceilingMaterial = new THREE.MeshStandardMaterial({
  map: ceilingColorTexture,
  normalMap: ceilingNormalTexture,
  displacementMap: ceilingDisplacementTexture,
  roughnessMap: ceilingRoughnessTexture,
  metalnessMap: ceilingMetalnessTexture,
  bumpMap: ceilingBumpTexture,
  roughness: 0.8,
  metalness: 0
});

ceilingMaterial.displacementScale = 0.02; // this value can be changed according to the effect you desire

const repeatFactor = 4; 
ceilingColorTexture.repeat.set(repeatFactor, repeatFactor);
ceilingNormalTexture.repeat.set(repeatFactor, repeatFactor);
ceilingDisplacementTexture.repeat.set(repeatFactor, repeatFactor);
ceilingRoughnessTexture.repeat.set(repeatFactor, repeatFactor);
ceilingMetalnessTexture.repeat.set(repeatFactor, repeatFactor);
ceilingBumpTexture.repeat.set(repeatFactor, repeatFactor);

// Ensure all texture maps are set to repeat wrapping mode
[ceilingColorTexture, ceilingNormalTexture, ceilingDisplacementTexture, ceilingRoughnessTexture, ceilingMetalnessTexture, ceilingBumpTexture].forEach(texture => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
});

// Ceiling Geometry
const ceilingGeometry = new THREE.PlaneGeometry(houseLength, houseWidth);

// Create the ceiling mesh
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
// Set position below the roof base
const ceilingOffset = 0.1; // adjust to suit your scene

// Position the ceiling
ceiling.position.set(0, wallHeight - ceilingOffset, 0);
ceiling.rotation.x = Math.PI / 2;

// Make sure the ceiling is capable of receiving shadows
ceiling.receiveShadow = true;

// Add the ceiling to the house
scene.add(ceiling);

//Roof
// Calculate the diagonal to ensure the roof will cover the entire house including overhang
const houseDiagonal = Math.sqrt(houseLength * houseLength + houseWidth * houseWidth);
const roofOverhang = 0.5;
const roofBaseDiameter = houseDiagonal + roofOverhang; // Include overhang in the roof diameter
const roofHeight = 2.5;
// Load the roof texture
const roofTexture = textureLoader.load('/images/roof.png');
roofTexture.wrapS = THREE.RepeatWrapping;
roofTexture.wrapT = THREE.RepeatWrapping;
// Adjust the texture repeat to cover the new roof diameter appropriately
roofTexture.repeat.set(roofBaseDiameter / 2, roofHeight);
//Adjust cone geometry to accommodate the new diameter
const roofGeometry = new THREE.ConeGeometry(roofBaseDiameter / 2, roofHeight, 4);
const roofMaterial = new THREE.MeshStandardMaterial({ map: roofTexture });

// Create and position the roof
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
// The y position is set so that the base of the cone starts at the top of the wall height
roof.position.y = wallHeight + roofHeight / 2;
roof.rotation.y = Math.PI / 4;
house.add(roof);


//Floor inside the house
const woodColorTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_COL_2K.jpg');
const woodAoTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_AO_2K.jpg');
const woodDisplacementTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_DISP_2K.jpg');
const woodNormalTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_NRM_2K.png');
const woodGlossTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_GLOSS_2K.jpg');
const woodBumpTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_BUMP_2K.jpg');
const woodRoughnessTexture = loader.load('textures/WoodFlooring/WoodFlooringAshSuperWhite001_REFL_2K.jpg');

// Floor Material with Textures
const floorMaterial = new THREE.MeshStandardMaterial({
  map: woodColorTexture,
  aoMap: woodAoTexture,
  displacementMap: woodDisplacementTexture,
  normalMap: woodNormalTexture,
  roughnessMap: woodGlossTexture,
  bumpMap: woodBumpTexture,
  });

// Apply scaling 
const textureRepeat = new THREE.Vector2(6, 6); 
woodColorTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodColorTexture.wrapS = woodColorTexture.wrapT = THREE.RepeatWrapping;
woodAoTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodAoTexture.wrapS = woodAoTexture.wrapT = THREE.RepeatWrapping;
woodDisplacementTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodDisplacementTexture.wrapS = woodDisplacementTexture.wrapT = THREE.RepeatWrapping;
woodNormalTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodNormalTexture.wrapS = woodNormalTexture.wrapT = THREE.RepeatWrapping;
woodGlossTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodGlossTexture.wrapS = woodGlossTexture.wrapT = THREE.RepeatWrapping;
woodBumpTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodBumpTexture.wrapS = woodBumpTexture.wrapT = THREE.RepeatWrapping;
woodRoughnessTexture.repeat.set(textureRepeat.x, textureRepeat.y);
woodRoughnessTexture.wrapS = woodRoughnessTexture.wrapT = THREE.RepeatWrapping;

// Floor inside the house
const floorGeometry = new THREE.PlaneGeometry(houseLength, houseWidth);

// Set the 'aoMap' and 'displacementMap' textures' UVs to match the 'map' texture
floorGeometry.attributes.uv2 = floorGeometry.attributes.uv;

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.01;

// If using displacement map, consider enabling this
floorMaterial.displacementScale = 0.1; 

house.add(floor);


// Add Furniture and Details
// Chairs, vases, paintings, etc., can be added similarly, starting with basic geometries.


// Setup PointerLockControls
const controls = new PointerLockControls(camera, renderer.domElement);

// Add an event listener to lock the pointer to the canvas on click
document.addEventListener('click', function () {
    controls.lock();
}, false);

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let velocity = new THREE.Vector3();

// Add keyboard event listeners
document.addEventListener('keydown', function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
});

// Update your animate function
function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    const movementSpeed = 50.0;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    if (moveForward) velocity.z -= movementSpeed * delta;
    if (moveBackward) velocity.z += movementSpeed * delta;
    if (moveLeft) velocity.x -= movementSpeed * delta;
    if (moveRight) velocity.x += movementSpeed * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    prevTime = time;

    renderer.render(scene, camera);
}

// Initialize time for movement calculations
let prevTime = performance.now();

animate();