import { useFrame } from "@react-three/fiber";
import { pointer } from "../../../hooks/usePointer.js";

/**
 * Poses and motion for the coded figure.
 *
 * Every pose is written as absolute joint rotations recomputed each frame:
 * base pose + animated offset. There is no state to get out of sync, and
 * switching pose is just switching function.
 *
 * Rotation conventions, since they are easy to get backwards: a limb hangs
 * along local −Y, so a *negative* rotation about X swings it forward (+Z) and
 * a positive one swings it back.
 */
function set(ref, x = 0, y = 0, z = 0) {
  const o = ref?.current;
  if (!o) return;
  o.rotation.set(x, y, z);
}

/** Slow, shallow breathing — the thing that stops a figure looking dead. */
function breathe(rig, t, amount = 1) {
  const chest = rig.chest?.current;
  if (!chest) return;
  const b = Math.sin(t * 1.15) * 0.5 + 0.5;
  chest.scale.set(1, 1 + b * 0.013 * amount, 1 + b * 0.02 * amount);
}

/**
 * Blink. Deterministic pseudo-random spacing so it never looks metronomic,
 * driven purely by the clock — no timers, no state.
 */
function blink(rig, t) {
  const cycle = 4.2;
  const slot = Math.floor(t / cycle);
  const jitter = ((Math.sin(slot * 12.9898) * 43758.5453) % 1) * 2.4;
  const local = t - slot * cycle - jitter;
  const closed = local > 0 && local < 0.12 ? 1 - Math.abs(local - 0.06) / 0.06 : 0;
  const sy = 1 - closed * 0.9;
  if (rig.eyeL?.current) rig.eyeL.current.scale.y = sy;
  if (rig.eyeR?.current) rig.eyeR.current.scale.y = sy;
}

/** The head tracks the cursor a little. Small angles — it should feel alive, not possessed. */
function lookAtCursor(
  rig,
  t,
  { yaw = 0.3, pitch = 0.16, baseYaw = 0, basePitch = 0 } = {},
) {
  const head = rig.head?.current;
  if (!head) return;
  const targetY = baseYaw + pointer.x * yaw;
  const targetX = basePitch + pointer.y * pitch + Math.sin(t * 0.6) * 0.014;
  head.rotation.y += (targetY - head.rotation.y) * 0.06;
  head.rotation.x += (targetX - head.rotation.x) * 0.06;
}

/* ------------------------------------------------------------------ *
 * Seated at a desk, typing.
 * ------------------------------------------------------------------ */
export function poseTyping(rig, t) {
  set(rig.hips, 0.05);

  // legs under the desk
  set(rig.thighL, -1.45, 0.07);
  set(rig.thighR, -1.45, -0.07);
  set(rig.kneeL, 1.38);
  set(rig.kneeR, 1.38);

  // Each hand taps on its own phase, and the shoulder follows a fraction of
  // the movement — that little bit of follow-through is most of what sells it.
  const tapL = Math.max(0, Math.sin(t * 7.4));
  const tapR = Math.max(0, Math.sin(t * 6.1 + 1.9));
  const leanIn = Math.sin(t * 0.5) * 0.02;

  // Shoulders swing almost fully forward and the elbows stay nearly straight:
  // the hands have to arrive at desk height, and the reach is only just long
  // enough. A comfortable-looking bend leaves them typing on thin air.
  set(rig.shoulderL, -1.38 - tapL * 0.05 + leanIn, 0.12, 0.22);
  set(rig.shoulderR, -1.38 - tapR * 0.05 + leanIn, -0.12, -0.22);
  set(rig.elbowL, -0.3 + tapL * 0.1, 0, -0.14);
  set(rig.elbowR, -0.3 + tapR * 0.1, 0, 0.14);
  set(rig.handL, 0.3 - tapL * 0.32, 0, 0.1);
  set(rig.handR, 0.3 - tapR * 0.32, 0, -0.1);

  set(rig.chest, 0.1 + leanIn * 0.6);
  breathe(rig, t, 0.7);
  blink(rig, t);
  // Seen from the front now: the head rests toward the monitor at his side
  // and follows the cursor mirrored, since he faces the visitor.
  lookAtCursor(rig, t, { yaw: -0.28, pitch: 0.1, baseYaw: 0.16, basePitch: -0.04 });
}

/* ------------------------------------------------------------------ *
 * Standing, at rest — used by the scan scene.
 * ------------------------------------------------------------------ */
