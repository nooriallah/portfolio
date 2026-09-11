import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "../../hooks/usePointer.js";
import usePointer from "../../hooks/usePointer.js";

/**
 * The site-wide object: one large fresnel-lit sphere in a thin wireframe
 * cage with an orbit ring, floating behind every section. It drifts slowly
 * with the scroll and leans toward the cursor — always present, never loud.
 */
const FRESNEL_VERT = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRESNEL_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform vec3  uColorB;
  uniform float uOpacity;

  varying vec3 vNormalV;
  varying vec3 vViewDir;

  void main() {
    float d = clamp(dot(vNormalV, vViewDir), 0.0, 1.0);
    float rim = pow(1.0 - d, 2.4);
    // rim in the accent, centre in a deeper tone — a soft gradient orb
    vec3 col = mix(uColorB, uColor, rim);
    gl_FragColor = vec4(col, (rim * 0.85 + 0.12) * uOpacity);
    #include <colorspace_fragment>
  }
`;

const THEMES = {
  dark: {
    rim: "#60a5fa",
    core: "#12204a",
    wire: "#3b74d1",
    opacity: 0.5,
    wireOpacity: 0.11,
    blending: THREE.AdditiveBlending,
  },
  light: {
    rim: "#2563eb",
    core: "#c8d6ee",
    wire: "#7d9cc9",
    opacity: 0.22,
    wireOpacity: 0.12,
    blending: THREE.NormalBlending,
  },
};

const CAM_Z = 8;
const FOV = 40;

function Orb({ theme, tier }) {
  const group = useRef(null);
  const cage = useRef(null);
  const ring = useRef(null);
  const shell = useRef(null);
  const { size } = useThree();
  const palette = THEMES[theme] ?? THEMES.dark;

  const width = size.width;
  const height = Math.max(size.height, 1);
  const frustumH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
  const frustumW = frustumH * (width / height);

  // Anchored high on the reading-end side, large enough to break the frame.
  const wide = width >= 768;
  const scale = wide ? frustumH * 0.34 : frustumH * 0.28;
  const homeX = wide ? frustumW * 0.34 : frustumW * 0.3;
  const homeY = frustumH * 0.18;

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(palette.rim) },
      uColorB: { value: new THREE.Color(palette.core) },
      uOpacity: { value: palette.opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const u = shell.current?.uniforms;
    if (!u) return;
    u.uColor.value.set(palette.rim);
    u.uColorB.value.set(palette.core);
    u.uOpacity.value = palette.opacity;
  }, [palette]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    // The scroll carries the orb slowly upward and across as the visitor
    // descends the page — it keeps every section's backdrop alive without
    // ever repeating a section-local animation.
    const scroll = window.scrollY || 0;
    const targetY = homeY + scroll * 0.00045 * frustumH * 0.1;
    const targetX = homeX - scroll * 0.00012 * frustumW;

    g.position.x += (targetX + pointer.x * 0.35 - g.position.x) * 0.03;
    g.position.y +=
      (targetY + Math.sin(t * 0.4) * 0.18 - pointer.y * 0.25 - g.position.y) *
      0.03;

    g.rotation.y += d * 0.05;
    g.rotation.x += d * 0.014;
    if (cage.current) cage.current.rotation.y -= d * 0.11;
    if (ring.current) ring.current.rotation.z += d * 0.035;
  });

  return (
    <group ref={group} position={[homeX, homeY, 0]} scale={scale}>
      <mesh>
        <icosahedronGeometry args={[1, tier === "high" ? 4 : 2]} />
        <shaderMaterial
          ref={shell}
          uniforms={uniforms}
          vertexShader={FRESNEL_VERT}
          fragmentShader={FRESNEL_FRAG}
          transparent
          depthWrite={false}
          blending={palette.blending}
        />
      </mesh>
      <mesh ref={cage} scale={1.06}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={palette.wire}
          wireframe
          transparent
          opacity={palette.wireOpacity}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring} rotation={[0.6, 0, 0.35]}>
        <torusGeometry args={[1.55, 0.0045, 3, 80]} />
        <meshBasicMaterial
          color={palette.wire}
          transparent
          opacity={palette.wireOpacity * 1.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function BackdropScene({ theme, tier, active }) {
  usePointer();

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 40 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        stencil: false,
      }}
      style={{ pointerEvents: "none" }}
    >
      <Orb theme={theme} tier={tier} />
    </Canvas>
  );
}
