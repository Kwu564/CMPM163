// THREE.js gives us these automatically when a perspective camera is bound to the renderer
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Since we are using BufferGeometry, we have defined the attributes that we need manually
attribute vec3 position;
attribute vec2 texCoords;

// link variables between the vertex shader and the fragment shader
varying vec2 UV;

void main() {
   // pass our interpolated texCoords to the fragment shader
   UV = texCoords;

   // of course, we always have to output our vertices in clip coords by multiplying through a projection matrix
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

