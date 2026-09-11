import { Canvas } from "@react-three/fiber";
import LaptopScene from "./character/LaptopScene.jsx";
import usePointer from "../../hooks/usePointer.js";

/**
 * Canvas wrapper for the About scene. Separate file so the chunk that pulls
 * in three.js is shared with the hero via the bundler, and AboutCanvas
 * itself stays tiny.
 */
export default function LaptopStage({ theme, tier, active }) {
  usePointer();

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: 35, position: [0, 0, 4.15], near: 0.1, far: 30 }}
      gl={{
        antialias: tier === "high",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      style={{ pointerEvents: "none" }}
    >
      {/* R3F aims the default camera at the origin, so the scene is shifted
          down until the figure's midriff IS the origin — raising the camera
          instead just makes it look down at the floor. */}
      <group position={[0, -0.95, 0]}>
        <LaptopScene theme={theme} tier={tier} />
      </group>
    </Canvas>
  );
}
