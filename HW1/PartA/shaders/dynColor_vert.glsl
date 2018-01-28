precision mediump float;
precision mediump int;

// Three.js gives us these automatically when a perspective camera is bound to the renderer
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// Three.js geometry creates these for us (and also texture coords, which aren't using here)
attribute vec3 position;

uniform vec4 my_color;
uniform float time;

// provides an interface between the vertex and fragment shaders
varying vec3 vPosition;
varying vec4 vColor;

void main() {
   vec3 pos = position;
   vPosition = pos;
   vColor = my_color;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}