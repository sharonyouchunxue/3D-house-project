import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting - Implement two types of lighting for sunlight and indoor
// Sunlight simulation with DirectionalLight
const sunlight = new THREE.DirectionalLight(0xffffff, 0.5);
sunlight.position.set(100, 100, 100);
// Point the sunlight towards the center of the scene/house
sunlight.target.position.set(0, 0, 0);
scene.add(sunlight);
scene.add(sunlight.target);

//Enhance sunlight with ambient light for softer shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Indoor lighting with PointLight
const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
pointLight.position.set(0, 3, 0);
scene.add(pointLight);

//indoor lighting with SpotLight
const spotLight = new THREE.SpotLight(0xffffff, 0.8); //white light for a neutral color
// Position the spot light to illuminate the ceiling, and point it downwards
spotLight.position.set(0, 2.5, 0);
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
const skyTexture = textureLoader.load('images/EveningSky.jpg', function (texture) {
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

//create ground
// Load textures directly without the onLoad callback
const grassColorMap = textureLoader.load('textures/Grass/Grass001_4K-JPG_Color.jpg');
const grassAoMap = textureLoader.load('textures/Grass/Grass001_4K-JPG_AmbientOcclusion.jpg');
const grassDisplacementMap = textureLoader.load('textures/Grass/Grass001_4K-JPG_Displacement.jpg');
const grassNormalMap = textureLoader.load('textures/Grass/Grass001_4K-JPG_NormalGL.jpg');
const grassRoughnessMap = textureLoader.load('textures/Grass/Grass001_4K-JPG_Roughness.jpg');

// Set texture repeating after loading
const repeatTimes = 50; // Adjust this value to change the size appearance of the grass
[grassColorMap, grassAoMap, grassDisplacementMap, grassNormalMap, grassRoughnessMap].forEach(texture => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatTimes, repeatTimes);
});

// Create the material with the textures
const grassMaterial = new THREE.MeshStandardMaterial({
    map: grassColorMap,
    aoMap: grassAoMap,
    displacementMap: grassDisplacementMap,
    normalMap: grassNormalMap,
    roughnessMap: grassRoughnessMap,
    displacementScale: 0.1,
    metalness: 0
});

// Ground mesh creation
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMesh = new THREE.Mesh(groundGeometry, grassMaterial);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);


//Main components: the House Structure
// House group
const house = new THREE.Group();
scene.add(house);

//Wall Material
// Load texture
const colorMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_COL_2K.png');//color map
const aoMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_AO_2K.png');//ambient occlusion map
const displacementMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_DISP_2K.png');//displacement map
const normalMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_NRM_2K.png');//normal map
const glossMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_GLOSS_2K.png');//gloss map
const bumpMap = textureLoader.load('textures/Bricks/BricksDragfacedRunning008_BUMP_2K.png');//bump map

// Create the material with textures
const wallMaterial = new THREE.MeshStandardMaterial({
    map: colorMap,
    aoMap: aoMap,
    displacementMap: displacementMap,
    normalMap: normalMap,
    roughnessMap: glossMap,
    bumpMap: bumpMap,
    reflectivity: 0.3, 
});

//scale the displacement and bump maps.
wallMaterial.displacementScale = 0; 
wallMaterial.bumpScale = 0; 

//Wall Geometries
const wallDepth = 0.1;
const wallHeight = 3.5; // Increased wall height
const houseLength = 8; // Doubled the length
const houseWidth = 8; // Doubled the width

const frontWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const backWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const sideWallGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, houseWidth);

// Wallpaper material 
const wallpaperDepth = 0.06; // Thinner depth for wallpaper
const wallpaperTexturePath = 'textures/wallpaper.png'; // POV-Ray texture for wall paper
// Load the wallpaper texture
const wallpaperTexture = textureLoader.load(wallpaperTexturePath);

// Create the wallpaper material with the loaded textures
const wallpaperMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperTexture
});

