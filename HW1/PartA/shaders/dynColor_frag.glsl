precision mediump float;
precision mediump int;

uniform float time;

varying vec3 vPosition;
varying vec4 vColor;

void main() {
   vec4 color;
   color = vec4(vColor);
   color.r += sin(vPosition.x * 10.0 + time) * 0.5;
   color.b += cos(vPosition.x * 5.0 + time) * 1.0;

   gl_FragColor = color;
}