var dp_vs = 
`
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D tPic;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

// controls the amount of vertex displacement
uniform float displaceAmt;

varying vec2 vUv;
varying float vDisplace;

precision mediump float;

void main() {
   vUv = uv;

   vec4 clr = texture2D(tPic, uv);
   vDisplace = clr.r * displaceAmt;
   vec3 newPosition = (position.xyz + normal.xyz * vDisplace).xyz;

   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
}
`;