wallpaperMaterial.displacementScale = 0.1;

// Function to create and position wallpaper
function addWallpaper(geometry, wallPosition, isOffsetPositive) {
    const wallpaper = new THREE.Mesh(geometry, wallpaperMaterial);
    let offsetX = 0;
    let offsetZ = 0;

    // Determine the direction of the offset based on the wall's facing direction
    // If the wall is a side wall (left/right), then offset along the X-axis
    if (wallPosition.x === -houseLength / 2 || wallPosition.x === houseLength / 2) {
        // Left wall would have positive offset, right wall would have negative offset
        offsetX = (wallPosition.x === -houseLength / 2) ? wallpaperDepth / 2 : -wallpaperDepth / 2;
    } else {
        // Front and back walls would offset along the Z-axis
        offsetZ = isOffsetPositive ? wallpaperDepth / 2 : -wallpaperDepth / 2;
    }
    // Adjust the wallpaper position further inside based on the specified offset
    wallpaper.position.set(wallPosition.x + offsetX, wallPosition.y, wallPosition.z + offsetZ);
    house.add(wallpaper);
}

//1. Front wall with door opening space
// Door dimensions
const doorWidth = 1.5;
const doorHeight = 2.5;
const doorOffsetFromEdge = 1;

//doorPositionX to align the door to the left side
const doorPositionX = -(houseLength / 2 - doorWidth / 2) + 0.5;
// Wall segments to create an opening space for the door
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
const topWallSegmentWidth = doorWidth + leftWallSegmentWidth;
const topWallGeometry = new THREE.BoxGeometry(topWallSegmentWidth, wallHeight - doorHeight, wallDepth);
const topWallSegment = new THREE.Mesh(topWallGeometry, wallMaterial);
// Position it above the door, aligned with the left side
topWallSegment.position.set(doorPositionX + doorWidth / 2 - topWallSegmentWidth / 4, doorHeight + (wallHeight - doorHeight) / 2, houseWidth / 2);
house.add(topWallSegment);

//Add front wallpaper
addWallpaper(new THREE.BoxGeometry(leftWallSegmentWidth, wallHeight, wallpaperDepth), leftWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(rightWallSegmentWidth, wallHeight, wallpaperDepth), rightWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(topWallSegmentWidth, wallHeight - doorHeight, wallpaperDepth), topWallSegment.position, false);


// Function to create a custom shader material for glass
function createGlassShaderMaterial() {
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 0.5 },
            color: { value: new THREE.Color(0xADD8E6) }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float opacity;
            uniform vec3 color;
            varying vec3 vNormal;
            void main() {
                float fresnelFactor = dot(normalize(vNormal), vec3(0, 0, -1));
                fresnelFactor = 1.0 - smoothstep(0.0, 1.0, fresnelFactor);
                fresnelFactor = mix(0.1, 1.0, fresnelFactor); // Ensures the glass is never fully transparent
                gl_FragColor = vec4(color, opacity * fresnelFactor);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide // Render both sides of the glass
    });
    return shaderMaterial;
}

