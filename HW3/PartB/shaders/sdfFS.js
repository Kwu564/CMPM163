var sdf_fs =
`
precision mediump float;
uniform vec2 u_resolution;
uniform float time;
uniform sampler2D tsnow;

varying vec2 vUV;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 100.0;
const float EPSILON = 0.0001;

// CSG operations
float intersectSDF(float distA, float distB) {
   return max(distA, distB);
}

float unionSDF(float distA, float distB) {
   return min(distA, distB);
}

float differenceSDF(float distA, float distB) {
   return max(distA, -distB);
}

float sphereSDF(vec3 samplePoint) {
   return length(samplePoint) - 1.0;
}

float cubeSDF(vec3 samplePoint, vec3 scale) {
   vec3 d = abs(samplePoint) - scale;

   float insideDistance = min(max(d.x, max(d.y, d.z)), 0.0);

   float outsideDistance = length(max(d, 0.0));

   return insideDistance + outsideDistance;
}

// places all 3D objects in the scene
float sceneSDF(vec3 samplePoint) {
   float sphereDist = sphereSDF(samplePoint + vec3(1.0, 0.0, -1.0));

   float cubeDist = cubeSDF(samplePoint + vec3(1.0, 0.0, -1.0), vec3 (0.8, 0.8, 0.8));

   float cubeDist2 = cubeSDF(samplePoint + vec3(-2.0, 0.0, 2.0), vec3 (0.8, 0.8, 0.8));

   float sphereDist2 = sphereSDF(samplePoint + vec3(-2.0, 0.0, 2.0));

   return unionSDF(unionSDF(cubeDist, sphereDist), mix(cubeDist2, sphereDist2, clamp(time / 10.0, 0.0, 1.0)));
   //return cubeSDF(samplePoint);
}

float shortestDistanceToSurface(vec3 eye, vec3 marchingDirection, float start, float end) {
   float depth = start;
   for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
      float dist = sceneSDF(eye + depth * marchingDirection);
      // If inside scene surface
      if (dist < EPSILON) {
         return depth;
      }
      // Move along view ray
      depth += dist;
      // Gone too far; give up
      if (depth >= end) {
         return end;
      }
   }
   return end;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
   vec2 xy = fragCoord - size / 2.0;
   float z = size.y / tan(radians(fieldOfView) / 2.0);
   return normalize(vec3(xy, -z));
}

// estimates the normal on the surface at point p by using points around it
vec3 estimateNormal(vec3 p) {
   return normalize(vec3(
      sceneSDF(vec3(p.x + EPSILON, p.y, p.z)) - sceneSDF(vec3(p.x - EPSILON, p.y, p.z)),
      sceneSDF(vec3(p.x, p.y + EPSILON, p.z)) - sceneSDF(vec3(p.x, p.y - EPSILON, p.z)),
      sceneSDF(vec3(p.x, p.y, p.z  + EPSILON)) - sceneSDF(vec3(p.x, p.y, p.z - EPSILON))
   ));
}

// phong lighting
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
   vec3 N = estimateNormal(p);
   vec3 L = normalize(lightPos - p);
   vec3 V = normalize(eye - p);
   vec3 R = normalize(reflect(-L, N));

   float dotLN = dot(L, N);
   float dotRV = dot(R, V);

   if (dotLN < 0.0) {
      // Light not visible from this point on the surface
      return vec3(0.0, 0.0, 0.0);
   } 

   if (dotRV < 0.0) {
      // Light reflection in opposite direction as viewer, apply only diffuse
      // component
      return lightIntensity * (k_d * dotLN);
   }
   return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
   const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
   vec3 color = ambientLight * k_a;

   vec3 light1Pos = vec3(4.0 * sin(time),
                       2.0,
                       4.0 * cos(time));
   vec3 light1Intensity = vec3(0.4, 0.4, 0.4);

   color += phongContribForLight(k_d, k_s, alpha, p, eye,
                               light1Pos,
                               light1Intensity);

   vec3 light2Pos = vec3(2.0 * sin(0.37 * time),
                       2.0 * cos(0.37 * time),
                       2.0);
   vec3 light2Intensity = vec3(0.4, 0.4, 0.4);

   color += phongContribForLight(k_d, k_s, alpha, p, eye,
                               light2Pos,
                               light2Intensity);    
   return color;
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
   // Based on gluLookAt man page
   vec3 f = normalize(center - eye);
   vec3 s = normalize(cross(f, up));
   vec3 u = cross(s, f);
   return mat4(
      vec4(s, 0.0),
      vec4(u, 0.0),
      vec4(-f, 0.0),
      vec4(0.0, 0.0, 0.0, 1)
   );
}

void main() {
   vec3 viewDir = rayDirection(45.0, u_resolution.xy, gl_FragCoord.xy);
   vec3 eye = vec3(8.0, 5.0, 7.0);
   mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
   vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;
   float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

   if (dist > MAX_DIST - EPSILON) {
      // Didn't hit anything
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
   }

   // The closest point on the surface to the eyepoint along the view ray
   vec3 p = eye + dist * worldDir;

   vec3 K_a = vec3(0.2, 0.2, 0.2);
   vec3 K_d = vec3(1, 0.5, 0.0);
   vec3 K_s = vec3(1.0, 1.0, 1.0);
   float shininess = 10.0;

   vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

   gl_FragColor = vec4(color, 1.0);
}
`;