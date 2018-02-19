var p_fs = 
`
precision mediump float;

uniform samplerCube tCube;

varying float noiseVal;
varying float noiseVal2;

varying vec3 vI, vWorldNormal;

void main() {

  vec3 color = vec3( 1.0, 0.0, 1.0 * ( 0.0, 0.0, 1.0 - (3.0 * noiseVal) ) );
  vec3 color2 = vec3( 1.0 * ( 1.0 - (3.0 * noiseVal2) ), 0.0, 0.0 );
  vec3 mix1 = mix(color, color2, 0.5); 

  //gl_FragColor = vec4( color.r, color2.gb, 1.0 );
   vec3 reflection = reflect(vI, vWorldNormal);
   vec4 envColor = textureCube(tCube, vec3(-reflection.x, reflection.yz));
   gl_FragColor = mix(vec4(envColor), vec4(mix1, 1.0), 0.2); 

}
`;