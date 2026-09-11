/**
 * Everything about how the character looks, in one place.
 *
 * The geometry in Figure.jsx is deliberately generic — it is this file that
 * makes the avatar *him*. Matching a new reference photo means editing these
 * values and nothing else.
 */
export const LOOK = {
  // --- skin ---
  skin: "#efc09c", // fair-warm, from the photo
  skinDeep: "#d6a077", // ears, inner mouth shadow
  mouth: "#6b4237", // a wide thin dark line — never a coloured "lip"

  // --- hair ---
  // Warm brown with a lighter sheen lobe, per the reference art style.
  hair: "#2f1e14", // dark chestnut, swept back
  hairLight: "#4a3220",
  hairCap: 1.08, // polar sweep of the crown cap — ends above the brows; without glasses a deep cap reads as hair over the eyes
  hairTilt: 0.07, // forward lean, which is what makes a hairline read naturally
  hairPuff: 1.05, // >1 gives it volume above the skull
  hairBack: 0.62, // how far down the back and sides the hair continues

  // --- face ---
  brow: "#1d130c", // thick and dark — his most distinctive feature
  eye: "#1c1410",
  eyeWhite: "#f8fafc",
  beard: "#3a2a1e", // short young beard, connected to a light moustache
  beardStrength: 0.9, // 0 = clean shaven, 1 = full beard
  hasGlasses: false, // the photo shows none
  glassesFrame: "#111827",
  glassesLens: "#93c5fd",

  // --- clothing ---
  shirt: "#e9e3d8", // cream hoodie body, from his photo
  shirtDeep: "#7b5849", // brown raglan sleeves // sleeve bands and collar
  trousers: "#9c7350", // camel-brown trousers
  shoe: "#eceae3", // white sneakers
  shoeSole: "#b6b0a4",

  // --- the accent used for holograms, scan lines and screen glow ---
  accent: "#60a5fa",
};

/**
 * Skeleton measurements, in metres, from the soles up. The proportions are
 * intentionally stylised — the head is about a third of the total height,
 * which is what gives 3D-illustration characters their charm. Realistic
 * proportions at this polygon budget just look like a mannequin.
 */
export const RIG = {
  hipY: 0.78,
  chestY: 0.24, // relative to hips
  neckY: 0.3, // relative to chest
  headY: 0.26, // relative to neck

  headR: 0.265,
  headScale: [1, 1.06, 0.97],

  torsoR: 0.19,
  torsoLen: 0.24,
  torsoScale: [1.36, 1, 0.88],

  shoulderX: 0.255,
  shoulderY: 0.2,
  upperArmR: 0.078,
  upperArmLen: 0.15,
  foreArmR: 0.068,
  foreArmLen: 0.14,
  handR: 0.085,

  hipX: 0.115,
  thighR: 0.095,
  thighLen: 0.16,
  shinR: 0.082,
  shinLen: 0.16,
  footLen: 0.22,
};
