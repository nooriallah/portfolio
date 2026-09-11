import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import usePointer, { pointer } from "../../hooks/usePointer.js";
import DeskScene from "./character/DeskScene.jsx";

/* ------------------------------------------------------------------ *
 * Palette — resolved per theme so the scene belongs to the page
 * instead of sitting on top of it.
 * ------------------------------------------------------------------ */
const PALETTE = {
  dark: {
    near: "#7dd3fc",
    far: "#1e3a8a",
    core: "#93c5fd",
    wire: "#60a5fa",
    pointOpacity: 0.9,
    coreOpacity: 0.5,
    wireOpacity: 0.22,
    blending: THREE.AdditiveBlending,
  },
  light: {
    near: "#1d4ed8",
    far: "#a5b4c6",
    core: "#2563eb",
    wire: "#1e40af",
    pointOpacity: 0.55,
    coreOpacity: 0.24,
    wireOpacity: 0.1,
    blending: THREE.NormalBlending,
  },
};

/** Deterministic PRNG — the field looks scattered but is identical on every
 *  render, so React never sees the geometry change underneath it. */
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * Point terrain — a slow swell of light that reacts to the cursor.
 * ------------------------------------------------------------------ */
const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uSize;
  uniform float uAmp;
  uniform float uPixelRatio;

  attribute float aRand;

  varying float vFade;
  varying float vRand;

  void main() {
    vec3 p = position;

    float w1 = sin(p.x * 0.42 + uTime * 0.50) * 0.55;
    float w2 = sin((p.x * 0.23 + p.z * 0.37) - uTime * 0.32) * 0.85;
    float w3 = cos(p.z * 0.55 + uTime * 0.24) * 0.35;
    p.y += (w1 + w2 + w3) * uAmp;

    // a soft swell that follows the cursor across the field
    vec2 focus = vec2(uPointer.x * 9.0, -2.0 + uPointer.y * 4.0);
    p.y += exp(-length(p.xz - focus) * 0.28) * 1.15 * uAmp;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;

    vFade = smoothstep(26.0, 3.0, depth);
    vRand = aRand;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(
      uSize * uPixelRatio * (0.55 + aRand * 0.9) * (9.0 / max(depth, 0.6)),
      9.0 * uPixelRatio
    );
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  uniform vec3  uNear;
  uniform vec3  uFar;
  uniform float uOpacity;

  varying float vFade;
  varying float vRand;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;

    float soft = smoothstep(0.25, 0.0, d);
    float a = soft * vFade * uOpacity * (0.35 + vRand * 0.65);

    gl_FragColor = vec4(mix(uFar, uNear, vFade), a);
    #include <colorspace_fragment>
  }
`;

function Terrain({ palette, tier }) {
  const material = useRef(null);
  const cols = tier === "high" ? 150 : 82;
  const rows = tier === "high" ? 74 : 42;

  const geometry = useMemo(() => {
    const random = makeRandom(1337);
    const count = cols * rows;
    const positions = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    const spanX = 30;
    const spanZ = 22;

    let i = 0;
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        // a little jitter keeps it from reading as graph paper
        positions[i * 3] =
          (x / (cols - 1) - 0.5) * spanX + (random() - 0.5) * 0.16;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] =
          (z / (rows - 1) - 0.5) * spanZ + (random() - 0.5) * 0.16;
        rand[i] = random();
        i++;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, [cols, rows]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const initialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uSize: { value: tier === "high" ? 2.5 : 3.1 },
      uAmp: { value: tier === "high" ? 1 : 0.85 },
      uPixelRatio: { value: 1 },
      uNear: { value: new THREE.Color(palette.near) },
      uFar: { value: new THREE.Color(palette.far) },
      uOpacity: { value: palette.pointOpacity },
    }),
    // Built once per quality tier; the theme is applied through the effect
    // below so a theme switch never rebuilds the material.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tier],
  );

  useEffect(() => {
    const u = material.current?.uniforms;
    if (!u) return;
    u.uNear.value.set(palette.near);
    u.uFar.value.set(palette.far);
    u.uOpacity.value = palette.pointOpacity;
  }, [palette]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    // Driving uniforms per frame is the entire purpose of useFrame; the lint
    // rule cannot tell a render-time mutation from an animation tick.
    // eslint-disable-next-line react-hooks/immutability
    u.uTime.value += Math.min(delta, 0.05);
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uPointer.value.x += (pointer.x - u.uPointer.value.x) * 0.04;
    u.uPointer.value.y += (-pointer.y - u.uPointer.value.y) * 0.04;
  });

  return (
    <points geometry={geometry} position={[0, -2.6, -3]}>
      <shaderMaterial
        ref={material}
        uniforms={initialUniforms}
        vertexShader={TERRAIN_VERT}
        fragmentShader={TERRAIN_FRAG}
        transparent
        depthWrite={false}
        blending={palette.blending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 * Rig — the camera leans towards the cursor. Small on purpose.
 * ------------------------------------------------------------------ */
const ORIGIN = new THREE.Vector3(0, 0, 0);

function Rig() {
  useFrame((state) => {
    const cam = state.camera;
    cam.position.x += (pointer.x * 0.6 - cam.position.x) * 0.04;
    cam.position.y += (-pointer.y * 0.4 - cam.position.y) * 0.04;
    cam.lookAt(ORIGIN);
  });
  return null;
}

/* ------------------------------------------------------------------ *
 * Camera. Fixed, and shared by everything in the hero — the terrain needs a
 * stable frustum, so scenes are framed by moving themselves, not the camera.
 * ------------------------------------------------------------------ */
const CAMERA_Z = 7;
const CAMERA_FOV = 38;

/* ------------------------------------------------------------------ *
 * Desk set — the hero's subject. Framed in screen terms for the same
 * reason the core was: solve for the scale that puts the set at a target
 * pixel height, so the composition survives every viewport.
 * ------------------------------------------------------------------ */
const DESK_Z = -1.2;
const SET_HEIGHT = 1.75; // world height of the desk scene
const SET_CENTRE = 0.78; // its vertical centre of interest

function DeskSet({ theme, tier, flip }) {
  const { size } = useThree();
  const width = size.width;
  const height = Math.max(size.height, 1);

  const wide = width >= 768;
  const frustumH =
    2 * (CAMERA_Z - DESK_Z) * Math.tan((CAMERA_FOV * Math.PI) / 360);
  const frustumW = frustumH * (width / height);

  const targetPx = wide ? 470 : 320;
  const scale = (targetPx * frustumH) / (SET_HEIGHT * height);
  const side = flip ? -1 : 1;

  const slotY = wide ? -(frustumH / 2) * 0.08 : -(frustumH / 2) * 0.5;
  const x = wide ? side * (frustumW / 2) * 0.4 : 0;

  return (
    <group position={[x, slotY - SET_CENTRE * scale, DESK_Z]} scale={scale}>
      <DeskScene theme={theme} tier={tier} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
export default function HeroScene({
  theme = "dark",
  tier = "high",
  active,
  flip = false,
}) {
  usePointer(); // starts the shared pointer loop while the scene is mounted
  const palette = PALETTE[theme] ?? PALETTE.dark;

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 60 }}
      gl={{
        antialias: tier === "high",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ pointerEvents: "none" }}
    >
      <Rig />
      <Terrain palette={palette} tier={tier} />
      <DeskSet theme={theme} tier={tier} flip={flip} />
    </Canvas>
  );
}
