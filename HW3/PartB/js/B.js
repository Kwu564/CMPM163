var container;
var camera, scene, renderer;
var sdf_mesh;

init();
animate();

var texture1 = new THREE.TextureLoader().load( 'images/snow.jpg' );

function init() {
   container = document.getElementById('container');

   var width = window.innerWidth;
   var height = window.innerHeight;

   // define the camera that looks onto this scene,
   // camera parameters (fovy, aspect, near plane, far plane)
   camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, 0.1, 1000 );
   camera.position.z = 10;

   // adds a default mouse listener to control the camera rotation and zoom
   /*
   var controls = new THREE.OrbitControls(camera);
   camera.position.set(0, 0, 5);
   controls.update();
   */

   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();

   var geometry = new THREE.PlaneGeometry( width, height, 1, 1 );

   var sdf_input = {
      u_resolution: {type: "v2", value: new THREE.Vector2(width, height)},
      time: {type: "f", value: 0.0},
      tsnow: {type: "t", value: texture1}
   };

   var sdf_mat = new THREE.RawShaderMaterial({
      uniforms: sdf_input,
      vertexShader: sdf_vs,
      fragmentShader: sdf_fs
   });

   sdf_mesh = new THREE.Mesh(geometry, sdf_mat);
   scene.add(sdf_mesh); 

   // define renderer used to visualize geometry
   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   // scene resizes when window is resized
   window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize( window.innerWidth, window.innerHeight );
   sdf_mesh.material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
}

function animate() {
   requestAnimationFrame(animate);
   sdf_mesh.material.uniforms.time.value += 0.05;
   render();
}

function render() {
   var time = performance.now();
   // pass scene and camera into WebGL renderer
   renderer.render(scene, camera);
}