var container;
var camera, scene, renderer;
var mesh1, mesh2, mesh3;
var light1_pos, light2_pos, light3_pos;
var phong_mat;
var tex_mat;
var texture1 = new THREE.TextureLoader().load('images/texture1.png');
var sign = -1;
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
   camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

   // position the camera to look toward the scene's origin
   camera.position.z = 5;

   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();

   // define three point lights and their positions
   var ambient = new THREE.Vector3(0.1, 0.1, 0.1);

   light1_pos = new THREE.Vector3(0.0, 10.0, 0.0); // above
   //light1_pos.add(new THREE.Vector3(0.0, -20.0, 0.0));
   var light1_diffuse = new THREE.Vector3(1.0, 0.0, 0.0);
   var light1_specular = new THREE.Vector3(1.0, 1.0, 1.0);

   light2_pos = new THREE.Vector3(-10.0, 0.0, 0.0); // left
   var light2_diffuse = new THREE.Vector3(0.0, 1.0, 0.0);
   var light2_specular = new THREE.Vector3(1.0, 1.0, 1.0);

   light3_pos = new THREE.Vector3(10.0, 0.0, 0.0); // right
   var light3_diffuse = new THREE.Vector3(0.0, 0.0, 1.0);
   var light3_specular = new THREE.Vector3(1.0, 1.0, 1.0);

   // create geometry made of 12 triangles
   var geometry1 = new THREE.TorusKnotGeometry(1, 0.1, 100, 16);
   var geometry2 = new THREE.BoxGeometry(1, 1, 1);
   var geometry3 = new THREE.CylinderGeometry(1, 1, 1, 8); 

   // this tells the shader what to expect will be passed in from the CPU,
   // shader neeeds to have uniform variables defined to be ready to recieve this data
   var uniforms1 = {
      ambient: {type: "v3", value: ambient},
      light1_pos: {type: "v3", value: light1_pos},
      light1_diffuse: {type: "v3", value: light1_diffuse},
      light1_specular: {type: "v3", value: light1_specular},

      light2_pos: {type: "v3", value: light2_pos},
      light2_diffuse: {type: "v3", value: light2_diffuse},
      light2_specular: {type: "v3", value: light2_specular},

      light3_pos: {type: "v3", value: light3_pos},
      light3_diffuse: {type: "v3", value: light3_diffuse},
      light3_specular: {type: "v3", value: light3_specular},      
   };

   var uniforms2 = {
      ambient: {type: "v3", value: ambient},
      light1_pos: {type: "v3", value: light1_pos},
      light1_diffuse: {type: "v3", value: light1_diffuse},
      light1_specular: {type: "v3", value: light1_specular},

      light2_pos: {type: "v3", value: light2_pos},
      light2_diffuse: {type: "v3", value: light2_diffuse},
      light2_specular: {type: "v3", value: light2_specular},

      light3_pos: {type: "v3", value: light3_pos},
      light3_diffuse: {type: "v3", value: light3_diffuse},
      light3_specular: {type: "v3", value: light3_specular},

      t1: {type: "t", value: texture1},
   }

   // define renderer used to visualize geometry
   renderer = new THREE.WebGLRenderer();
   renderer.setClearColor(0x999999);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   // scene resizes when window is resized
   window.addEventListener('resize', onWindowResize, false);

   // loads shaders, assigns materials, then do callback to animate
   loadShaders("shaders/phong_vert.glsl", "shaders/phong_frag.glsl", function(vert, frag) {
      // define a material,
      // we are defining our bridge to the shader programs
      phong_mat = new THREE.RawShaderMaterial ({
         uniforms: uniforms1,
         vertexShader: vert,
         fragmentShader: frag,
      });
      // define meshes which assigns a material to each geometry,
      // Every mesh here shares the same material
      mesh1 = new THREE.Mesh(geometry1, phong_mat);
      mesh1.translateX(-2.5);
      scene.add(mesh1);
   });

   loadShaders("shaders/tex_vert.glsl", "shaders/tex_frag.glsl", function(vert, frag) {
      // define a material,
      // we are defining our bridge to the shader programs
      tex_mat = new THREE.RawShaderMaterial ({
         uniforms: uniforms2,
         vertexShader: vert,
         fragmentShader: frag,
      });
      // define meshes which assigns a material to each geometry,
      // Every mesh here shares the same material

      mesh2 = new THREE.Mesh(geometry2, tex_mat);
      mesh2.translateX(0.0);
      scene.add(mesh2);
   });

   loadShaders("shaders/dynColor_vert.glsl", "shaders/dynColor_frag.glsl", function(vert, frag) {
      // define a material,
      // we are defining our bridge to the shader programs
      dynColor_mat = new THREE.RawShaderMaterial ({
         uniforms: {
            time: {type: "f", value: 1.0},
            my_color: {type: "v4", value: new THREE.Vector4(0.0, 0.5, 1.0, 1.0)}
         },
         vertexShader: vert,
         fragmentShader: frag,
      });
      // define meshes which assigns a material to each geometry,
      // Every mesh here shares the same material

      mesh3 = new THREE.Mesh(geometry3, dynColor_mat);
      mesh3.translateX(2.5);
      scene.add(mesh3);
      animate();
   });   
}

function animate() {
   requestAnimationFrame(animate);
   render();
}

function render() {
   var time = performance.now();
   light1_pos.add(new THREE.Vector3(0.0, -1 * time * 0.00001, 0.0));
   light2_pos.add(new THREE.Vector3(time * 0.00001, 0.0));
   light3_pos.add(new THREE.Vector3(-1 * time * 0.00001, 0.0));
   //light2_pos = time * 0.0009;
   //light3_pos = time * 0.0009;

   // rotate meshes
   mesh1.rotation.x = time * 0.0009;
   mesh1.rotation.y = time * 0.0009;

   mesh2.rotation.x = time * 0.0005;
   mesh2.rotation.y = time * 0.0009;

   mesh3.rotation.x = time * 0.0007;
   mesh3.rotation.y = time * 0.0003;
   mesh3.material.uniforms.time.value = time * 0.003;
   // pass scene and camera into WebGL renderer
   renderer.render(scene, camera);
}

function onWindowResize(event) {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize(window.innerWidth, window.innerHeight);
}