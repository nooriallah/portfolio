import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { LOOK } from "./look.js";

/**
 * Lighting for the character scenes.
 *
 * Three lights, no shadow maps. A hemisphere light does the ambient fill
 * (sky tinted with the site accent, ground darker so the underside of limbs
 * stays grounded), one key light shapes the form, and a cool rim light behind
 * separates the silhouette from a dark background. Shadow maps would cost a
 * whole extra render pass for something a painted contact shadow does better
 * at this scale.
 */
export function StudioLights({ theme = "dark", intensity = 1 }) {
  const dark = theme === "dark";

  return (
    <>
      <hemisphereLight
        args={[
          dark ? "#4c6a9a" : "#dfe8f5",
          dark ? "#0a1020" : "#b9c3d2",
          (dark ? 1.45 : 1.7) * intensity,
        ]}
      />
      <directionalLight
        position={[2.6, 4.2, 3.4]}
        intensity={(dark ? 2.3 : 2.3) * intensity}
        color={dark ? "#ffffff" : "#fffaf2"}
      />
      <directionalLight
        position={[-3.2, 1.6, -2.6]}
        intensity={(dark ? 1.9 : 0.8) * intensity}
        color={LOOK.accent}
      />
      {/* camera-side fill: the figure faces the visitor, and a face that
          falls into shadow reads as a mask */}
      <directionalLight
        position={[0.4, 1.2, 5]}
        intensity={(dark ? 1.1 : 0.6) * intensity}
        color={dark ? "#c7d8f5" : "#ffffff"}
      />
    </>
  );
}

/** A soft round gradient, generated once, used as the painted shadow. */
function useShadowTexture() {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.45, "rgba(0,0,0,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/**
 * The grounding shadow under a figure or prop. One transparent quad.
 */
export function ContactShadow({
  position = [0, 0.004, 0],
  scale = [0.95, 1, 1.15],
  opacity = 0.9,
}) {
  const texture = useShadowTexture();

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={scale}
      renderOrder={-1}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
