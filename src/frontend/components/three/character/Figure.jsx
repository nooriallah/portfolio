import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { LOOK, RIG } from "./look.js";

/**
 * The character, built entirely from three.js primitives — capsules, spheres
 * and sphere *patches*. No model file, no loader, nothing to download.
 *
 * The point of building it this way is the rig: because every joint is a real
 * `<group>`, poses.js can drive shoulders, elbows, spine and head directly.
 * A downloaded .glb would need matching bone names and an animation clip for
 * every pose; here a pose is just a few numbers.
 *
 * Materials are created once and shared across every mesh, so the whole figure
 * costs a handful of draw calls.
 */
function useMaterials() {
  return useMemo(() => {
    const std = (color, opts = {}) =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.62,
        metalness: 0,
        ...opts,
      });

    return {
      skin: std(LOOK.skin, { roughness: 0.72 }),
      skinDeep: std(LOOK.skinDeep, { roughness: 0.75 }),
      hair: std(LOOK.hair, { roughness: 0.55 }),
      hairLight: std(LOOK.hairLight, { roughness: 0.5 }),
      brow: std(LOOK.brow, { roughness: 0.6 }),
      eye: std(LOOK.eye, { roughness: 0.25 }),
      eyeWhite: std(LOOK.eyeWhite, { roughness: 0.2 }),
      beard: std(LOOK.beard, { roughness: 0.7 }),
      // Unlit on purpose: an 8px lit line inside the beard's shadow just
      // vanishes. The smile must always read.
      mouth: new THREE.MeshBasicMaterial({ color: new THREE.Color(LOOK.mouth) }),
      frame: std(LOOK.glassesFrame, { roughness: 0.35, metalness: 0.35 }),
      lens: new THREE.MeshStandardMaterial({
        color: new THREE.Color(LOOK.glassesLens),
        transparent: true,
        opacity: 0.16,
        roughness: 0.05,
        metalness: 0.1,
      }),
      shirt: std(LOOK.shirt),
      shirtDeep: std(LOOK.shirtDeep),
      trousers: std(LOOK.trousers),
      shoe: std(LOOK.shoe, { roughness: 0.5 }),
      shoeSole: std(LOOK.shoeSole, { roughness: 0.8 }),
    };
  }, []);
}

/** Fewer segments on modest hardware; the silhouette barely changes. */
function segments(tier) {
  return tier === "high"
    ? { sphere: [28, 20], capsule: [4, 14], torus: [12, 24] }
    : { sphere: [16, 12], capsule: [3, 8], torus: [8, 14] };
}