let doorGroup;
function createDoor(width, height, positionX, positionY, positionZ, wallDepth) {
    // Define the wood and glass colors
    const woodColor = 0x6D4C41;
    const glassMaterial = createGlassShaderMaterial();
    const woodMaterial = new THREE.MeshStandardMaterial({ color: woodColor });
   
    // Initialize the doorGroup at the desired position
    const doorGroup = new THREE.Group();
    doorGroup.position.set(positionX - width / 2, positionY, positionZ);

    // Create the glass door mesh, position relative to doorGroup
    const glassGeometry = new THREE.PlaneGeometry(width / 2, height);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.set(3 * width / 4, height / 2, 0);
 
    // Create the wood door mesh, position relative to doorGroup
    const woodGeometry = new THREE.PlaneGeometry(width / 2, height);
    const woodMesh = new THREE.Mesh(woodGeometry, woodMaterial);
    woodMesh.position.set(width / 4, height / 2, 0);

    // Create the door handle, position relative to doorGroup
    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.2, 32);
    const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(width - 0.3, height / 2, 0.05);

    // Add the glass mesh, wood mesh, and handle to the doorGroup
    doorGroup.add(glassMesh);
    doorGroup.add(woodMesh);
    doorGroup.add(handle);

    // Frame materials and meshes
    const frameMaterial = new THREE.MeshStandardMaterial({ color: woodColor });
    const frameThickness = 0.1;
    const frameDepth = wallDepth + 0.05;

    // Create and position frame parts, adding them directly to the house
    const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, height + frameThickness * 2, frameDepth);
    const horizontalFrameGeometry = new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth);
    const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
    topFrame.position.set(positionX, positionY + height + frameThickness / 2, positionZ);
    const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
    leftFrame.position.set(positionX - width / 2 - frameThickness / 2, positionY + height / 2, positionZ);
    const rightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
    rightFrame.position.set(positionX + width / 2 + frameThickness / 2, positionY + height / 2, positionZ);

    // Adding frames to the house; these do not move with the door
    house.add(topFrame);
    house.add(leftFrame);
    house.add(rightFrame);
    house.add(doorGroup);

    // Return the doorGroup and its components for further manipulation
    return { doorGroup, glassMesh, woodMesh, topFrame, leftFrame, rightFrame, handle };
}

const doorComponents = createDoor(doorWidth, doorHeight, doorPositionX, 0, houseWidth / 2, wallDepth);
doorGroup = doorComponents.doorGroup;

//2.Back wall
const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.set(0, wallHeight / 2, -houseWidth / 2);
house.add(backWall);
// Add wallpaper to the back wall
addWallpaper(new THREE.BoxGeometry(houseLength, wallHeight, wallpaperDepth), { x: 0, y: wallHeight / 2, z: -houseWidth / 2 }, true);

//3. Left wall
const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
leftWall.position.set(-houseLength / 2, wallHeight / 2, 0);
house.add(leftWall);
addWallpaper(new THREE.BoxGeometry(wallpaperDepth, wallHeight, houseWidth), { x: -houseLength / 2, y: wallHeight / 2, z: 0 }, false);

//4. Right wall
const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
rightWall.position.set(houseLength / 2, wallHeight / 2, 0);
house.add(rightWall);
addWallpaper(new THREE.BoxGeometry(wallpaperDepth, wallHeight, houseWidth), { x: houseLength / 2, y: wallHeight / 2, z: 0 }, false);

//5. Internal wall dividing the house lengthwise (creating a separating spaces)
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
function applyWallpaperToPartition(wall, length, height, depth, applyToFrontBack = true, applyToTopBottom = true) {
    if (applyToFrontBack) {
        // Apply wallpaper to the front and back
        addWallpaper(new THREE.BoxGeometry(length, height, wallpaperDepth), { x: wall.position.x, y: wall.position.y, z: wall.position.z + depth / 2 }, true);
        addWallpaper(new THREE.BoxGeometry(length, height, wallpaperDepth), { x: wall.position.x, y: wall.position.y, z: wall.position.z - depth / 2 }, false);
    }
    if (applyToTopBottom) {
        // Apply wallpaper to the top (if visible)
        if (doorHeight < wallHeight) {
            addWallpaper(new THREE.BoxGeometry(length, wallpaperDepth, depth), { x: wall.position.x, y: wall.position.y + height / 2, z: wall.position.z }, true);
        }
        // Apply wallpaper to the bottom (if required)
        addWallpaper(new THREE.BoxGeometry(length, wallpaperDepth, depth), { x: wall.position.x, y: wall.position.y - height / 2, z: wall.position.z }, true);
    }
}

const partitionWallGeometry = new THREE.BoxGeometry(houseLength / 2 - wallDepth, wallHeight, wallDepth); 

