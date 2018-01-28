precision mediump float;

// special data type used to access texture stored on GPU
uniform sampler2D t1;

varying vec2 UV;

varying vec3 V, N, L1, L2;
float spec_intensity = 32.0; //higher value indicates more rapid falloff

uniform vec3 ambient; //general ambient light in the scene applied to all objects

uniform vec3 light1_diffuse;
uniform vec3 light2_diffuse;

uniform vec3 light1_specular;
uniform vec3 light2_specular;

void main() {
   vec4 outColor1 = vec4(0.0);
   vec4 outColor2 = vec4(0.0);
   vec4 outColor3 = texture2D(t1, UV);

   //diffuse light depends on the angle between the light and the vertex normal
   float diff1 = max(0.0, dot(N, L1)); //just to make sure not negative
   vec3 color1 = diff1 * light1_diffuse;

   //specular highlights depend upon the position/orientation of the camera and the direction of the light reflecting off of this geometry
   vec3 R1 = normalize(reflect(-L1,N)); //get light vector reflected across the plane defined by the normal of this geometry
   float spec1 = pow( max(dot(R1, V), 0.0), spec_intensity); //raising the value to a particular intensity value shrinks the size of the specular highlight so that only a reflection vector (R1) that is very close to the view vector (V) will be applied to this fragment.

   color1 += spec1 * light1_specular;
   if (spec1 > 1.0) {
         outColor1 = vec4(light1_specular,1.0);
   } else {
         outColor1 = clamp(vec4(color1,1.0), 0.0,1.0);
   }


   //diffuse
   float diff2 = max(0.0, dot(N, L2));
   vec3 color2 = diff2 * light2_diffuse;


   //specular
   vec3 R2 = normalize(reflect(-L2,N));

   float spec2 = pow( max(dot(R2, V), 0.0), spec_intensity);
   color2 += spec2 * light2_specular;
   if (spec2 > 1.0) {
         outColor2 = vec4(light2_specular,1.0);
   } else {
         outColor2 = clamp(vec4(color2,1.0), 0.0,1.0);
   }

   gl_FragColor = clamp(vec4(ambient, 1.0) + outColor1 + outColor2 + outColor3, 0.0, 1.0); //add the two lights together, make sure final value is between 0.0 and 1.0
}