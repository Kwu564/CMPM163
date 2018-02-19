// three.js
var container;
var camera, scene, renderer;
// gui
var controls, options, spawnerOptions, particlSystem;
var gui = new dat.GUI({width: 350});
// performance statistics
var stats;
// time
var tick = 0;
var clock = new THREE.Clock();

var material1;
var jaguar;

var tex1 = new THREE.TextureLoader().load("images/fire.png");
var tex2 = new THREE.TextureLoader().load("images/perlin-512.png");

init();
animate();

function init() {
   container = document.getElementById('container');

   // define the camera that looks onto this scene,
   // camera parameters (fovy, aspect, near plane, far plane)
   camera = new THREE.PerspectiveCamera(50.0, window.innerWidth / window.innerHeight, 1, 2000);

   // adds a default mouse listener to control the camera rotation and zoom
   var controls = new THREE.OrbitControls(camera);
   camera.position.set(0, 0, 100);
   controls.update();

   // keeps track of all elements used in the rendering process
   scene = new THREE.Scene();

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

   var uniforms1 = {
      in_val: {type: "f", value: 0.0},
      displaceAmt: {type: "f", value: 0.0},
      tCube: {type: "t", value: cubeMap}
   };

   material1 = new THREE.RawShaderMaterial({
      uniforms: uniforms1,
      vertexShader: p_vs,
      fragmentShader: p_fs       
   });

   var loader = new THREE.OBJLoader();
            
   loader.load('meshes/jaguar.obj', function (object) {
      
      object.traverse( function (child) {
         if (child instanceof THREE.Mesh) {
            child.material = material1;
         }
      });
      
      var s = 2;
      object.scale.set(s, s, s);
      jaguar = object;
      scene.add(jaguar);
   } );

   particleSystem = new THREE.GPUParticleSystem ({
      maxParticles: 250000,
      particleSpriteTex: tex1,
      particleNoiseTex: tex2
   });

   scene.add(particleSystem);

   // gui setup
   options = {
      position: new THREE.Vector3(),
      positionRandomness: .3,
      velocity: new THREE.Vector3(),
      velocityRandomness: .5,
      color: 0xf27d0c,
      colorRandomness: .2,
      turbulence: .5,
      lifetime: 2,
      size: 5,
      sizeRandomness: 1
   };

   spawnerOptions = {
      spawnRate: 15000,
      horizontalSpeed: 1.5,
      verticalSpeed: 1.33,
      timeScale: 1
   };

   // gui setup
   gui.add(options, "velocityRandomness", 0, 3);
   gui.add(options, "positionRandomness", 0, 3);
   gui.add(options, "size", 1, 20);
   gui.add(options, "sizeRandomness", 0, 25);
   gui.add(options, "colorRandomness", 0, 1);
   gui.add(options, "lifetime", .1, 10);
   gui.add(options, "turbulence", 0, 1);

   gui.add(spawnerOptions, "spawnRate", 10, 30000);
   gui.add(spawnerOptions, "timeScale", -1, 1);

   // statistics setup
   stats = new Stats();
   container.appendChild(stats.dom);

   // define renderer used to visualize geometry
   renderer = new THREE.WebGLRenderer();
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(window.innerWidth, window.innerHeight);
   container.appendChild(renderer.domElement);

   // scene resizes when window is resized
   window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
   renderer.setSize(window.innerWidth, window.innerHeight);
   
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
}

function animate() {
   requestAnimationFrame(animate);
   var delta = clock.getDelta() * spawnerOptions.timeScale;
   tick += delta;

   if (tick < 0) {
      tick = 0;
   }

   if (delta > 0) {

      options.position.x = Math.tan( tick * spawnerOptions.horizontalSpeed ) * 20;
      options.position.y = Math.tan( tick * spawnerOptions.verticalSpeed ) * 10;
      options.position.z = Math.tan( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;

      for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
         particleSystem.spawnParticle( options );
      }

   }
   particleSystem.update( tick );   
   render();
   stats.update();
}

function render() {
   var time = performance.now();
   material1.uniforms.in_val.value += 0.01;
   material1.uniforms.displaceAmt.value = 2.0 * Math.sin(time * 0.001); //0.01;

   // pass scene and camera into WebGL renderer
   renderer.render(scene, camera);
}