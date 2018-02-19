var container;
var camera, scene, renderer;
var skyMesh, box, jaguar;

var texture1 = new THREE.TextureLoader().load( 'images/angus.jpg' );
var texture2 = new THREE.TextureLoader().load( 'images/grass.png' );
var texture3 = new THREE.TextureLoader().load( 'images/snow.jpg' );
var texture4 = new THREE.TextureLoader().load( 'images/hill.jpg' );
var texture5 = new THREE.TextureLoader().load( 'images/height.jpg' );
var texture6 = new THREE.TextureLoader().load( 'images/water.jpg' );

init();
animate();

function init() {
   container = document.getElementById('container');

   // define the camera that looks onto this scene,
   // camera parameters (fovy, aspect, near plane, far plane)
   camera = new THREE.PerspectiveCamera(50.0, window.innerWidth / window.innerHeight, 1, 2000);

   // adds a default mouse listener to control the camera rotation and zoom
   var controls = new THREE.OrbitControls(camera);
   camera.position.set(0, 0, 5);
   controls.update();

   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();

   var dp_input = {
      displaceAmt: {type: "f", value: 0.0},
      tPic: {type: "t", value: texture1},
      tGrass: {type: "t", value: texture2},
      tSnow: {type: "t", value: texture3},
      tHill: {type: "t", value: texture4}
   };

   var dp_mat = new THREE.RawShaderMaterial({
      uniforms: dp_input,
      vertexShader: dp_vs,
      fragmentShader: dp_fs
   });

   var dp_geo = new THREE.PlaneGeometry(5, 5, 300, 300);

   var dp_mesh = new THREE.Mesh(dp_geo, dp_mat);
   dp_mesh.material.side = THREE.DoubleSide;
   dp_mesh.rotateX(-Math.PI/2);
   dp_mesh.rotateZ(Math.PI/2);
   scene.add(dp_mesh); 

   var cubeMap = new THREE.CubeTextureLoader()
      .setPath("./cubeMap/")
      .load([
         'posx.jpg',
         'negx.jpg',
         'posy.jpg',
         'negy.jpg',
         'posz.jpg',
         'negz.jpg'
      ]);

   // this tells the shader what to expect will be passed in from the CPU,
   // shader needs to have uniform variables defined to be ready to recieve this data
   var sky_input = {
      "tCube": {type: "t", value: cubeMap}
   };

   // this is the bridge to our shader programs
   var sky_mat = new THREE.RawShaderMaterial({
      uniforms: sky_input,
      vertexShader: sb_vs,
      fragmentShader: sb_fs
   });

   sky_mat.depthWrite = false;
   sky_mat.side = THREE.BackSide;

   var sky_geo = new THREE.BoxGeometry(2000, 2000, 2000);

   sky_mesh = new THREE.Mesh(sky_geo, sky_mat);

   scene.add(sky_mesh);

   // create the environment map material for our mesh
   var em_input = {
      tCube: {type: "t", value: cubeMap}
   };

   var em_mat = new THREE.RawShaderMaterial({
      uniforms: em_input,
      vertexShader: em_vs,
      fragmentShader: em_fs
   });

   var w_input = {
      tCube: {type: "t", value: cubeMap},
      displaceAmt: {type: "f", value: 0.0},
      reflect: {type: "f", value: 0.0},
      tHeight: {type: "t", value: texture5},
      tWater: {type: "t", value: texture6}
   };

   var w_mat = new THREE.RawShaderMaterial({
      uniforms: w_input,
      vertexShader: w_vs,
      fragmentShader: w_fs
   });

   var w_geo = new THREE.PlaneGeometry(6, 6, 300, 300);

   var w_mesh = new THREE.Mesh(w_geo, w_mat);
   w_mesh.material.side = THREE.DoubleSide;
   w_mesh.rotateX(Math.PI/2);
   w_mesh.position.y = 0.2;
   scene.add(w_mesh);

   // define renderer used to visualize geometry
   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   // scene resizes when window is resized
   window.addEventListener('resize', onWindowResize, false);
}

// gui for real time modification in browser window
var console = new function() {
   this.land_displace = 1.0;
   this.water_strength = 0.1;
   this.water_reflect = 0.7;
};

var gui = new dat.GUI();
gui.add(console, "land_displace").min(0.0).max(1.0);
gui.add(console, "water_strength").min(0.0).max(1.0);
gui.add(console, "water_reflect").min(0.0).max(1.0);

function onWindowResize(event) {
   renderer.setSize(window.innerWidth, window.innerHeight);
   
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
}

function animate() {
   requestAnimationFrame(animate);
   render();
}

function render() {
   var time = performance.now();
   // set the displacement value of the mesh plane
   // terrain displacement
   var object0 = scene.children[0];
   object0.material.uniforms.displaceAmt.value = console.land_displace;
   // water displacement
   var object2 = scene.children[2];
   object2.material.uniforms.displaceAmt.value = console.water_strength * (Math.sin(time * 0.001));
   // water reflection
   object2.material.uniforms.reflect.value = console.water_reflect;
   // pass scene and camera into WebGL renderer
   renderer.render(scene, camera);
}