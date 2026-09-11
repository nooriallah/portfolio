import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Figure from "./Figure.jsx";
import usePose from "./poses.js";
import { StudioLights, ContactShadow } from "./Stage.jsx";
import { useCodeTexture } from "./screen.js";
import { LOOK } from "./look.js";
import { pointer } from "../../../hooks/usePointer.js";

/**
 * The About scene, after the third reference image: the character stands
 * holding a laptop while his actual technologies float around him as badges.
 * Every label comes from the real skills list — nothing invented.
 */
const BADGES = [
  { label: "React.js", x: -0.74, y: 1.62, z: 0.15, s: 0.95, phase: 0.0 },
  { label: "Laravel", x: 0.72, y: 1.5, z: 0.05, s: 0.9, phase: 1.4 },
  { label: "Tailwind", x: -0.68, y: 1.02, z: 0.28, s: 0.84, phase: 2.6 },
  { label: "PHP", x: 0.64, y: 0.9, z: 0.3, s: 0.76, phase: 3.9 },
  { label: "MySQL", x: 0.08, y: 1.96, z: -0.12, s: 0.8, phase: 5.1 },
];

/** Crisp badge label drawn once per theme change. */
function useBadgeTexture(label, theme) {
  const texture = useMemo(() => {
    const w = 256;
    const h = 96;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const dark = theme === "dark";

    ctx.clearRect(0, 0, w, h);
    const r = 26;
    ctx.beginPath();
    ctx.roundRect(4, 4, w - 8, h - 8, r);
    ctx.fillStyle = dark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.95)";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = dark ? "rgba(96, 165, 250, 0.55)" : "rgba(37, 99, 235, 0.45)";
    ctx.stroke();

    ctx.fillStyle = LOOK.accent;
    ctx.beginPath();
    ctx.arc(34, h / 2, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "600 34px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = dark ? "#e2e8f0" : "#0f172a";
    ctx.fillText(label, 56, h / 2 + 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [label, theme]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Badge({ label, x, y, z, s, phase, theme }) {
  const ref = useRef(null);
  const texture = useBadgeTexture(label, theme);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // each badge bobs on its own beat and leans gently with the cursor
    g.position.y = y + Math.sin(t * 0.9 + phase) * 0.045;
    g.position.x = x + pointer.x * 0.06 * (z + 0.6);
    g.rotation.z = Math.sin(t * 0.7 + phase) * 0.04;
    g.rotation.y = pointer.x * 0.12;
  });

  return (
    <group ref={ref} position={[x, y, z]} scale={s}>
      <mesh>
        <planeGeometry args={[0.52, 0.195]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Laptop({ materials }) {
  const { texture, draw } = useCodeTexture(41, { rows: 10 });
  useFrame((state) => draw(state.clock.elapsedTime));

  /* Held in front of the chest, tilted so the visitor sees the screen at a
     glancing angle — enough to read "he is coding", not a billboard. */
  return (
    <group position={[0.02, 0.9, 0.42]} rotation={[0.16, -0.22, 0.03]} scale={0.88}>
      {/* base */}
      <mesh material={materials.bezel}>
        <boxGeometry args={[0.44, 0.018, 0.3]} />
      </mesh>
      {/* keys hint */}
      <mesh position={[0, 0.011, 0.02]} material={materials.keys}>
        <boxGeometry args={[0.38, 0.004, 0.2]} />
      </mesh>
      {/* lid, opened past vertical */}
      <group position={[0, 0, -0.15]} rotation={[Math.PI / 2 - 1.25, 0, 0]}>
        <mesh position={[0, 0.14, 0]} material={materials.bezel}>
          <boxGeometry args={[0.44, 0.28, 0.014]} />
        </mesh>
        <mesh position={[0, 0.14, 0.008]}>
          <planeGeometry args={[0.4, 0.24]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function LaptopScene({ theme = "dark", tier = "high" }) {
  const rig = useRef(null);
  const group = useRef(null);
  usePose(rig, "presenting");

  const materials = useMemo(() => {
    const dark = theme === "dark";
    const std = (color, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.6,
        metalness: 0,
        ...opts,
      });
    return {
      bezel: std(dark ? "#151d2b" : "#3c4759", { roughness: 0.45 }),
      keys: std(dark ? "#26324a" : "#8fa0b8", { roughness: 0.6 }),
    };
  }, [theme]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += (pointer.x * 0.14 - g.rotation.y) * 0.05;
  });

  return (
    <>
      <StudioLights theme={theme} intensity={1.3} />
      <pointLight
        position={[0.1, 1.15, 0.9]}
        intensity={1.4}
        distance={2}
        color={LOOK.accent}
      />

      <group ref={group}>
        <ContactShadow scale={[0.9, 1, 0.6]} opacity={0.7} />
        <Figure ref={rig} tier={tier} />
        <Laptop materials={materials} />
        {BADGES.map((b) => (
          <Badge key={b.label} {...b} theme={theme} />
        ))}
      </group>
    </>
  );
}