// Room 1 partition wall
const room1PartitionWall = new THREE.Mesh(partitionWallGeometry, wallMaterial);
room1PartitionWall.position.set(-houseLength / 4, wallHeight / 2, 0); // Adjust position as necessary
house.add(room1PartitionWall);
applyWallpaperToPartition(room1PartitionWall, houseLength / 2 - wallDepth, wallHeight, wallDepth);

// Room 2 partition wall with door space
// Calculate the dimensions for the side wall segments
const sideWallSegmentLength = (houseLength / 2 - wallDepth - doorWidth) / 2;
const sideWallSegmentHeight = wallHeight;
const sideWallSegmentDepth = wallDepth;

// Create the left side wall segment for Room 2 partition
const leftSideWallGeometry = new THREE.BoxGeometry(sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);
const leftSideWall = new THREE.Mesh(leftSideWallGeometry, wallMaterial);
leftSideWall.position.set(houseLength / 4 - sideWallSegmentLength / 2 - doorWidth / 2, wallHeight / 2, 0);
house.add(leftSideWall);
applyWallpaperToPartition(leftSideWall, sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);

// Create the right side wall segment for Room 2 partition
const rightSideWallGeometry = new THREE.BoxGeometry(sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);
const rightSideWall = new THREE.Mesh(rightSideWallGeometry, wallMaterial);
rightSideWall.position.set(houseLength / 4 + sideWallSegmentLength / 2 + doorWidth / 2, wallHeight / 2, 0);
house.add(rightSideWall);
applyWallpaperToPartition(rightSideWall, sideWallSegmentLength, sideWallSegmentHeight, sideWallSegmentDepth);

// Create a top wall segment if the door height is less than the wall height
if (doorHeight < wallHeight) {
    const topWallSegmentLength = doorWidth;
    const topWallSegmentHeight = wallHeight - doorHeight;
    const topWallGeometry = new THREE.BoxGeometry(topWallSegmentLength, topWallSegmentHeight, wallDepth);
    const topWallSegment = new THREE.Mesh(topWallGeometry, wallMaterial);
    // Position the top wall segment above the door space, centered between the side segments
    topWallSegment.position.set(houseLength / 4, wallHeight - topWallSegmentHeight / 2, 0);
    house.add(topWallSegment);
    applyWallpaperToPartition(topWallSegment, topWallSegmentLength, topWallSegmentHeight, wallDepth);
}

//Load ceiling texture
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
  displacementMap: 0,//ceilingDisplacementTexture,
  roughnessMap: ceilingRoughnessTexture,
  metalnessMap: ceilingMetalnessTexture,
  bumpMap: ceilingBumpTexture,
  roughness: 0.8,
  metalness: 0
});

ceilingMaterial.displacementScale = 0.02; 

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


// Roofing
const houseDiagonal = Math.sqrt(houseLength * houseLength + houseWidth * houseWidth);
const roofOverhang = 0.5;
const roofHeight = 2.5; // Adjust to the desired roof's height from the base to the ridge
const roofBaseDiameter = houseDiagonal + roofOverhang;

//Load all PBR textures
const colorTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_Color.jpg');
const aoTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_AmbientOcclusion.jpg');
const displacementTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_Displacement.jpg');
const normalTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_NormalDX.jpg'); 
const opacityTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_Opacity.jpg');
const roughnessTexture = textureLoader.load('/textures/Roofing/RoofingTiles012A_4K-JPG_Roughness.jpg');

// Set repeat for all textures based on roof dimensions
const repeatX = roofBaseDiameter / 2; //based on UV mapping
const repeatY = roofHeight; //based on UV mapping
[colorTexture, aoTexture, displacementTexture, normalTexture, opacityTexture, roughnessTexture].forEach(texture => {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
});

