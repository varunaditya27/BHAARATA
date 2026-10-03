"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

// Brightness as height → Sobel normal → lit from a low angle.
const FRAG = `
precision mediump float;
uniform sampler2D img;
uniform vec2 texel;
uniform vec3 light;
varying vec2 uv;
float h(vec2 o) {
  vec3 c = texture2D(img, uv + o * texel).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}
void main() {
  // A wide kernel (3.5px) favours carved strokes over the fine grain of the stone.
  float tl = h(vec2(-3.5, -3.5)), t = h(vec2(0.0, -3.5)), tr = h(vec2(3.5, -3.5));
  float l  = h(vec2(-3.5,  0.0)),                        r  = h(vec2(3.5,  0.0));
  float bl = h(vec2(-3.5,  3.5)), b = h(vec2(0.0,  3.5)), br = h(vec2(3.5,  3.5));
  float dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
  float dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);
  vec3 n = normalize(vec3(-dx * 2.2, dy * 2.2, 1.0));
  float shade = 0.18 + 0.95 * max(dot(n, light), 0.0);
  float base = h(vec2(0.0));
  vec3 stone = vec3(0.86, 0.82, 0.74);
  gl_FragColor = vec4(stone * mix(shade, shade * (0.6 + base * 0.8), 0.35), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

/**
 * Simulated raking light: the photograph relit from a low angle, using
 * its own brightness as a rough height map. Carved strokes catch the
 * light on one side and shadow on the other, the way an epigrapher's
 * torch held flat to the stone shows them. It is an approximation —
 * stains and shadows in the photo read as relief too — and it says so
 * wherever it's offered.
 */
export function RakingLight({ src, azimuth, elevation = 18 }: { src: string; azimuth: number; elevation?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((az: number) => void) | null>(null);
  const azimuthRef = useRef(azimuth);

  useEffect(() => {
    azimuthRef.current = azimuth;
    drawRef.current?.(azimuth);
  }, [azimuth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { premultipliedAlpha: false });
    if (!canvas || !gl) return;
    let cancelled = false;
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      if (cancelled) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.uniform2f(gl.getUniformLocation(prog, "texel"), 1 / img.naturalWidth, 1 / img.naturalHeight);
      const lightLoc = gl.getUniformLocation(prog, "light");

      drawRef.current = (az: number) => {
        const a = (az * Math.PI) / 180;
        const e = (elevation * Math.PI) / 180;
        // Compass angle: 0 = light from the top of the image, clockwise.
        gl.uniform3f(lightLoc, Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      drawRef.current(azimuthRef.current);
    };
    return () => {
      cancelled = true;
      drawRef.current = null;
    };
  }, [src, elevation]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
