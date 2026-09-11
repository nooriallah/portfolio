import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Figure from "./Figure.jsx";
import usePose from "./poses.js";
import { StudioLights, ContactShadow } from "./Stage.jsx";
import { useCodeTexture } from "./screen.js";
import { LOOK } from "./look.js";
import { pointer } from "../../../hooks/usePointer.js";

/*
 * Heights, so the scene stays coherent if any one thing is nudged.
 * The figure's root sits below ground level because the rig measures from the
 * soles: with the thighs rotated forward for sitting, dropping the root is
 * what puts the hips on the seat and the feet back on the floor.
 */
const FLOOR = 0;
const SEAT = 0.4;
const DESK = 0.72;
const FIGURE_Y = -0.4;

const DESK_TOP = DESK + 0.025;

/* The set is yawed almost half a turn so the camera now faces the character
   across the desk — monitor backs to the camera, face visible, hands on the
   keyboard in front (the reference-image composition). The small offset off
   a perfect half-turn is what keeps the desk from being a flat horizontal. */
const BASE_YAW = Math.PI - 0.2;
const BASE_PITCH = -0.14;

const STAND = 0.15;

/**
 * `position` is where the monitor's *foot* rests, not the centre of the panel.
 * Positioning the panel and letting the stand hang off it is how the first
 * attempt ended up with both monitors sunk through the desk.
 */
function Monitor({
  position,
  rotation = [0, 0, 0],
  size = [0.78, 0.46],
  seed = 3,
  materials,
}) {
  const [w, h] = size;
  const panelY = 0.008 + STAND + h / 2;
  const { texture, draw } = useCodeTexture(seed, {
    rows: Math.round(h * 28),
  });
  useFrame((state) => draw(state.clock.elapsedTime));

  return (
    <group position={position} rotation={rotation}>
      <group position={[0, panelY, 0]}>
        {/* bezel */}
        <mesh material={materials.bezel}>
          <boxGeometry args={[w, h, 0.028]} />
        </mesh>
        {/* screen */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[w - 0.045, h - 0.045]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {/* a small glowing mark on the back panel, since the camera now
            mostly sees the rear of the monitor */}
        <mesh position={[0, 0.02, -0.0165]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.035, 20]} />
          <meshBasicMaterial color={LOOK.accent} />
        </mesh>
      </group>
      {/* stand */}
      <mesh position={[0, 0.008 + STAND / 2, -0.01]} material={materials.bezel}>
        <boxGeometry args={[0.055, STAND, 0.045]} />
      </mesh>
      <mesh position={[0, 0.008, 0.02]} material={materials.bezel}>
        <boxGeometry args={[0.24, 0.016, 0.14]} />
      </mesh>
    </group>
  );
}

