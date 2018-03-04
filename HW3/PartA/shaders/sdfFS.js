var sdf_fs = 
`
precision mediump float;

uniform sampler2D t1;
uniform vec4 u_color;
uniform float u_buffer;
uniform float u_gamma;

varying vec2 UV;

void main() {
   float dist = texture2D(t1, UV).r;
   float alpha = smoothstep(u_buffer - u_gamma, u_buffer + u_gamma, dist);
   gl_FragColor = vec4(u_color.rgb, alpha * u_color.a);
   //gl_FragColor = vec4(texture2D(t1, UV));
}
`;