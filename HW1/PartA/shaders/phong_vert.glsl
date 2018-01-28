//Three.js gives us these automatically when a perspective camera is bound to the renderer
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

//Since we are using BufferGeometry, we have defined the attributes that we need manually
attribute vec3 position;
attribute vec3 normal;
//attribute vec2 texCoords;

// link variables between the vertex shader and the fragment shader
uniform vec3 light1_pos;
uniform vec3 light2_pos;
uniform vec3 light3_pos;

// provides an interface between the vertex and fragment shaders
varying vec3 N, L1, L2, L3, V;

void main() {
   // get the vertex position in camera coordinates
   vec4 position = viewMatrix * modelMatrix * vec4(position, 1.0);

   // use xyz vals to calculate vectors between vertex, light, and camera
   vec3 P = position.xyz;

   // get the normalized vertex normal in camera coordinates
   N = vec3(normalize(viewMatrix * modelMatrix * vec4(normal.xyz, 0.0)).xyz);

   // the lights' positions are defined in world coordinates,
   // we want to put them in camera coordinates too
   vec4 L1_cam = viewMatrix * vec4(light1_pos, 1.0);
   vec4 L2_cam = viewMatrix * vec4(light2_pos, 1.0);
   vec4 L3_cam = viewMatrix * vec4(light3_pos, 1.0);

   // get the normalized vectors from each light position to the vertex positions
   L1 = vec3(normalize(L1_cam - position).xyz);
   L2 = vec3(normalize(L2_cam - position).xyz);
   L3 = vec3(normalize(L3_cam - position).xyz);

   // reverse direction of position vector to get view vector from vertex to camera
   V = normalize(-P);

   // of course, we always have to output our vertices in clip coords by multiplying through a projection matrix.
   gl_Position = projectionMatrix * position;
}