// Set up the roof material with the PBR textures
const roofMaterial = new THREE.MeshStandardMaterial({
  map: colorTexture,
  aoMap: aoTexture,
  displacementMap: displacementTexture,
  normalMap: normalTexture,
  alphaMap: opacityTexture,
  roughnessMap: roughnessTexture,
  transparent: true, 
  displacementScale: 0,
  metalness: 0, 
  side: THREE.DoubleSide 
});

// The gableOverhang is half of the roofOverhang
const gableOverhang = roofOverhang / 2;

// Create the shape for the gabled roof
const gableShape = new THREE.Shape();
gableShape.moveTo(-gableOverhang, 0);
gableShape.lineTo(houseWidth / 2, roofHeight);
gableShape.lineTo(houseWidth + gableOverhang, 0);
gableShape.lineTo(-gableOverhang, 0);

// Extrude settings for creating 3D geometry from the shape
const extrudeSettings = {
  steps: 2,
  depth: houseLength + (roofOverhang * 2), // The depth of the roof includes the overhang on both front and back
  bevelEnabled: false,
};

// Create the geometry by extruding the shape
const gableGeometry = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);

// Create the roof mesh
const roofMesh = new THREE.Mesh(gableGeometry, roofMaterial);
// Position the roof so that the eaves start at the top of the wall height
roofMesh.position.set(-houseWidth / 2, wallHeight, -houseLength / 2 - roofOverhang);

// Add the roof to the house group
const houseGroup = new THREE.Group();
houseGroup.add(roofMesh); 
houseGroup.rotation.y = Math.PI / 2; // Rotate the group by 90 degree if necessary

//add the house group to the scene
scene.add(houseGroup);


//Floor: inside the house
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

floorMaterial.displacementScale = 0.1; 

house.add(floor);

// Add Furniture and Details
//Dinning Table
function createDiningTable(width, length, height, positionX, positionY, positionZ) {
    // Load the wood texture for the dining table
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('textures/WoodTexture.pov.png');//POV-Ray texture for table and chairs
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;

    const repeatX = length; // Number of times the texture should repeat along the length of the table
    const repeatY = width; // Number of times the texture should repeat along the width of the table
    woodTexture.repeat.set(repeatX, repeatY);

    // Define material for the dining table using the wood texture
    const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        alphaTest: 0.5, // Set threshold for transparency
        transparent: true, 
    });

    // Create the table top geometry
    const tableTopGeometry = new THREE.BoxGeometry(length, 0.1, width);
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.set(positionX, positionY + height / 2 + 0.05, positionZ);

    // Create the table legs geometry
    const legGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
    // Create and position the table legs relative to the table top
    const legs = []; // Array to store the legs

    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, tableMaterial); // Use the same material for the legs
        legs.push(leg);
    }
    // Positioning the legs
    legs[0].position.set(positionX - length / 2 + 0.1, positionY, positionZ - width / 2 + 0.1);
    legs[1].position.set(positionX - length / 2 + 0.1, positionY, positionZ + width / 2 - 0.1);
    legs[2].position.set(positionX + length / 2 - 0.1, positionY, positionZ - width / 2 + 0.1);
    legs[3].position.set(positionX + length / 2 - 0.1, positionY, positionZ + width / 2 - 0.1);

    // Group the table components together
    const diningTable = new THREE.Group();
    diningTable.add(tableTop, ...legs); // Spread the legs array to add all legs

    // Return dining table group
    return diningTable;
}

const diningTable1 = createDiningTable(2, 1.5, 2, 2, 0, 2.5);
house.add(diningTable1); // Add the dining table to the house group
   

// Vase and flowers
// Create a GLTFLoader instance
const gltfLoader = new GLTFLoader();
function loadFlowerBouquet(vaseGroup) {
    gltfLoader.load('obj/flower_bouquet.glb', function (gltf) {
        const flowerBouquet = gltf.scene;
        flowerBouquet.scale.set(2, 2, 2);
        flowerBouquet.position.set(0, 0, 0);
        vaseGroup.add(flowerBouquet);
     });
}

