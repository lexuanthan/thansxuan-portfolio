"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroMode, MotionPreset } from "@/lib/home-config";

interface HeroLxt3DProps {
  mode?: HeroMode;
  motionPreset?: MotionPreset;
  posterUrl?: string;
  portraitUrl?: string;
  authorName?: string;
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_uv;
  uniform vec2 u_pointer;
  uniform float u_time;

  void main() {
    vec2 uv = v_uv;
    vec2 lightPos = vec2(0.32 + u_pointer.x * 0.14, 0.74 - u_pointer.y * 0.14);
    float dist = distance(uv, lightPos);
    float beam = smoothstep(0.75, 0.05, dist) * 0.22;

    // Diagonal sunlit window ray
    float diag = abs((uv.x * 0.85 + uv.y * 0.55) - (0.78 + sin(u_time * 0.5) * 0.03));
    float windowRay = smoothstep(0.28, 0.0, diag) * 0.14;

    vec3 warmSun = vec3(1.0, 0.98, 0.93);
    vec3 coolStudio = vec3(0.87, 0.93, 1.0);
    vec3 color = mix(coolStudio, warmSun, beam + windowRay);
    float alpha = clamp(beam + windowRay, 0.0, 0.28);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function HeroLxt3D({
  mode = "3d",
  motionPreset = "standard",
  posterUrl,
  portraitUrl,
  authorName = "Lê Xuân Thân",
}: HeroLxt3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);
  const pointerRef = useRef({ x: 0, y: 0 });

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) {
        setTilt({ x: 0, y: 0 });
      }
    };
    mediaQuery.addEventListener?.("change", onChange);
    return () => mediaQuery.removeEventListener?.("change", onChange);
  }, []);

  // Pause when out of viewport or tab hidden
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    const handleVisibility = () => {
      setIsTabActive(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const effectivePreset: MotionPreset =
    reducedMotion || !isVisible || !isTabActive ? "static" : motionPreset;

  // Lightweight WebGL studio specular lighting layer with full context cleanup
  useEffect(() => {
    if (mode !== "3d" || effectivePreset === "static") return;
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext("webgl", { alpha: true, antialias: true }) as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl", { alpha: true }) as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const pointerLoc = gl.getUniformLocation(program, "u_pointer");
    const timeLoc = gl.getUniformLocation(program, "u_time");

    let rafId = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      if (!gl) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      if (pointerLoc) {
        gl.uniform2f(pointerLoc, pointerRef.current.x, pointerRef.current.y);
      }
      if (timeLoc) {
        gl.uniform1f(timeLoc, (now - startTime) * 0.001);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (gl) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [mode, effectivePreset]);

  const maxDeg = effectivePreset === "standard" ? 5 : effectivePreset === "light" ? 2.5 : 0;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (maxDeg === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const clampedX = Math.max(-1, Math.min(1, nx));
    const clampedY = Math.max(-1, Math.min(1, ny));
    pointerRef.current = { x: clampedX, y: clampedY };
    setTilt({
      x: Number((-clampedY * maxDeg).toFixed(2)),
      y: Number((clampedX * maxDeg).toFixed(2)),
    });
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
    setTilt({ x: 0, y: 0 });
  };

  // Mode 2: Custom Static Image
  if (mode === "image" && posterUrl) {
    return (
      <div
        ref={containerRef}
        data-testid="hero-lxt-visual"
        data-hero-mode="image"
        className="relative aspect-[11/9] w-full max-w-[560px] overflow-hidden rounded-[12px] border border-[var(--color-border-subtle)] bg-[#F4F6FA] shadow-[var(--shadow-card)]"
      >
        <Image
          src={posterUrl}
          alt={authorName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="object-cover"
        />
      </div>
    );
  }

  // Mode 3: Author Portrait
  if (mode === "portrait" && (portraitUrl || posterUrl)) {
    const src = portraitUrl || posterUrl || "";
    return (
      <div
        ref={containerRef}
        data-testid="hero-lxt-visual"
        data-hero-mode="portrait"
        className="relative mx-auto aspect-[4/4.3] w-full max-w-[440px] overflow-hidden rounded-[12px] border border-[var(--color-border-subtle)] bg-gradient-to-b from-[#F4F7FF] to-[#EFECE4] p-4 shadow-[var(--shadow-card)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[8px]">
          <Image
            src={src}
            alt={`Chân dung ${authorName}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 440px"
            className="object-cover object-top"
          />
        </div>
      </div>
    );
  }

  // Mode 1 (Default): LXT 3D Studio Sculpture with zero-CLS SVG/CSS3D + WebGL Specular Studio Layer
  return (
    <div
      ref={containerRef}
      data-testid="hero-lxt-visual"
      data-hero-mode="3d"
      data-motion-preset={effectivePreset}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative mx-auto aspect-[11/9] w-full max-w-[560px] select-none"
      style={{ perspective: "1100px" }}
      aria-label="Biểu tượng 3D LXT Studio — Lê Xuân Thân"
      role="img"
    >
      {/* Ambient studio daylight aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-[20px] opacity-90"
        style={{
          background:
            "radial-gradient(64% 62% at 54% 44%, rgba(212, 228, 255, 0.72) 0%, rgba(245, 240, 229, 0.55) 54%, rgba(250, 250, 247, 0) 100%)",
        }}
      />

      {/* Interactive 3D Stage */}
      <div
        className={`relative h-full w-full transition-transform duration-300 ease-out ${
          effectivePreset !== "static" ? "animate-lxt-float" : ""
        }`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <svg
          viewBox="0 0 640 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_24px_42px_rgba(23,36,58,0.11)]"
        >
          <defs>
            {/* Studio Wall & Window Light Gradient */}
            <linearGradient id="lxt-studio-bg" x1="80" y1="30" x2="560" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5F8FF" />
              <stop offset="52%" stopColor="#EEF3FC" />
              <stop offset="100%" stopColor="#F4EFE6" />
            </linearGradient>

            {/* Sunlit Window Gobo Beam */}
            <linearGradient id="lxt-sun-beam" x1="120" y1="40" x2="520" y2="420" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Podium Stone Surface */}
            <linearGradient id="lxt-podium-top" x1="140" y1="320" x2="510" y2="405" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBF9F4" />
              <stop offset="60%" stopColor="#F2EDE2" />
              <stop offset="100%" stopColor="#E6DFD1" />
            </linearGradient>
            <linearGradient id="lxt-podium-side" x1="120" y1="360" x2="520" y2="445" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EAE3D5" />
              <stop offset="50%" stopColor="#DFD6C5" />
              <stop offset="100%" stopColor="#CFC4B0" />
            </linearGradient>

            {/* Frosted Glass Blocks */}
            <linearGradient id="lxt-glass-main" x1="200" y1="80" x2="450" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E8F2FF" stopOpacity="0.88" />
              <stop offset="55%" stopColor="#CBE0FF" stopOpacity="0.68" />
              <stop offset="100%" stopColor="#B4D2FF" stopOpacity="0.52" />
            </linearGradient>
            <linearGradient id="lxt-glass-edge" x1="200" y1="80" x2="360" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#9BC2FF" stopOpacity="0.55" />
            </linearGradient>

            {/* Cobalt 3D Letters L & T */}
            <linearGradient id="lxt-cobalt-front" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3D78FF" />
              <stop offset="55%" stopColor="#2864FF" />
              <stop offset="100%" stopColor="#1B4FD8" />
            </linearGradient>
            <linearGradient id="lxt-cobalt-side" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E4FD0" />
              <stop offset="100%" stopColor="#133699" />
            </linearGradient>

            {/* Satin White/Ivory Metallic X */}
            <linearGradient id="lxt-ivory-front" x1="210" y1="125" x2="415" y2="345" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="58%" stopColor="#F6F5F0" />
              <stop offset="100%" stopColor="#E5E2D9" />
            </linearGradient>
            <linearGradient id="lxt-ivory-side" x1="210" y1="130" x2="420" y2="355" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2DFD5" />
              <stop offset="100%" stopColor="#C7C3B6" />
            </linearGradient>

            {/* Warm Gold Sphere */}
            <radialGradient id="lxt-gold-sphere" cx="35%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#FFF3B8" />
              <stop offset="42%" stopColor="#F6C445" />
              <stop offset="85%" stopColor="#E09B18" />
              <stop offset="100%" stopColor="#B87609" />
            </radialGradient>

            {/* Soft Floor & Podium Shadows */}
            <radialGradient id="lxt-podium-shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#17243A" stopOpacity="0.20" />
              <stop offset="65%" stopColor="#17243A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#17243A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft Studio Backdrop Card */}
          <rect x="44" y="24" width="552" height="436" rx="22" fill="url(#lxt-studio-bg)" />

          {/* Diagonal Sunlit Window Beams */}
          <polygon points="90,24 295,24 560,350 340,350" fill="url(#lxt-sun-beam)" />
          <polygon points="325,24 460,24 596,210 596,315" fill="url(#lxt-sun-beam)" opacity="0.65" />

          {/* Subtle Architectural Grid Lines in Background */}
          <line x1="44" y1="342" x2="596" y2="342" stroke="#DCE3EE" strokeWidth="1" />
          <line x1="335" y1="24" x2="335" y2="342" stroke="#E2E8F2" strokeWidth="1" strokeDasharray="4 6" />

          {/* Floor Ambient Shadow */}
          <ellipse cx="326" cy="414" rx="228" ry="34" fill="url(#lxt-podium-shadow)" />

          {/* Cylindrical Matte Cream Stone Podium */}
          <path
            d="M126 356 C126 333, 526 333, 526 356 L526 394 C526 420, 126 420, 126 394 Z"
            fill="url(#lxt-podium-side)"
          />
          <ellipse cx="326" cy="356" rx="200" ry="30" fill="url(#lxt-podium-top)" />
          <ellipse
            cx="326"
            cy="356"
            rx="199"
            ry="29"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          {/* Contact Shadows on Podium Top */}
          <ellipse cx="322" cy="354" rx="148" ry="16" fill="#17243A" fillOpacity="0.14" />
          <ellipse cx="220" cy="356" rx="46" ry="9" fill="#183B8C" fillOpacity="0.18" />
          <ellipse cx="430" cy="354" rx="48" ry="9" fill="#183B8C" fillOpacity="0.16" />

          {/* Back Translucent Frosted Glass Block (Tall Center-Left) */}
          <g>
            {/* 3D Side depth of glass */}
            <polygon
              points="236,86 254,74 378,74 360,86"
              fill="#FFFFFF"
              fillOpacity="0.78"
            />
            <polygon
              points="360,86 378,74 378,342 360,354"
              fill="#A8C8FA"
              fillOpacity="0.52"
            />
            {/* Front glass face */}
            <rect
              x="236"
              y="86"
              width="124"
              height="268"
              rx="4"
              fill="url(#lxt-glass-main)"
              stroke="url(#lxt-glass-edge)"
              strokeWidth="1.5"
            />
            {/* Internal refraction highlight */}
            <line x1="248" y1="96" x2="248" y2="342" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.65" />
          </g>

          {/* Right Translucent Frosted Glass Block */}
          <g>
            <polygon
              points="344,122 362,110 470,110 452,122"
              fill="#FFFFFF"
              fillOpacity="0.75"
            />
            <polygon
              points="452,122 470,110 470,338 452,350"
              fill="#9EC0F7"
              fillOpacity="0.48"
            />
            <rect
              x="344"
              y="122"
              width="108"
              height="228"
              rx="4"
              fill="url(#lxt-glass-main)"
              stroke="url(#lxt-glass-edge)"
              strokeWidth="1.5"
            />
          </g>

          {/* 3D Letter "L" (Left — Cobalt Blue) */}
          <g>
            {/* Extrusion Side */}
            <polygon points="168,148 186,136 232,136 214,148" fill="#5B8EFF" />
            <polygon points="214,148 232,136 232,298 214,310" fill="url(#lxt-cobalt-side)" />
            <polygon points="214,310 232,298 286,298 268,310" fill="#4B82FF" />
            <polygon points="268,310 286,298 286,342 268,354" fill="url(#lxt-cobalt-side)" />
            {/* Front Face of L */}
            <path
              d="M168 148 H214 V310 H268 V354 H168 Z"
              fill="url(#lxt-cobalt-front)"
            />
            {/* Specular bevel highlight */}
            <path
              d="M170 150 H212 V312 H266"
              stroke="#8AB2FF"
              strokeWidth="1.5"
              strokeOpacity="0.65"
            />
          </g>

          {/* 3D Letter "T" (Right — Cobalt Blue) */}
          <g>
            {/* Top Bar Extrusion */}
            <polygon points="366,146 384,134 504,134 486,146" fill="#5B8EFF" />
            <polygon points="486,146 504,134 504,178 486,190" fill="url(#lxt-cobalt-side)" />
            {/* Stem Extrusion */}
            <polygon points="448,190 466,178 466,340 448,352" fill="url(#lxt-cobalt-side)" />
            {/* Front Face of T */}
            <path
              d="M366 146 H486 V190 H448 V352 H402 V190 H366 Z"
              fill="url(#lxt-cobalt-front)"
            />
            <line x1="368" y1="148" x2="484" y2="148" stroke="#94B8FF" strokeWidth="1.5" strokeOpacity="0.7" />
          </g>

          {/* 3D Letter "X" (Center Foreground — Satin Ivory/White Metallic) */}
          <g>
            {/* 3D Right-Side Extrusion for X */}
            <polygon
              points="262,140 278,130 330,206 382,130 398,140 342,226 402,344 386,356 322,262 272,356 256,344 306,246"
              fill="url(#lxt-ivory-side)"
            />
            {/* Front Face of X */}
            <polygon
              points="242,140 288,140 322,198 356,140 402,140 346,238 406,354 358,354 322,284 286,354 238,354 298,238"
              fill="url(#lxt-ivory-front)"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          </g>

          {/* Floating Warm Gold Sphere (#F6C445) */}
          <g>
            {/* Subtle reflection glow on glass behind sphere */}
            <circle cx="204" cy="112" r="28" fill="#F6C445" fillOpacity="0.16" />
            <circle cx="192" cy="104" r="24" fill="url(#lxt-gold-sphere)" />
          </g>
        </svg>

        {/* Optional WebGL Dynamic Specular Overlay */}
        {effectivePreset !== "static" && (
          <canvas
            ref={canvasRef}
            width={320}
            height={250}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full rounded-[18px] mix-blend-screen opacity-75"
          />
        )}
      </div>
    </div>
  );
}
