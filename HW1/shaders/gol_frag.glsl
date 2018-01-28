precision mediump float;

// special data type used to access texture stored on GPU
uniform vec2 textureSize; // width and height of our screen
uniform sampler2D bufferTexture; // our input texture

void main() {
   // for simple scenes, can also use gl_FragCoord instead of uv info, divide by texture size to get a value between 0.0 and 1.0
   vec2 pt = gl_FragCoord.xy;

   vec4 C = texture2D(bufferTexture, vec2(pt.x / textureSize.x, pt.y / textureSize.y));

   float cx = pt.x / textureSize.x;

   float left = cx - 1.0 / textureSize.x;
   if (left < 0.0) {
      left = 1.0;
   }
   float right = cx + 1.0 / textureSize.x;
   if (left > 1.0)
   {
      left = 0.0;
   }

   float cy = pt.y / textureSize.y;

   float down = cy - 1.0 / textureSize.y;
   if (down < 0.0) {
      down = 1.0;
   }
   float up = cy + 1.0 / textureSize.y;
   if (up > 1.0) {
      up = 0.0;
   }

   vec4 arr[8];

   arr[0] = texture2D(bufferTexture, vec2(cx, up)); // N
   arr[1] = texture2D(bufferTexture, vec2(right, up)); // NE
   arr[2] = texture2D(bufferTexture, vec2(right, cy)); // E
   arr[3] = texture2D(bufferTexture, vec2(right, down)); // SE
   arr[4] = texture2D(bufferTexture, vec2(cx, down)); // S
   arr[5] = texture2D(bufferTexture, vec2(left, down)); // SW
   arr[6] = texture2D(bufferTexture, vec2(left, cy)); // W
   arr[7] = texture2D(bufferTexture, vec2(left, up)); // NW

   int cnt = 0;
   for (int i=0; i<8; i++) {
      if (arr[i].r > 0.5) {
         cnt++;
      }
   }

   if (C.r >= 0.5) { // cell is alive
      if (cnt == 2 || cnt == 3) {
         // Any live cell with two or three live neighbors lives on to the next generation
         gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      } else {
         // Any live cell with fewer than two live neighbours dies, as if caused by underpopulation
         // Any live cell with more than three live neighbours dies, as if by overpopulation
         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
   } else { // cell is dead
      if (cnt == 3) {
         // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction
         gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      } else {
         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
   }
}