//Create Vase function
function createVase(outerRadius, innerRadius, height, thickness, positionX, positionY, positionZ) {
    const textureLoader = new THREE.TextureLoader();
    const vaseTexture = textureLoader.load('textures/glasstexture.jpg'); 
    vaseTexture.wrapS = vaseTexture.wrapT = THREE.RepeatWrapping;
    vaseTexture.repeat.set(1, 1); 

    const outerVaseMaterial = new THREE.MeshStandardMaterial({
        map: vaseTexture,
        side: THREE.FrontSide // Render the outside of the outer vase
    });

    const innerVaseMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa, 
        transparent: true,
        opacity: 0.5,
        side: THREE.BackSide 
    });

    // Outer vase geometry
    const outerVaseGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, height, 32);
    const outerVase = new THREE.Mesh(outerVaseGeometry, outerVaseMaterial);

    // Inner vase geometry 
    const innerHeight = height - thickness;
    const innerVaseGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, innerHeight, 32);
    const innerVase = new THREE.Mesh(innerVaseGeometry, innerVaseMaterial);
    innerVase.position.y = -thickness / 2; // Offset to simulate thickness of the bottom

    // Group the outer and inner vase meshes together
    const vaseGroup = new THREE.Group();
    vaseGroup.add(outerVase);
    vaseGroup.add(innerVase);

    // Position the group
    vaseGroup.position.set(positionX, positionY + height / 2, positionZ);
    return vaseGroup;
}

const vase1 = createVase(0.1, 0.08, 0.5, 0.05, 2, 1.1, 2.5);
house.add(vase1);
loadFlowerBouquet(vase1);


// Function to create chair
function createChair(width, height, depth, positionX, positionY, positionZ, texturePath) {
    // Load the wood texture
    const textureLoader = new THREE.TextureLoader();
    const woodTexture = textureLoader.load('textures/WoodTexture.pov.png');
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 1); // You may need to adjust these values

    // Define material for the chair using the wood texture
    const chairMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture
    });

    // Create the seat geometry
    const seatGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    // Create the backrest geometry
    const backrestGeometry = new THREE.BoxGeometry(width, height, 0.05);
    // Create the chair legs geometry
    const legGeometry = new THREE.BoxGeometry(0.1, height, 0.1);

    // Create the seat mesh
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.set(positionX, positionY + height / 2 + 0.05, positionZ);

    // Create the backrest mesh
    const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
    backrest.position.set(positionX, positionY + height + 0.05, positionZ - depth / 2);

    // Create and position the chair legs relative to the seat
    const legs = [];
    for (let i = 0; i < 4; i++) {
        const leg = new THREE.Mesh(legGeometry, chairMaterial);
        legs.push(leg);
    }

    legs[0].position.set(positionX - width / 2 + 0.05, positionY, positionZ - depth / 2 + 0.05);
    legs[1].position.set(positionX - width / 2 + 0.05, positionY, positionZ + depth / 2 - 0.05);
    legs[2].position.set(positionX + width / 2 - 0.05, positionY, positionZ - depth / 2 + 0.05);
    legs[3].position.set(positionX + width / 2 - 0.05, positionY, positionZ + depth / 2 - 0.05);

    // Group the chair components together
    const chair = new THREE.Group();
    chair.add(seat, backrest, ...legs); // Use spread syntax to add all legs
    // Return the assembled chair group
    return chair;
}

const chair1 = createChair(1, 1, 1, 1.9, 0, 1.5);
house.add(chair1);

const chair2 = createChair(1, 1, 1, 2.5, 0, -1.5);
chair2.rotation.y = Math.PI / -1.5;
house.add(chair2)


