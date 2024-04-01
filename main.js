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


// Model the House Structure
// House group
const house = new THREE.Group();
scene.add(house);

// // Wall Material
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

// scale the displacement and bump maps.
wallMaterial.displacementScale = 0.005; 
wallMaterial.bumpScale = 0.005; 

// Individual Wall Geometries
const wallDepth = 0.1;
const wallHeight = 3.5; // Increased wall height
const houseLength = 8; // Doubled the length
const houseWidth = 8; // Doubled the width

const frontWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const backWallGeometry = new THREE.BoxGeometry(houseLength, wallHeight, wallDepth);
const sideWallGeometry = new THREE.BoxGeometry(wallDepth, wallHeight, houseWidth);

// Wallpaper material 
const wallpaperDepth = 0.06; // Thinner depth for wallpaper
const wallpaperColorMap = textureLoader.load('textures/Wallpaper/Wallpaper001C_4K-JPG_Color.jpg');
// Load the normal map (DX version if you're using DirectX normals, GL if you're using OpenGL)
const wallpaperNormalMap = textureLoader.load('textures/Wallpaper/Wallpaper001C_4K-JPG_NormalDX.jpg');
// Load the displacement map
const wallpaperDisplacementMap = textureLoader.load('textures/Wallpaper/Wallpaper001C-4K_JPG_Displacement.jpg');
// Load the roughness map
const wallpaperRoughnessMap = textureLoader.load('textures/Wallpaper/Wallpaper001C_4K-JPG_Roughness.jpg');

// Create the wallpaper material with the loaded textures
const wallpaperMaterial = new THREE.MeshStandardMaterial({
    map: wallpaperColorMap,
    normalMap: wallpaperNormalMap,
    displacementMap: wallpaperDisplacementMap,
    roughnessMap: wallpaperRoughnessMap
});

wallpaperMaterial.displacementScale = 0.1;

// Function to create and position wallpaper
function addWallpaper(geometry, wallPosition, isOffsetPositive) {
    const wallpaper = new THREE.Mesh(geometry, wallpaperMaterial);
    let offsetX = 0;
    let offsetZ = 0;

    // Determine the direction of the offset based on the wall's facing direction
    // If the wall is a side wall (left/right), we need to offset along the X-axis
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

//Add front wallpaper
addWallpaper(new THREE.BoxGeometry(leftWallSegmentWidth, wallHeight, wallpaperDepth), leftWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(rightWallSegmentWidth, wallHeight, wallpaperDepth), rightWallSegment.position, false);
addWallpaper(new THREE.BoxGeometry(topWallSegmentWidth, wallHeight - doorHeight, wallpaperDepth), topWallSegment.position, false);


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

const partitionWallGeometry = new THREE.BoxGeometry(houseLength / 2 - wallDepth, wallHeight, wallDepth); // Adjust length as necessary
// Room 1 partition wall
const room1PartitionWall = new THREE.Mesh(partitionWallGeometry, wallMaterial);
room1PartitionWall.position.set(-houseLength / 4, wallHeight / 2, 0); // Adjust position as necessary
house.add(room1PartitionWall);
applyWallpaperToPartition(room1PartitionWall, houseLength / 2 - wallDepth, wallHeight, wallDepth);


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

// Calculate the diagonal to ensure the roof will cover the entire house including overhang
const houseDiagonal = Math.sqrt(houseLength * houseLength + houseWidth * houseWidth);
const roofOverhang = 0.5;
const roofBaseDiameter = houseDiagonal + roofOverhang; // Include overhang in the roof diameter
const roofHeight = 2.5;

// Load all PBR textures
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
  displacementScale: 0.1,
  metalness: 0, 
  side: THREE.DoubleSide 
});

//Adjust cone geometry to accommodate the new diameter
const roofGeometry = new THREE.ConeGeometry(roofBaseDiameter / 2, roofHeight, 4);

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