export function poseStanding(rig, t) {
  const sway = Math.sin(t * 0.42);
  const shift = Math.sin(t * 0.31);

  set(rig.hips, 0, shift * 0.035, 0);
  set(rig.chest, -0.02, shift * -0.02, 0);

  set(rig.thighL, 0.02, 0, 0.03);
  set(rig.thighR, -0.02, 0, -0.03);
  set(rig.kneeL, 0.02);
  set(rig.kneeR, 0.03);

  set(rig.shoulderL, sway * 0.03, 0, 0.13);
  set(rig.shoulderR, -sway * 0.03, 0, -0.13);
  set(rig.elbowL, -0.12, 0, -0.05);
  set(rig.elbowR, -0.12, 0, 0.05);
  set(rig.handL, 0, 0, 0);
  set(rig.handR, 0, 0, 0);

  breathe(rig, t, 1);
  blink(rig, t);
  lookAtCursor(rig, t, { yaw: 0.34, pitch: 0.18 });
}

/* ------------------------------------------------------------------ *
 * Standing with arms folded — used by the contact scene.
 * ------------------------------------------------------------------ */
export function poseArmsCrossed(rig, t) {
  const shift = Math.sin(t * 0.29);

  set(rig.hips, 0, shift * 0.03, 0);
  set(rig.chest, -0.04, shift * -0.02, 0);

  set(rig.thighL, 0.02, 0, 0.05);
  set(rig.thighR, -0.02, 0, -0.05);
  set(rig.kneeL, 0.03);
  set(rig.kneeR, 0.02);

  // The forearms cross at slightly different depths so they read as folded
  // rather than fused: the left sits in front, the right tucks behind it.
  set(rig.shoulderL, -0.34, 0.16, 1.02);
  set(rig.elbowL, -1.42, -0.34, 0);
  set(rig.handL, 0, 0, -0.25);

  set(rig.shoulderR, -0.22, -0.16, -1.12);
  set(rig.elbowR, -1.52, 0.34, 0);
  set(rig.handR, 0, 0, 0.25);

  breathe(rig, t, 0.8);
  blink(rig, t);
  lookAtCursor(rig, t, { yaw: 0.3, pitch: 0.16 });
}

/* ------------------------------------------------------------------ *
 * Standing, holding a laptop at chest height — the About scene.
 * The laptop itself is a separate prop placed where these hands end up.
 * ------------------------------------------------------------------ */
export function posePresenting(rig, t) {
  const shift = Math.sin(t * 0.3);

  set(rig.hips, 0, shift * 0.025, 0);
  set(rig.chest, -0.03, shift * -0.015, 0);

  set(rig.thighL, 0.02, 0, 0.04);
  set(rig.thighR, -0.02, 0, -0.05);
  set(rig.kneeL, 0.02);
  set(rig.kneeR, 0.03);

  // Both arms reach forward and *down* to the laptop at waist height. The
  // first attempt bent the elbows a full -1.5 rad, which swings the forearms
  // up past the shoulders — hands over the eyes, "hear no evil". Shoulder
  // and elbow each carry about half the reach instead.
  const tap = Math.max(0, Math.sin(t * 4.2));
  set(rig.shoulderL, -0.5, 0.25, 0.24);
  set(rig.elbowL, -0.6, -0.3, 0);
  set(rig.handL, -0.2, 0, 0);

  set(rig.shoulderR, -0.55 - tap * 0.04, -0.3, -0.2);
  set(rig.elbowR, -0.5 + tap * 0.08, 0.25, 0);
  set(rig.handR, 0.15 - tap * 0.25, 0, 0);

  breathe(rig, t, 0.9);
  blink(rig, t);
  lookAtCursor(rig, t, { yaw: -0.34, pitch: 0.16, basePitch: 0.02 });
}

const POSES = {
  typing: poseTyping,
  standing: poseStanding,
  armsCrossed: poseArmsCrossed,
  presenting: posePresenting,
};

/**
 * Drives a rig every frame.
 *
 * @param rigRef  ref returned by <Figure ref={...} />
 * @param mode    "typing" | "standing" | "armsCrossed"
 */
export default function usePose(rigRef, mode = "standing") {
  useFrame((state) => {
    const rig = rigRef.current;
    if (!rig) return;
    (POSES[mode] ?? poseStanding)(rig, state.clock.elapsedTime);
  });
}