//Create Bed
function createBedWithHeadboard(length, width, height, headboardHeight, positionX, positionY, positionZ) {
    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const woodColorTexture = textureLoader.load('textures/Bed/Wood028_4K-JPG_Color.jpg');
    const woodDisplacementTexture = textureLoader.load('textures/Bed/Wood028_4K-JPG_Displacement.jpg');
    const woodNormalTexture = textureLoader.load('textures/Bed/Wood028_4K-JPG_NormalDX.jpg'); 
    const woodRoughnessTexture = textureLoader.load('textures/Bed/Wood028_4K-JPG_Roughness.jpg');

    // Define material for the bed frame with textures
    const bedMaterial = new THREE.MeshStandardMaterial({
        map: woodColorTexture,
        displacementMap: woodDisplacementTexture,
        normalMap: woodNormalTexture,
        roughnessMap: woodRoughnessTexture,
        displacementScale: 0 // lowered for subtle effect
    });

    // Create the flat bed body geometry and mesh
    const baseHeight = height; // The thickness of the flat bed body, assuming height is the desired thickness
    const baseGeometry = new THREE.BoxGeometry(length, baseHeight, width);
    const baseMesh = new THREE.Mesh(baseGeometry, bedMaterial);
    baseMesh.position.set(positionX, positionY + baseHeight / 2, positionZ); // Position adjusted so the base sits on top of the Y position

    // Create the headboard geometry and mesh
    const headboardDepth = 0.05; // The depth of the headboard for visibility
    const headboardGeometry = new THREE.BoxGeometry(length, headboardHeight, headboardDepth);
    const headboardMesh = new THREE.Mesh(headboardGeometry, bedMaterial);
    headboardMesh.position.set(positionX, positionY + baseHeight + headboardHeight / 2, positionZ - width / 2 + headboardDepth / 2); 

    // Group the base and the headboard together
    const bed = new THREE.Group();
    bed.add(baseMesh, headboardMesh);

    // Load the mattress and place it on the bed
    const mattressLoader = new GLTFLoader();
    mattressLoader.load('obj/matress.glb', function(gltf) {
        const mattress = gltf.scene;

        // Start with a small scale value since the mattress is too large
        mattress.scale.set(0.01, 0.005, 0.0125);

         // Position the mattress so that its bottom aligns with the top of the bed base
         mattress.position.set(
            positionX, // Center X on the bed
            positionY + baseHeight, 
            positionZ // Center Z on the bed
            );
        // Add the mattress to the bed group
        bed.add(mattress);
    });
    // Return the complete bed
    return bed;
}

//create and add the bed to the scene
const myBed = createBedWithHeadboard(2, 2, 0.3, 0.5, -2, 0, -2.8); 
scene.add(myBed);


//Wall pictures for decoration
//Define the frame material
//Load textures
const frameColorTexture = textureLoader.load('textures/Metal/Metal042A_4K-JPG_Color.jpg');
const frameDisplacementTexture = textureLoader.load('textures/Metal/Metal042A_4K-JPG_Displacement.jpg');
const frameNormalTexture = textureLoader.load('textures/Metal/Metal042A_4K-JPG_NormalDX.jpg'); 
const frameRoughnessTexture = textureLoader.load('textures/Metal/Metal042A_4K-JPG_Roughness.jpg');

// Define material for the bed frame with textures
const frameMaterial = new THREE.MeshStandardMaterial({
    map: frameColorTexture,
    displacementMap: frameDisplacementTexture,
    normalMap: frameNormalTexture,
    roughnessMap: frameRoughnessTexture,
    displacementScale: 0 // lowered for subtle effect
});

// Define the frame thickness
const frameThickness = 0.1; // Adjust thickness as needed
const frameDepth = 0.02; // The depth of the frame

// Define picture dimensions
const pictureWidth = 2;
const pictureHeight = 2;

// Create a box geometry for the frame that is slightly larger than the picture
const frameGeometry = new THREE.BoxGeometry(pictureWidth + frameThickness, pictureHeight + frameThickness, frameDepth);