// Function to create a dining table
function createDiningTable(width, length, height, positionX, positionY, positionZ) {
    // Define material for the dining table
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
    // Create the table top geometry
    const tableTopGeometry = new THREE.BoxGeometry(length, 0.1, width);
    // Create the table legs geometry
    const legGeometry = new THREE.BoxGeometry(0.2, height, 0.2);
    // Create the dining table top
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.set(positionX, positionY + height / 2 + 0.05, positionZ); // Position the top at a suitable height
    // Create and position the table legs relative to the table top
    const leg1 = new THREE.Mesh(legGeometry, tableMaterial);
    leg1.position.set(positionX - length / 2 + 0.1, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ - width / 2 + 0.1);
    const leg2 = new THREE.Mesh(legGeometry, tableMaterial);
    leg2.position.set(positionX - length / 2 + 0.1, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ + width / 2 - 0.1);
    const leg3 = new THREE.Mesh(legGeometry, tableMaterial);
    leg3.position.set(positionX + length / 2 - 0.1, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ - width / 2 + 0.1);
    const leg4 = new THREE.Mesh(legGeometry, tableMaterial);
    leg4.position.set(positionX + length / 2 - 0.1, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ + width / 2 - 0.1);
    // Group the table components together
    const diningTable = new THREE.Group();
    diningTable.add(tableTop, leg1, leg2, leg3, leg4);
    // Return the assembled dining table group
    return diningTable;
}

//Function to create chair
function createChair(width, height, depth, positionX, positionY, positionZ) {
    // Define material for the chair
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x6b3f25 }); // Brown color
    // Create the seat geometry
    const seatGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    // Create the backrest geometry
    const backrestGeometry = new THREE.BoxGeometry(width, height, 0.1);
    // Create the chair legs geometry
    const legGeometry = new THREE.BoxGeometry(0.1, height, 0.1);
    // Create the seat mesh
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.set(positionX, positionY + height / 2 + 0.05, positionZ); // Position the seat at a suitable height
    // Create the backrest mesh
    const backrest = new THREE.Mesh(backrestGeometry, chairMaterial);
    backrest.position.set(positionX, positionY + height + 0.05, positionZ - depth / 2);
    // Create and position the chair legs relative to the seat
    const leg1 = new THREE.Mesh(legGeometry, chairMaterial);
    leg1.position.set(positionX - width / 2 + 0.05, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ - depth / 2 + 0.05);
    const leg2 = new THREE.Mesh(legGeometry, chairMaterial);
    leg2.position.set(positionX - width / 2 + 0.05, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ + depth / 2 - 0.05);
    const leg3 = new THREE.Mesh(legGeometry, chairMaterial);
    leg3.position.set(positionX + width / 2 - 0.05, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ - depth / 2 + 0.05);
    const leg4 = new THREE.Mesh(legGeometry, chairMaterial);
    leg4.position.set(positionX + width / 2 - 0.05, positionY + height / 2 - legGeometry.parameters.height / 2, positionZ + depth / 2 - 0.05);
    // Group the chair components together
    const chair = new THREE.Group();
    chair.add(seat, backrest, leg1, leg2, leg3, leg4);

    // Return the assembled chair group
    return chair;
}

function createBedWithHeadboard(length, width, height, headboardHeight, positionX, positionY, positionZ) {
    // Define material for the bed frame
    const bedMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color

    // Create the bed frame geometry
    const bedFrameGeometry = new THREE.BoxGeometry(width, height, length);

    // Create the bed frame mesh
    const bedFrame = new THREE.Mesh(bedFrameGeometry, bedMaterial);
    bedFrame.position.set(positionX, positionY + height / 2, positionZ);

    // Create the mattress geometry (flat)
    const mattressGeometry = new THREE.PlaneGeometry(width - 0.1, length - 0.1);
    const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White color for mattress
    const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattress.rotation.x = -Math.PI / 2; // Rotate the mattress to be horizontal
    mattress.position.set(positionX, positionY + height, positionZ);

    // Create the headboard geometry
    const headboardGeometry = new THREE.BoxGeometry(0.1, headboardHeight, length);
    const headboard = new THREE.Mesh(headboardGeometry, bedMaterial);
    headboard.position.set(positionX - width / 2, positionY + height + headboardHeight / 2, positionZ);

    // Group the bed components together
    const bed = new THREE.Group();
    bed.add(bedFrame, mattress, headboard);

    return bed;
}

