var w_fs = 
`
precision mediump float;

uniform sampler2D tWater;
uniform samplerCube tCube;
varying vec2 vUv;
varying float vDisplace;
varying float vReflect;
varying vec3 vI;
varying vec3 vWorldNormal;

void main() {
   vec3 reflection = reflect(vI, vWorldNormal);
   vec4 envColor = textureCube(tCube, vec3(-reflection.x, -reflection.yz));
   vec4 water = texture2D(tWater, vUv);

   vec4 mix1 = mix(envColor, water, vReflect);
   gl_FragColor = vec4(mix1.rgb, 1.0);
}
`;