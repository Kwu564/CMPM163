var container;
var camera, scene, renderer;

//var input;
//var geometry;
//var material;
//var mesh;

var pen;
var group = new THREE.Group();

var vertexElements, textureElements;
var vertexElem, textureElem;
var controls;

var scale = 26;
var buffer = 0.6;
var angle = 0.0;
var translateX = 0.0;
var gamma = 0.1;

var str = "SDF Texts Are Awesome!";

// load texture atlas
var texture = new THREE.TextureLoader().load('fonts/OpenSans-Regular.png');
// when a texel covers more than one pixel
texture.magFilter = THREE.LinearFilter;
// when a texel covers less than one pixel
texture.minFilter = THREE.LinearFilter;

init();
animate();

function init() {
   container = document.getElementById('container');
   //camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
   camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 1000 );
   camera.position.z = 100;
   scene = new THREE.Scene();

   controls = new THREE.OrbitControls(camera);
   controls.update();
   // This actually creates the text and the mesh needed for it too
   createMesh1(20, str, metrics);
   console.log(group);
   renderer = new THREE.WebGLRenderer();
   renderer.setClearColor( 0x999999 );
   renderer.setSize( window.innerWidth, window.innerHeight );
   container.appendChild( renderer.domElement );
   window.addEventListener( 'resize', onWindowResize, false );
}

// gui for real time modification in browser window
var console = new function() {
   this.Red = 1.0;
   this.Green = 0.0;
   this.Blue = 0.0;
   this.Alpha = 1.0;
   this.Buffer = 0.6;
   this.Gamma = 0.1;
   this.ScaleX = 1.0;
   this.ScaleY = 1.0;
   this.ScaleZ = 1.0;
};

var gui = new dat.GUI();
gui.add(console, "Red").min(0.0).max(1.0);
gui.add(console, "Green").min(0.0).max(1.0);
gui.add(console, "Blue").min(0.0).max(1.0);
gui.add(console, "Alpha").min(0.0).max(1.0);
gui.add(console, "Buffer").min(0.0).max(1.0);
gui.add(console, "Gamma").min(0.0).max(1.0);
gui.add(console, "ScaleX").min(0.1).max(2.0);
gui.add(console, "ScaleY").min(0.1).max(2.0);
gui.add(console, "ScaleZ").min(0.1).max(2.0);

function animate() {
   var color, scale;
   requestAnimationFrame(animate);
   for (var i = 0; i < group.children.length; i++) {
      // color
      color = new THREE.Vector4(console.Red, console.Green, console.Blue, console.Alpha);
      group.children[i].material.uniforms.u_color.value = color;
      // buffer and gamma
      group.children[i].material.uniforms.u_buffer.value = console.Buffer;
      group.children[i].material.uniforms.u_gamma.value = console.Gamma;
      // scale
      //scale = new THREE.Vector3(console.Scale, console.Scale, console.Scale);
   }
   group.scale.set(console.ScaleX, console.ScaleY, console.ScaleZ);
   //var object0 = scene.children[0];
   //object0.material.uniforms.u_color.value.r = console.Red;

   render();
}

function render() {
   var time = performance.now();
   group.position.set(0.0, 40 * Math.sin(time / 700), 0.0);
   renderer.render(scene, camera);
}

//var scale = 64;

function onWindowResize( event ) {

   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();

   renderer.setSize( window.innerWidth, window.innerHeight );

}

function createMesh1(kerning, chr, m) {
   for (var i = 0; i < chr.length; i++) {
      addText1(i * kerning, chr[i], m);
      var geometry = new THREE.BufferGeometry();
      // itemSize = 3 because there are 3 values(components) per vertex
      geometry.addAttribute('position', new THREE.BufferAttribute(vertexElements, 3));
      geometry.addAttribute('texCoords', new THREE.BufferAttribute(textureElements, 2));
      geometry.translate(0.0, 0.0, 0.0);
      // materials (ie, linking to the shader program)
      var input = {
         t1: {type: "t", value: texture},
         u_color: {type: "v4", value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0)},
         u_buffer: {type: "f", value: buffer},
         u_gamma: {type: "f", value: gamma},
         texsize: {type: "v2", value: new THREE.Vector2(512, 1024)}
      };

      var material = new THREE.RawShaderMaterial({
         uniforms: input,
         vertexShader: sdf_vs,
         fragmentShader: sdf_fs,
         depthTest:      false,
         transparent:    true
      });      
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0.0, 0.0, 0.0);
      //mesh.material.wireframe = true;
      mesh.material.side = THREE.DoubleSide;
      group.add(mesh);
   }
   scene.add(group);
}

function addText1(offsetX, chr, m) {
   // get the data block associated with character chr
   var metric = m.chars[chr];
   var buf = metrics.buffer;
   var scal = scale / metrics.size;
   var factor = 1.0;
   // get each data component in that block
   var width = metric[0];
   var height = metric[1];
   var horiBearingX = metric[2];
   var horiBearingY = metric[3];
   var horiAdvance = metric[4];
   var posX = metric[5];
   var posY = metric[6];

   // Add a quad (= two triangles) per glyph.
   vertexElements = new Float32Array ([
      offsetX, 0.0, 0.0,
      offsetX + width + buf * 2, 0.0, 0.0,
      offsetX + width + buf * 2, height + buf * 2, 0.0,
 
      offsetX, 0.0, 0.0,
      offsetX + width + buf * 2, height + buf * 2, 0.0,
      offsetX, height + buf * 2, 0.0,       
   ]);
   // Define which part of image atlas should we use
   textureElements = new Float32Array([
      posX / 512, 1 - ((posY + height + buf * 2) / 1024),
      (posX + width + buf * 2) / 512, 1 - ((posY + height + buf * 2) / 1024),
      (posX + width + buf * 2) / 512, 1 - (posY / 1024),

      posX / 512, 1 - ((posY + height + buf * 2) / 1024),
      (posX + width + buf * 2) / 512, 1 - (posY / 1024),
      posX / 512, 1 - (posY / 1024)
   ]);
}