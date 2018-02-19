var w_vs = 
`
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D tHeight;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

// controls the amount of vertex displacement
uniform float displaceAmt;
uniform float reflect;

varying vec2 vUv;
varying float vDisplace;
varying float vReflect;
varying vec3 vI;
varying vec3 vWorldNormal;

precision mediump float;

void main() {
   vReflect = reflect;
   // environment mapping stuff
   vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
   vec4 worldPosition = modelMatrix * vec4(position, 1.0);

   vWorldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1], modelMatrix[2].xyz) * normal);

   vI = worldPosition.xyz - cameraPosition;
   // water displacement stuff
   vUv = uv;

   vec4 clr = texture2D(tHeight, uv);
   vDisplace = clr.r * displaceAmt;
   vec3 newPosition = (position.xyz + normal.xyz * vDisplace).xyz;

   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(newPosition, 1.0);
}
`;