var sdf_vs = 
`
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 texsize;

attribute vec3 position;
attribute vec2 texCoords;

varying vec2 UV;

void main() {
   UV = texCoords;
   gl_Position = projectionMatrix * modelMatrix * viewMatrix * vec4(position, 1.0);
}
`;