function Chair({ materials }) {
  return (
    <group position={[0, 0, -0.16]}>
      <mesh position={[0, SEAT, 0]} material={materials.chair}>
        <boxGeometry args={[0.46, 0.06, 0.44]} />
      </mesh>
      {/* Tall back again: the scene is now viewed from the front, so the
          back sits behind the figure and frames the silhouette instead of
          hiding it. */}
      <mesh
        position={[0, SEAT + 0.3, 0.2]}
        rotation={[0.14, 0, 0]}
        material={materials.chair}
      >
        <boxGeometry args={[0.44, 0.58, 0.055]} />
      </mesh>
      {/* gas lift */}
      <mesh position={[0, SEAT / 2, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.032, 0.032, SEAT - 0.06, 10]} />
      </mesh>
      {/* five-star base, with castors */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.05, 0.13]} material={materials.metal}>
              <boxGeometry args={[0.035, 0.022, 0.26]} />
            </mesh>
            <mesh position={[0, 0.028, 0.25]} material={materials.chair}>
              <sphereGeometry args={[0.028, 10, 8]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Desk({ materials }) {
  return (
    <group position={[0, 0, -0.66]}>
      <mesh position={[0, DESK, 0]} material={materials.desk}>
        <boxGeometry args={[1.5, 0.05, 0.66]} />
      </mesh>
      {[
        [-0.68, -0.26],
        [0.68, -0.26],
        [-0.68, 0.26],
        [0.68, 0.26],
      ].map(([x, z]) => (
        <mesh
          key={`${x}-${z}`}
          position={[x, DESK / 2, z]}
          material={materials.deskLeg}
        >
          <boxGeometry args={[0.055, DESK, 0.055]} />
        </mesh>
      ))}
      {/* desk mat */}
      <mesh
        position={[0, DESK + 0.027, 0.14]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materials.mat}
      >
        <planeGeometry args={[0.82, 0.34]} />
      </mesh>
    </group>
  );
}

function Props({ materials }) {
  return (
    <group>
      {/* keyboard */}
      <mesh position={[-0.08, DESK + 0.04, -0.52]} material={materials.keyboard}>
        <boxGeometry args={[0.46, 0.022, 0.15]} />
      </mesh>
      {/* mouse */}
      <mesh
        position={[0.26, DESK + 0.045, -0.5]}
        scale={[1, 0.55, 1.5]}
        material={materials.keyboard}
      >
        <sphereGeometry args={[0.042, 12, 10]} />
      </mesh>
      {/* mug */}
      <group position={[-0.52, DESK + 0.08, -0.6]}>
        <mesh material={materials.mug}>
          <cylinderGeometry args={[0.055, 0.048, 0.11, 16]} />
        </mesh>
        <mesh
          position={[0.062, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.mug}
        >
          <torusGeometry args={[0.032, 0.009, 8, 14]} />
        </mesh>
      </group>
      {/* plant on the floor */}
      <group position={[-0.8, 0, 0.14]} scale={0.72}>
        <mesh position={[0, 0.13, 0]} material={materials.pot}>
          <cylinderGeometry args={[0.13, 0.1, 0.26, 14]} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2 + 0.4;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.07, 0.42, Math.sin(a) * 0.07]}
              rotation={[0.34 * Math.cos(a), a, 0.34 * Math.sin(a)]}
              scale={[1, 2.3, 0.35]}
              material={materials.leaf}
            >
              <sphereGeometry args={[0.085, 12, 10]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/**
 * A lambert-ish floor whose alpha comes from a per-vertex fade attribute, so
 * the pad dissolves at its rim. Cheaper than a texture and it needs no UVs.
 */
function fadingFloorMaterial(color) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.95,
    metalness: 0,
    transparent: true,
    depthWrite: false,
  });

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aFade;\nvarying float vFade;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvFade = aFade;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vFade;")
      .replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\ngl_FragColor.a *= vFade;",
      );
  };

  return mat;
}

/**
 * The hero scene: the character at a desk, working. Camera framing is handled
 * by the parent — this component owns only the contents.
 */