// Function to create a frame and picture
function createFramedPicture(pictureTexturePath, offsetX, offsetY, wallZPosition, wallDepth) {
    // Load the picture texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(pictureTexturePath, function (texture) {
        // Define the wall picture material
        const pictureMaterial = new THREE.MeshBasicMaterial({
            map: texture, // Use the loaded texture
            side: THREE.DoubleSide
        });

        // Create the wall picture geometry
        const pictureGeometry = new THREE.PlaneGeometry(pictureWidth, pictureHeight);
        // Create the picture mesh
        const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);
        // Set the picture position slightly in front of the frame (we'll place the frame at wallZPosition)
        pictureMesh.position.set(offsetX, offsetY, wallZPosition + frameDepth / 2 + 0.01);
        // Create the frame mesh
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        // Set the frame position in front of the wall
        frameMesh.position.set(offsetX, offsetY, wallZPosition - frameDepth / 2);
        // Add the frame and picture to the scene
        house.add(frameMesh);
        house.add(pictureMesh);
    });
}

//Back wall pictures
// lculate Cathe Z position for the frames to be in front of the back wall
const frameZPosition = -houseWidth / 2 + wallDepth; 
// Create the left framed picture
const leftPictureOffsetX = -houseLength / 4; // Position for the left picture
createFramedPicture('images/sunflower.jpg', leftPictureOffsetX, wallHeight / 2, frameZPosition, wallDepth);
// Create the right framed picture
const rightPictureOffsetX = houseLength / 4; // Position for the right picture
createFramedPicture('images/redflower.jpg', rightPictureOffsetX, wallHeight / 2, frameZPosition, wallDepth);

//inside wall pictures
// Picture dimensions and position adjustments
const pictureOffsetXRoom1 = 0; // Centered on the partition
const pictureOffsetXRoom1Adjusted = pictureOffsetXRoom1 - 1.8
const pictureOffsetYRoom1 = wallHeight / 2; // Vertically centered
const pictureZPositionRoom1 = room1PartitionWall.position.z + wallDepth / 2 + frameDepth / 2 + 0.1; 

// Create the framed picture on Room 1 partition wall
createFramedPicture('images/micheile-henderson.jpg', pictureOffsetXRoom1Adjusted, pictureOffsetYRoom1, pictureZPositionRoom1, wallDepth);

// Load the grand piano model
gltfLoader.load(
    'obj/elegant_grand_piano_3d_model.glb',
    function (gltf) {
        // Retrieve the scene from the loaded glTF file
        const piano = gltf.scene;

        // Set position, rotation, and scale
        piano.position.set(3, 0, -2); // Set position
        piano.rotation.set(0, -Math.PI / 2, 0);
        piano.scale.set(0.5, 0.5, 0.5); // Set scale

        scene.add(piano);
    },
    function (xhr) {
        // Called while loading is progressing
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        // Called when loading has errors
        console.error('An error happened', error);
    }
);



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


let doorIsOpen = false;
let doorTargetRotationY = 0; // Target rotation in radians
const doorRotationSpeed = 0.02; // Speed at which the door opens/closes

function toggleDoor() {
    doorIsOpen = !doorIsOpen;
    doorTargetRotationY = doorIsOpen ? Math.PI / 2 : 0; // Opens 90 degrees
}

document.addEventListener('keydown', function(event) {
    switch (event.code) {
        case 'KeyE':// Choose an appropriate key for your controls
            toggleDoor();
            break;
    }
});

// animate function
function animate() {
    requestAnimationFrame(animate);

    // Door rotation logic
    if (doorIsOpen && doorGroup.rotation.y < doorTargetRotationY) {
        doorGroup.rotation.y += doorRotationSpeed;
        if (doorGroup.rotation.y > doorTargetRotationY) {
            doorGroup.rotation.y = doorTargetRotationY;
        }
    } else if (!doorIsOpen && doorGroup.rotation.y > doorTargetRotationY) {
        doorGroup.rotation.y -= doorRotationSpeed;
        if (doorGroup.rotation.y < doorTargetRotationY) {
            doorGroup.rotation.y = doorTargetRotationY;
        }
    }

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




