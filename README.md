# 3D-house-project
Project Description
This project is an interactive 3D architectural view of a house created with Three.js. It displays various techniques in computer graphics, including primitive geometry creation, advanced lighting, texture application, and shader programming. Users can navigate through the house, observing different rooms, furniture, and lighting effects that simulate real-world scenarios.

How to Run
To run this project locally, follow these steps:

Ensure you have Node.js installed on your computer.
Clone this repository or download the project files.
Open a terminal in the project directory.
Run npm install to install the necessary dependencies.
Start a local server. One way to do this is by installing http-server via npm:
Copy code
npm install -g http-server
After installation, run http-server in the project directory.
Open your web browser and visit http://localhost:8080 to view the project.
File Structure
index.html - The entry point of the application. Contains the basic HTML structure.
styles.css - CSS file for basic styling.
app.js - The main JavaScript file that contains the Three.js code to create and control the 3D scene.
textures/ - Directory containing all the texture images used in the project.
models/ - Directory containing 3D models in .glb format used for furniture and other detailed objects.
shaders/ - Contains GLSL files for custom shader material (if applicable).
Key Features
Primitive Geometry: Walls, floors, and simple furniture are created using Three.js primitives.
Lighting: Simulated sunlight and indoor lighting with shadows for a realistic effect.
Textures: Use of POV-Ray to create original textures applied to various surfaces.
Interactivity: Pointer lock controls allow for first-person navigation through the house.
Shader Programming: A custom shader material is used to simulate glass transparency.
Dependencies
Three.js - 3D library used to create and display animated 3D computer graphics in a web browser.
GLTFLoader - For loading .glb model files.
Acknowledgements
Three.js documentation and examples for providing a foundational understanding of 3D graphics in the web.
POV-Ray for texture creation.
Free 3D models from Sketchfab and textures from Textures.com were used as references or starting points for custom assets.
Note
Replace the placeholders (such as URLs and directory paths) with the actual data relevant to your project. Ensure you have the rights or permissions to use any third-party resources included in your project.
