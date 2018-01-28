// THREE.js gives us these automatically when a perspective camera is bound to the renderer
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Since we are using BufferGeometry, we have defined the attributes that we need manually
attribute vec3 position;

void main() {
   // of course, we always have to output our vertices in clip coords by multiplying through a projection matrix
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

