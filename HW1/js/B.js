var container;
var camera, scene, renderer;
var mesh;
var blur_mat;
var texture1 = new THREE.TextureLoader().load('images/texture1.png');
var mouseX = 0.0;
var mouseY = 0.0;

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

init();

function init() {
   container = document.getElementById('container');

   // define the camera that looks onto this scene,
   // camera parameters (fovy, aspect ratio, near plane, far plane)
   camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

   // position the camera to look toward the scene's origin
   camera.position.z = 2;

   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();

   // buffer geometry
   var geometry = new THREE.BufferGeometry();

   var vertices = new Float32Array([
      -1.0, -1.0, 0.0,
      +1.0, -1.0, 0.0,
      +1.0, +1.0, 0.0,

      -1.0, -1.0, 0.0,
      +1.0, +1.0, 0.0,
      -1.0, +1.0, 0.0,
   ]);

   var texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      0.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
   ]);

   geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
   geometry.addAttribute('texCoords', new THREE.BufferAttribute(texCoords, 2));

   // materials
   var uniforms = {
      t1: {type: "t", value: texture1},
      rx: {type: "f", value: 1024 / 2},
      ry: {type: "f", value: 1024 / 2},
      mixVal: {type: "f", value: 0.5},
   };

   // define renderer used to visualize geometry
   renderer = new THREE.WebGLRenderer();
   renderer.setClearColor(0x999999);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   // scene resizes when window is resized
   window.addEventListener('resize', onWindowResize, false);
   document.addEventListener('mousemove', onDocumentMouseMove, false);

   loadShaders("shaders/blur_vert.glsl", "shaders/blur_frag.glsl", function(vert, frag) {
      // define a material,
      // we are defining our bridge to the shader programs
      blur_mat = new THREE.RawShaderMaterial ({
         uniforms: uniforms,
         vertexShader: vert,
         fragmentShader: frag,
      });
      // define meshes which assigns a material to each geometry,
      // Every mesh here shares the same material

      mesh = new THREE.Mesh(geometry, blur_mat);
      mesh.translateX(0.0);
      // render both sides of each triangle
      mesh.material.side = THREE.DoubleSide;
      scene.add(mesh);
      animate();
   });   
}

function animate() {
   requestAnimationFrame(animate);
   render();
}

function render() {
   var time = performance.now();
   mesh.material.uniforms.mixVal.value = mouseX;
   // pass scene and camera into WebGL renderer
   renderer.render(scene, camera);
}

function onDocumentMouseMove(event) {
   event.preventDefault();
   mouseX = (event.clientX / window.innerWidth);
   mouseY = -(event.clientY / window.innerHeight);
}

function onWindowResize(event) {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize(window.innerWidth, window.innerHeight);
}