//Window for back wall position
// Create the window material with transparency and double-sided rendering
const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0xadd8e6, // Light blue color for the glass
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
});

// Make the window slightly less deep than the wall so that it can be seen from both sides.
const windowGeometry = new THREE.BoxGeometry(2, 2, wallDepth - 0.3); 
// Create the window mesh with the geometry and material
const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);

// This centers the window in the wall, allowing it to be visible from inside and outside.
const windowOffsetX = -houseLength / 4; 
const windowPositionY = wallHeight / 2;  // Center the window vertically
const windowPositionZ = -houseWidth / 2 + (wallDepth - 0.05) / 2; // Center the window in the wall's depth

// Set the window position
windowMesh.position.set(windowOffsetX, windowPositionY, windowPositionZ);

//add the frame around the window
 const frameThickness = 0.15; //thickness
 const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

// The frame thickness should be slightly more than the window's depth to ensure it's visible from outside.
const frameExtrusion = 0.05; // This value is how much the frame will protrude from the wall.
const frameDepth = wallDepth + frameExtrusion * 2; // The frame depth is the wall depth plus the extrusion on both sides.

// Create the frame pieces with the new depth
const horizontalFrameGeometry = new THREE.BoxGeometry(2 + frameThickness * 2, frameThickness, frameDepth);
const verticalFrameGeometry = new THREE.BoxGeometry(frameThickness, 2 + frameThickness * 2, frameDepth);

// Create the frame meshes
const topFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
const bottomFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
const leftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
const rightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);

// Calculate the correct offset for the frame to ensure it's visible from outside
// The z-position needs to be adjusted so the frame protrudes outwards from both sides of the wall.
const frameZOffset = windowPositionZ - frameExtrusion; // Push the frame out slightly so it's visible from outside.

// Position the frame parts correctly
topFrame.position.set(windowOffsetX, windowPositionY + 1 + frameThickness / 2, frameZOffset);
bottomFrame.position.set(windowOffsetX, windowPositionY - 1 - frameThickness / 2, frameZOffset);
leftFrame.position.set(windowOffsetX - 1 - frameThickness / 2, windowPositionY, frameZOffset);
rightFrame.position.set(windowOffsetX + 1 + frameThickness / 2, windowPositionY, frameZOffset);

// Add the frame meshes to the house
house.add(topFrame);
house.add(bottomFrame);
house.add(leftFrame);
house.add(rightFrame);
house.add(windowMesh);

// Create the right window mesh with the geometry and material
const rightWindowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
// Calculate the offset for the right window to be on the right side of the wall
const rightWindowOffsetX = houseLength / 4; // Place it a quarter length from the right edge
// Set the position for the right window and add it to the house
rightWindowMesh.position.set(rightWindowOffsetX, windowPositionY, windowPositionZ);
house.add(rightWindowMesh);
// Create frame meshes for the right window
const rightTopFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
const rightBottomFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
const rightLeftFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
const rightRightFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
// Position the frame parts for the right window
rightTopFrame.position.set(rightWindowOffsetX, windowPositionY + 1 + frameThickness / 2, frameZOffset);
rightBottomFrame.position.set(rightWindowOffsetX, windowPositionY - 1 - frameThickness / 2, frameZOffset);
rightLeftFrame.position.set(rightWindowOffsetX - 1 - frameThickness / 2, windowPositionY, frameZOffset);
rightRightFrame.position.set(rightWindowOffsetX + 1 + frameThickness / 2, windowPositionY, frameZOffset);
// Add the frame parts for the right window to the house
house.add(rightTopFrame);
house.add(rightBottomFrame);
house.add(rightLeftFrame);
house.add(rightRightFrame);

//window for front wall position



const diningTable1 = createDiningTable(2, 1.5, 2, 2, 0, 1.5);
house.add(diningTable1); // Add the dining table to the house group

const chair1 = createChair(1, 1, 1, 0, 0, 1.5);
house.add(chair1);

const chair2 = createChair(1, 1, 1, 0, 0, 3);
house.add(chair2)

const myBedWithHeadboard = createBedWithHeadboard(1.5, 2, 0.2, 0.5, 2, 0.1, -3.2);
scene.add(myBedWithHeadboard);


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