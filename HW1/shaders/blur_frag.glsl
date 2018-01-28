precision mediump float;

// special data type used to access texture stored on GPU
uniform sampler2D t1;

// need to know the resolution of texture so that we can grab neighbors of current pixel
uniform float rx;
uniform float ry;

uniform float mixVal;

// this has to have the same as in the vertex shader. Here, in the fragment shader, we interpolate across the textureCoordinates
varying vec2 UV;

void main() {
   vec2 texel = vec2(1.0 / rx, 1.0 / ry);

      const mat3 G = mat3( 1, 2, 1, 2, 4, 2, 1, 2, 1 ); // 3x3 Guassian blur kernel

      // fetch the 3x3 neighborhood of a fragment
      float tx0y0 = texture2D( t1, UV + texel * vec2( -1, -1 ) ).r;
      float tx0y1 = texture2D( t1, UV + texel * vec2( -1,  0 ) ).r;
      float tx0y2 = texture2D( t1, UV + texel * vec2( -1,  1 ) ).r;

      float tx1y0 = texture2D( t1, UV + texel * vec2(  0, -1 ) ).r;
      float tx1y1 = texture2D( t1, UV + texel * vec2(  0,  0 ) ).r;
      float tx1y2 = texture2D( t1, UV + texel * vec2(  0,  1 ) ).r;

      float tx2y0 = texture2D( t1, UV + texel * vec2(  1, -1 ) ).r;
      float tx2y1 = texture2D( t1, UV + texel * vec2(  1,  0 ) ).r;
      float tx2y2 = texture2D( t1, UV + texel * vec2(  1,  1 ) ).r;

      float valueG = (G[0][0] * tx0y0 + G[1][0] * tx1y0 + G[2][0] * tx2y0 + 
            G[0][1] * tx0y1 + G[1][1] * tx1y1 + G[2][1] * tx2y1 + 
            G[0][2] * tx0y2 + G[1][2] * tx1y2 + G[2][2] * tx2y2) / 16.0;

      vec4 texPix = texture2D(t1, UV);
      vec4 blurPix = vec4(valueG);

      gl_FragColor = mix(texPix, blurPix, mixVal * 2.0);
}