const Figure = forwardRef(function Figure({ tier = "high" }, ref) {
  const m = useMaterials();
  const seg = segments(tier);

  // Every joint the animation layer is allowed to touch.
  const root = useRef(null);
  const hips = useRef(null);
  const chest = useRef(null);
  const neck = useRef(null);
  const head = useRef(null);
  const shoulderL = useRef(null);
  const shoulderR = useRef(null);
  const elbowL = useRef(null);
  const elbowR = useRef(null);
  const handL = useRef(null);
  const handR = useRef(null);
  const thighL = useRef(null);
  const thighR = useRef(null);
  const kneeL = useRef(null);
  const kneeR = useRef(null);
  const eyeL = useRef(null);
  const eyeR = useRef(null);
  const torso = useRef(null);

  // Exposed as one object so poses.js can drive any joint by name. Refs are
  // stable for the component's lifetime, so this is built once.
  useImperativeHandle(
    ref,
    () => ({
      root,
      hips,
      chest,
      neck,
      head,
      shoulderL,
      shoulderR,
      elbowL,
      elbowR,
      handL,
      handR,
      thighL,
      thighR,
      kneeL,
      kneeR,
      eyeL,
      eyeR,
      torso,
    }),
    [],
  );

  const arm = (side) => {
    const sign = side === "L" ? -1 : 1;
    return (
      <group
        key={side}
        ref={side === "L" ? shoulderL : shoulderR}
        position={[sign * RIG.shoulderX, RIG.shoulderY, 0]}
      >
        {/* short sleeve, a shade darker than the body of the shirt */}
        <mesh position={[0, -0.06, 0]} material={m.shirtDeep}>
          <capsuleGeometry
            args={[RIG.upperArmR * 1.16, 0.06, seg.capsule[0], seg.capsule[1]]}
          />
        </mesh>
        {/* long hoodie sleeves — his photo outfit; only the hands are skin */}
        <mesh
          position={[0, -(RIG.upperArmLen / 2 + RIG.upperArmR), 0]}
          material={m.shirtDeep}
        >
          <capsuleGeometry
            args={[
              RIG.upperArmR,
              RIG.upperArmLen,
              seg.capsule[0],
              seg.capsule[1],
            ]}
          />
        </mesh>

        <group
          ref={side === "L" ? elbowL : elbowR}
          position={[0, -(RIG.upperArmLen + RIG.upperArmR * 2), 0]}
        >
          <mesh
            position={[0, -(RIG.foreArmLen / 2 + RIG.foreArmR), 0]}
            material={m.shirtDeep}
          >
            <capsuleGeometry
              args={[
                RIG.foreArmR,
                RIG.foreArmLen,
                seg.capsule[0],
                seg.capsule[1],
              ]}
            />
          </mesh>
          <group
            ref={side === "L" ? handL : handR}
            position={[0, -(RIG.foreArmLen + RIG.foreArmR * 1.6), 0]}
          >
            <mesh scale={[1, 0.82, 1.1]} material={m.skin}>
              <sphereGeometry args={[RIG.handR, ...seg.sphere]} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  const leg = (side) => {
    const sign = side === "L" ? -1 : 1;
    return (
      <group
        key={side}
        ref={side === "L" ? thighL : thighR}
        position={[sign * RIG.hipX, 0, 0]}
      >
        <mesh
          position={[0, -(RIG.thighLen / 2 + RIG.thighR), 0]}
          material={m.trousers}
        >
          <capsuleGeometry
            args={[RIG.thighR, RIG.thighLen, seg.capsule[0], seg.capsule[1]]}
          />
        </mesh>

        <group
          ref={side === "L" ? kneeL : kneeR}
          position={[0, -(RIG.thighLen + RIG.thighR * 2), 0]}
        >
          <mesh
            position={[0, -(RIG.shinLen / 2 + RIG.shinR), 0]}
            material={m.trousers}
          >
            <capsuleGeometry
              args={[RIG.shinR, RIG.shinLen, seg.capsule[0], seg.capsule[1]]}
            />
          </mesh>
          {/* shoe: a squashed sphere pushed forward, on a pale sole */}
          <group position={[0, -(RIG.shinLen + RIG.shinR * 1.7), 0.03]}>
            <mesh scale={[1, 0.62, 1.75]} material={m.shoe}>
              <sphereGeometry args={[RIG.shinR * 1.15, ...seg.sphere]} />
            </mesh>
            <mesh position={[0, -0.045, 0.01]} material={m.shoeSole}>
              <boxGeometry args={[RIG.shinR * 1.9, 0.016, RIG.footLen * 0.8]} />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group ref={root}>
      <group ref={hips} position={[0, RIG.hipY, 0]}>
        {/* ---------------- upper body ---------------- */}
        <group ref={chest} position={[0, RIG.chestY, 0]}>
          <mesh
            ref={torso}
            position={[0, -0.02, 0]}
            scale={RIG.torsoScale}
            material={m.shirt}
          >
            <capsuleGeometry
              args={[RIG.torsoR, RIG.torsoLen, seg.capsule[0], seg.capsule[1]]}
            />
          </mesh>

          {arm("L")}
          {arm("R")}

          <group ref={neck} position={[0, RIG.neckY, 0]}>
            <mesh position={[0, -0.04, 0]} material={m.skin}>
              <capsuleGeometry args={[0.075, 0.05, 3, 12]} />
            </mesh>

            {/* ---------------- head ---------------- */}
            <group ref={head} position={[0, RIG.headY, 0]}>
              <mesh scale={RIG.headScale} material={m.skin}>
                <sphereGeometry args={[RIG.headR, ...seg.sphere]} />
              </mesh>

              {/* Hair. A coverage cap plus a back/side patch keep the skull
                  from showing through; the *style* is the lobes on top — a
                  big mass swept to one side with a quiff breaking over the
                  forehead, like the reference art. Sphere-patch phi gotcha:
                  phi = PI/2 faces +Z, so the back patch is centred on -PI/2. */}
              <mesh
                rotation={[LOOK.hairTilt, 0, 0]}
                scale={[1.02, LOOK.hairPuff, 1.02]}
                material={m.hair}
              >
                <sphereGeometry
                  args={[
                    RIG.headR * 1.035,
                    seg.sphere[0],
                    seg.sphere[1],
                    0,
                    Math.PI * 2,
                    0,
                    LOOK.hairCap,
                  ]}
                />
              </mesh>
              <mesh scale={[1.02, 1.02, 1.02]} material={m.hair}>
                <sphereGeometry
                  args={[
                    RIG.headR * 1.03,
                    seg.sphere[0],
                    seg.sphere[1],
                    -Math.PI / 2 - 1.28,
                    2.56,
                    LOOK.hairCap - 0.1,
                    LOOK.hairBack + 0.3,
                  ]}
                />
              </mesh>

              {/* the swept volume: main mass, side sweep, and a forward quiff */}
              <mesh
                position={[0.02, RIG.headR * 0.8, -0.02]}
                rotation={[0.08, 0, -0.14]}
                scale={[1.1, 0.72, 1.02]}
                material={m.hair}
              >
                <sphereGeometry args={[RIG.headR * 0.92, ...seg.sphere]} />
              </mesh>
              <mesh
                position={[-RIG.headR * 0.52, RIG.headR * 0.78, RIG.headR * 0.1]}
                rotation={[0.12, 0.2, 0.42]}
                scale={[0.78, 0.5, 0.8]}
                material={m.hairLight}
              >
                <sphereGeometry args={[RIG.headR * 0.85, ...seg.sphere]} />
              </mesh>
              <mesh
                position={[RIG.headR * 0.34, RIG.headR * 0.92, RIG.headR * 0.4]}
                rotation={[-0.42, -0.15, -0.5]}
                scale={[0.62, 0.4, 0.6]}
                material={m.hairLight}
              >
                <sphereGeometry args={[RIG.headR * 0.8, ...seg.sphere]} />
              </mesh>
              <mesh
                position={[RIG.headR * 0.12, RIG.headR * 1.02, RIG.headR * 0.24]}
                rotation={[-0.24, 0, 0.25]}
                scale={[0.85, 0.48, 0.68]}
                material={m.hair}
              >
                <sphereGeometry args={[RIG.headR * 0.82, ...seg.sphere]} />
              </mesh>

              {/* Beard as a jaw strip, not a face mask: the patch starts well
                  below the equator (theta 0.64π) so the mouth and cheeks stay
                  skin. The first version started at the equator and blacked
                  out the whole lower face. A small moustache completes it. */}
              {LOOK.beardStrength > 0.05 && (
                <>
                  {/* Proud of the head on purpose: at 1.006 the head surface
                      bites ragged chunks out of the beard's edge. */}
                  <mesh material={m.beard} scale={[1.0, 1.03, 1.0]}>
                    <sphereGeometry
                      args={[
                        RIG.headR * 1.02,
                        seg.sphere[0],
                        seg.sphere[1],
                        Math.PI / 2 - 0.92,
                        1.84,
                        Math.PI * 0.68,
                        Math.PI * 0.22 * LOOK.beardStrength,
                      ]}
                    />
                  </mesh>
                  {/* thin moustache connecting into the beard, per his photo */}
                  <mesh
                    position={[0, -0.066, RIG.headR * 0.885]}
                    rotation={[0.32, 0, 0]}
                    material={m.beard}
                  >
                    <boxGeometry args={[0.082, 0.015, 0.02]} />
                  </mesh>
                </>
              )}

              {/* ears */}
              {[-1, 1].map((s) => (
                <mesh
                  key={s}
                  position={[s * RIG.headR * 0.97, -0.01, -0.01]}
                  scale={[0.45, 1, 0.75]}
                  material={m.skinDeep}
                >
                  <sphereGeometry args={[0.058, 14, 10]} />
                </mesh>
              ))}

              {/* Eyes the reference-art way: big white sclera, dark pupil,
                  tiny highlight. Dark bead eyes vanish into the glasses at
                  hero size; these stay readable from across the room. */}
              {[-1, 1].map((s) => (
                <group
                  key={s}
                  ref={s === -1 ? eyeL : eyeR}
                  position={[s * 0.112, 0.012, RIG.headR * 0.8]}
                >
                  <mesh scale={[1, 1.1, 0.55]} material={m.eyeWhite}>
                    <sphereGeometry args={[0.052, 16, 12]} />
                  </mesh>
                  <mesh position={[s * 0.006, 0, 0.026]} scale={[1, 1.2, 0.6]} material={m.eye}>
                    <sphereGeometry args={[0.026, 12, 10]} />
                  </mesh>
                  <mesh position={[s * 0.014, 0.014, 0.042]} material={m.eyeWhite}>
                    <sphereGeometry args={[0.008, 8, 6]} />
                  </mesh>
                </group>
              ))}

              {/* brows */}
              {/* thick, bold brows — the defining feature in his photo */}
              {[-1, 1].map((s) => (
                <mesh
                  key={s}
                  position={[s * 0.112, 0.088, RIG.headR * 0.86]}
                  rotation={[0.06, 0, s * -0.12]}
                  material={m.brow}
                >
                  <boxGeometry args={[0.108, 0.028, 0.028]} />
                </mesh>
              ))}

              {/* smile: a thin torus arc centred on the bottom of the face.
                  Torus arcs start at +X and sweep CCW, so a smile centred at
                  the six-o'clock position starts at 270° minus half the arc. */}
              {/* The smile sits on skin (the stubble starts lower), so it is
                  a warm dark line — his photo smile is broad, hence the wide arc. */}
              {/* Wide, thin, flat, dark — a small curvy coloured arc reads as
                  lipstick; width and flatness are what read as masculine. */}
              <mesh
                position={[0, -0.088, RIG.headR * 0.92]}
                rotation={[0.3, 0, 1.5 * Math.PI - 0.42]}
                material={m.mouth}
              >
                <torusGeometry args={[0.075, 0.0085, 6, 18, 0.84]} />
              </mesh>

              {/* nose — barely there, like the reference */}
              <mesh
                position={[0, -0.028, RIG.headR * 0.92]}
                scale={[1, 0.85, 0.8]}
                material={m.skin}
              >
                <sphereGeometry args={[0.038, 12, 10]} />
              </mesh>

              {LOOK.hasGlasses && (
                <group position={[0, 0.012, RIG.headR * 0.88]}>
                  {[-1, 1].map((s) => (
                    <group key={s} position={[s * 0.112, 0, 0]}>
                      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.frame}>
                        <torusGeometry
                          args={[0.086, 0.008, seg.torus[0], seg.torus[1]]}
                        />
                      </mesh>
                      <mesh material={m.lens}>
                        <circleGeometry args={[0.083, seg.torus[1]]} />
                      </mesh>
                      {/* temple arm sweeping back to the ear */}
                      <mesh
                        position={[s * 0.085, 0.012, -0.09]}
                        rotation={[0, s * 0.22, 0]}
                        material={m.frame}
                      >
                        <boxGeometry args={[0.012, 0.012, 0.19]} />
                      </mesh>
                    </group>
                  ))}
                  <mesh material={m.frame}>
                    <boxGeometry args={[0.062, 0.011, 0.011]} />
                  </mesh>
                </group>
              )}
            </group>
          </group>
        </group>

        {/* ---------------- lower body ---------------- */}
        {leg("L")}
        {leg("R")}
      </group>
    </group>
  );
});

export default Figure;
