var em_fs =
`
precision mediump float;

uniform samplerCube tCube;

varying vec3 vI, vWorldNormal;

void main() {
   vec3 reflection = reflect(vI, vWorldNormal);
   vec4 envColor = textureCube(tCube, vec3(-reflection.x, reflection.yz));
   gl_FragColor = vec4(envColor);
}
`;