export default function DeskScene({ theme = "dark", tier = "high" }) {
  const rig = useRef(null);
  const group = useRef(null);
  usePose(rig, "typing");

  const floorGeometry = useMemo(() => {
    const g = new THREE.CircleGeometry(1.95, 48);
    const pos = g.attributes.position;
    const alpha = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const r = Math.hypot(pos.getX(i), pos.getY(i)) / 1.95;
      alpha[i] = 1 - Math.min(1, Math.max(0, (r - 0.25) / 0.75)) ** 0.8;
    }
    g.setAttribute("aFade", new THREE.BufferAttribute(alpha, 1));
    return g;
  }, []);

  const materials = useMemo(() => {
    const std = (color, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.65,
        metalness: 0,
        ...opts,
      });
    // The furniture is themed, not just the background: a set of near-black
    // props on a white page reads as a heavy blob rather than a room.
    const dark = theme === "dark";
    const c = dark
      ? {
          desk: "#2a3446",
          leg: "#1d2634",
          mat: "#141c2b",
          chair: "#1b2433",
          metal: "#3d4a5e",
          bezel: "#151d2b",
          keys: "#202b3c",
          pot: "#334155",
          leaf: "#2f7d5f",
          floor: "#0e1526",
        }
      : {
          desk: "#ccd6e5",
          leg: "#b0bccd",
          mat: "#bdc9da",
          chair: "#c2cddc",
          metal: "#93a1b4",
          bezel: "#3c4759",
          keys: "#a7b4c6",
          pot: "#8fa0b5",
          leaf: "#3f9271",
          floor: "#dde5f0",
        };

    return {
      desk: std(c.desk, { roughness: 0.7 }),
      deskLeg: std(c.leg),
      mat: std(c.mat, { roughness: 0.9 }),
      chair: std(c.chair, { roughness: 0.6 }),
      metal: std(c.metal, { roughness: 0.35, metalness: 0.55 }),
      bezel: std(c.bezel, { roughness: 0.45 }),
      keyboard: std(c.keys, { roughness: 0.5 }),
      mug: std("#3b82f6", { roughness: 0.4 }),
      pot: std(c.pot, { roughness: 0.8 }),
      leaf: std(c.leaf, { roughness: 0.7 }),
      floor: fadingFloorMaterial(c.floor),
    };
  }, [theme]);

  // The whole set turns a few degrees with the cursor, which reads as
  // parallax between the props without moving the camera off its framing.
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += (pointer.x * 0.11 - g.rotation.y) * 0.04;
    g.rotation.x += (-pointer.y * 0.035 - g.rotation.x) * 0.04;
  });

  return (
    <>
      {/* Lights stay outside the group that tilts with the cursor, so the
          key light keeps its direction while the set turns. */}
      <StudioLights theme={theme} />
      {/* screen spill on the figure's front */}
      {/* The monitor's spill, landing on the face and shirt. The lights sit
          outside the yawed set, so this is placed where the monitor *ends up*
          after the base rotation (camera-left, slightly toward the camera) —
          not at the monitor's set-space coordinates. */}
      <pointLight
        position={[-0.8, DESK + 0.55, 0.55]}
        intensity={2.6}
        distance={2.8}
        color={LOOK.accent}
      />

      {/* The hero camera is fixed and shared with the terrain, so the *set*
          is turned instead: yaw for a three-quarter view of the character's
          back, and a negative pitch that tips the top away from the camera —
          which is what reading as a high, looking-down camera requires.
          The two live on separate groups on purpose: one Euler carrying both
          composes into a roll, which puts the desk on a slope. */}
      <group rotation={[BASE_PITCH, 0, 0]}>
      <group rotation={[0, BASE_YAW, 0]}>
      <group ref={group}>
      {/* Floor pad. Vertex colours fade it to nothing at the rim so the set
          sits in the page instead of on a visible dinner plate. */}
      <mesh
        position={[0, FLOOR - 0.001, -0.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={floorGeometry}
        material={materials.floor}
      />

      <Desk materials={materials} />
      {/* One monitor, pushed to the side so the face stays the subject —
          from the camera we see its back panel, like the reference images. */}
      <Monitor
        position={[0.48, DESK_TOP, -0.78]}
        rotation={[0, 0.5, 0]}
        size={[0.6, 0.4]}
        seed={11}
        materials={materials}
      />
      <Props materials={materials} />
      <Chair materials={materials} />

      <ContactShadow
        position={[0, FLOOR + 0.004, -0.12]}
        scale={[1.15, 1, 1.0]}
        opacity={0.75}
      />

      {/* facing away from camera, towards the monitors */}
      <group position={[0, FIGURE_Y, -0.2]} rotation={[0, Math.PI, 0]}>
        <Figure ref={rig} tier={tier} />
      </group>
      </group>
      </group>
      </group>
    </>
  );
}
