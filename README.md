# 3D-house-project
## Project Description
 This project is an interactive 3D architectural view of a house developed with Three.js. It demonstrates the use of primitive geometry, advanced lighting and shading, and texture application, including textures created with POV-Ray. Users can explore the house in a first-person view, experiencing different lighting scenarios and detailed models that enhance the realism of the architectural design.

## How to Run
To run this project with Vite, a modern build tool that significantly improves the development experience, follow these steps:

- Ensure Node.js is installed on your computer.
- Clone the repository or download the project files to your local machine.
- Navigate to the project directory in a terminal or command prompt.
   Run npm install to install project dependencies, including Vite.
Start the Vite development server with:
Copy code
npx vite
Open a web browser and go to http://localhost:5173/ to view the application. The port number may vary; refer to the terminal output to confirm the correct URL.
File Structure
index.html - Entry point for the application, hosting the basic HTML structure.
styles.css - Contains styling for the application.
main.js - The main JavaScript file, where the Three.js scene is set up and controlled.
textures/ - A directory with all texture images, some of which are generated using POV-Ray.
models/ - Contains 3D model files in .glb format for detailed objects within the scene.
shaders/ - If custom shaders are used, this directory will contain GLSL files for those materials.
Key Features
Primitives and Models: Uses Three.js primitives for basic shapes and GLTF models for complex objects.
Lighting Techniques: Implements both sunlight simulation and indoor lighting with shadows.
Interactive Controls: Uses PointerLockControls for immersive navigation through the house.
Custom Shaders: Incorporates a custom shader for effects like glass transparency.
Original Textures: Features textures created with POV-Ray, showcasing unique surface details.
Dependencies
Three.js for creating and displaying 3D graphics.
Vite for an optimized development and build process
