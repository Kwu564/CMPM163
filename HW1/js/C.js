var bufferGeometry, boxGeometry;
var boxMesh, bufferMesh;
var camera, scene, renderer;
var bufferCamera, bufferScene;
var bufferMaterial, boxMaterial;
var FBO_A, FBO_B;
var fullScreenQuad;

var resX = 4000;
var resY = 4000;

function loadShaders(vert_dir, frag_dir, onLoad) {
   var loader = new THREE.FileLoader().setResponseType('text');
   var vs, fs;
   loader.load(vert_dir, function(data) {
      vs = data;
      loader.load(frag_dir, function(data) {
         fs = data;
         onLoad(vs, fs);
      });
   });
}

scene_setup();

function scene_setup() {
   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();
   var width = window.innerWidth;
   var height = window.innerHeight;

   camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
   // position the camera to look toward the scene's origin
   camera.position.z = 5;

   // define the camera that looks onto this scene,
   // camera parameters (fovy, aspect ratio, near plane, far plane)
   bufferCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);

   // position the camera to look toward the scene's origin
   bufferCamera.position.z = 0.2;

   renderer = new THREE.WebGLRenderer();
   renderer.setSize(window.innerWidth, window.innerHeight);
   document.body.appendChild(renderer.domElement);
}

FBO_setup();

function FBO_setup() {
   // Create off-screen buffer scene
   bufferScene = new THREE.Scene();

   // Create 2 buffer textures
   FBO_A = new THREE.WebGLRenderTarget(resX, resY, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
   FBO_B = new THREE.WebGLRenderTarget(resX, resY, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

   // Begin by passing an initial "seed" texture ot shader, containing randomly placed calls
   var dataTexture = createDataTexture();

   var uniforms = {
            bufferTexture: {type: "t", value: dataTexture},
            // shader does not have access to these global variables, so pass in the resolution
            textureSize: {type: "v2", value: new THREE.Vector2(resX, resY)},
         };

   loadShaders("shaders/gol_vert.glsl", "shaders/gol_frag.glsl", function(vert, frag) {
      // define a material,
      // we are defining our bridge to the shader programs
      bufferMaterial = new THREE.RawShaderMaterial ({
         uniforms: uniforms,
         vertexShader: vert,
         fragmentShader: frag,
      });
      // define meshes which assigns a material to each geometry,
      bufferGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
      bufferMesh = new THREE.Mesh(bufferGeometry, bufferMaterial);
      bufferScene.add(bufferMesh);

      // Draw textureB to screen
      //fullScreenQuad = new THREE.Mesh(plane, new THREE.MeshBasicMaterial());
      //scene.add(fullScreenQuad);

      // now we use the "texture" from our off-screen buffer (FBO_B) as a material to render it onto our main scene
      boxMaterial = new THREE.MeshBasicMaterial({map: FBO_B.texture});
      boxGeometry = new THREE.BoxGeometry(5, 5, 5);
      boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
      boxMesh.position.z = -10;
      scene.add(boxMesh);
      render();
   });
}

function render() {
   requestAnimationFrame(render);
   var time = performance.now();

   // draw to the active offscreen buffer(whatever is store in FBO_B), that is the output of this rendering
   // pass will be stored in the texture associated with FBO_B
   renderer.render(bufferScene, bufferCamera, FBO_B);

   // grab that texture and map it to the full screen quad
   //fullScreenQuad.material.map = FBO_B.texture;

   // then draw the full screen quad to the on screen buffer, ie, the display
   renderer.setClearColor(0x999999);
   renderer.render(scene, camera);

   boxMesh.rotation.x = time * 0.0009;
   boxMesh.rotation.y = time * 0.0009;

   // now prepare for the next cycle by swapping FBO_A and FBO_B, so that the previous frame's *output*
   // becomes the next frame's *input*
   var t = FBO_A;
   FBO_A = FBO_B;
   FBO_B = t;
   bufferMaterial.uniforms.bufferTexture.value = FBO_A.texture;
}

function createDataTexture() {
   // create a buffer with color data
   var size = resX * resY;
   var data = new Uint8Array(4 * size);

   for (var i=0; i<size; i++) {
      var stride = i * 4;
      if (Math.random() < 0.5) {
         data[stride] = 255;
         data[stride + 1] = 255;
         data[stride + 2] = 255;
         data[stride + 3] = 255;
      } else {
         data[stride] = 0;
         data[stride + 1] = 0;
         data[stride + 2] = 0;
         data[stride + 3] = 255;
      }
   }
   // use the buffer to create a DataTexture
   console.log(data);
   var texture = new THREE.DataTexture(data, resX, resY, THREE.RGBAFormat);
   // just a weird thing that THREE.js wants you to do after you set the data for the texture
   texture.needsUpdate = true;

   return texture;
}