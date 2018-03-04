var sdf_vs = 
`
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

varying vec2 vUV;

precision mediump float;

void main() {
   vUV = uv;
   gl_Position = projectionMatrix  * viewMatrix * modelMatrix  * vec4( position, 1.0 );
}
`;