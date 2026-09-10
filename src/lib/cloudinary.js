/**
 * src/lib/cloudinary.js — IMAGE UPLOADS TO CLOUDINARY (server only).
 *
 * The database stores only the final image URL; the file itself lives in your
 * Cloudinary account, inside the folder named by CLOUDINARY_FOLDER.
 *
 * CREDENTIALS — two accepted spellings in .env.local, use either one:
 *
 *   1) three separate variables (what the README asks for)
 *        CLOUDINARY_CLOUD_NAME="your-cloud-name"
 *        CLOUDINARY_API_KEY="123456789012345"
 *        CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
 *
 *   2) the single line Cloudinary's own dashboard gives you
 *        CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
 *
 * Surrounding quotes and stray spaces/newlines are stripped automatically —
 * a copy-paste with quotes left in used to break the signature silently.
 */
import { v2 as cloudinary } from "cloudinary";

/* ------------------------------------------------------------------ *
 * Read one env var and clean it up.
 * Removes wrapping "double" or 'single' quotes and any whitespace, which
 * is the single most common reason an upload fails with "Invalid Signature".
 * ------------------------------------------------------------------ */
function env(name) {
  const raw = process.env[name];
  if (!raw) return "";
  return raw.trim().replace(/^['"]|['"]$/g, "").trim();
}

/* ------------------------------------------------------------------ *
 * Work out the credentials from whichever spelling is present.
 * Returns { cloudName, apiKey, apiSecret, source }.
 * ------------------------------------------------------------------ */
function credentials() {
  // Preferred: the three explicit variables.
  const cloudName = env("CLOUDINARY_CLOUD_NAME");
  const apiKey = env("CLOUDINARY_API_KEY");
  const apiSecret = env("CLOUDINARY_API_SECRET");
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret, source: "CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET" };
  }

  // Fallback: cloudinary://key:secret@cloud-name
  const url = env("CLOUDINARY_URL");
  if (url) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) {
      return {
        cloudName: decodeURIComponent(m[3]).trim(),
        apiKey: decodeURIComponent(m[1]).trim(),
        apiSecret: decodeURIComponent(m[2]).trim(),
        source: "CLOUDINARY_URL",
      };
    }
  }

  // Whatever we managed to find (used to report what is missing).
  return { cloudName, apiKey, apiSecret, source: "" };
}

let configuredFor = "";
function client() {
  const { cloudName, apiKey, apiSecret } = credentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured — fill CLOUDINARY_* in .env.local");
  }
  // Re-configure if the values changed (e.g. you edited .env.local and restarted).
  const fingerprint = `${cloudName}:${apiKey}`;
  if (configuredFor !== fingerprint) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configuredFor = fingerprint;
  }
  return cloudinary;
}

/** True when a usable set of credentials was found (either spelling). */
export function cloudinaryEnabled() {
  const { cloudName, apiKey, apiSecret } = credentials();
  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * What is / isn't configured — for the diagnostics shown by GET /api/upload.
 * Never returns the secret itself, only whether it is present.
 */
export function cloudinaryStatus() {
  const { cloudName, apiKey, apiSecret, source } = credentials();
  const missing = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");
  return {
    ready: missing.length === 0,
    readFrom: source || "nothing found",
    cloudName: cloudName || null,
    apiKeyEndsWith: apiKey ? apiKey.slice(-4) : null,
    apiSecretLength: apiSecret ? apiSecret.length : 0,
    missing,
    folder: env("CLOUDINARY_FOLDER") || "portfolio",
  };
}

/* ------------------------------------------------------------------ *
 * Turn Cloudinary's raw error into a sentence that says what to fix.
 * Used by the /api/upload route so the admin panel shows the real reason
 * instead of a bare "Upload failed".
 * ------------------------------------------------------------------ */
export function explainCloudinaryError(err) {
  // Pull out a readable message. Cloudinary sometimes reports the text on
  // err.message, sometimes on err.error.message, and occasionally sends only
  // an HTTP code — so never fall back to String(err), which would produce
  // the useless "[object Object]".
  const msg = String(
    err?.message || err?.error?.message || (typeof err === "string" ? err : "") || "",
  ).trim();
  const status = err?.http_code || err?.error?.http_code;

  if (/invalid signature/i.test(msg)) {
    return "Cloudinary rejected the signature — CLOUDINARY_API_SECRET is wrong or has extra characters. Copy it again from the Cloudinary dashboard, then restart the dev server.";
  }
  if (/unknown api[_ ]?key|invalid api[_ ]?key/i.test(msg)) {
    return "Cloudinary does not recognise this API key — check CLOUDINARY_API_KEY, then restart the dev server.";
  }
  if (/cloud_name|invalid cloud/i.test(msg)) {
    return "That Cloudinary cloud name does not exist — check CLOUDINARY_CLOUD_NAME (it is the short name at the top of your dashboard), then restart the dev server.";
  }
  if (status === 401 || /unauthor/i.test(msg)) {
    return `Cloudinary refused the request (unauthorised): ${msg || "check your CLOUDINARY_* values"}`;
  }
  if (status === 420 || /rate limit/i.test(msg)) {
    return "Cloudinary rate limit reached — wait a minute and try again.";
  }
  if (/ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|network|socket hang up/i.test(msg)) {
    return `Could not reach Cloudinary — check your internet connection or proxy (${msg}).`;
  }
  if (/File size too large|maximum/i.test(msg)) {
    return `Cloudinary rejected the file size: ${msg}`;
  }
  // The Node SDK reports auth failures generically as an "unexpected status
  // code" — 401/403 there almost always means the key/secret pair is wrong,
  // or something on the network (VPN, firewall, company proxy) is blocking
  // api.cloudinary.com.
  if (/unexpected status code\D*(401|403)/i.test(msg)) {
    return "Cloudinary refused the upload (401/403). Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are the pair from the same account, and that nothing on your network (VPN / firewall / proxy) is blocking api.cloudinary.com. Open http://localhost:3000/api/upload to see what the app is reading.";
  }
  return msg ? `Cloudinary error: ${msg}` : "Upload failed for an unknown reason — check the terminal running npm run dev.";
}

/**
 * Upload a file (Buffer) and return { url, publicId, width, height }.
 * Images are delivered with automatic format + quality (f_auto,q_auto).
 */
export async function uploadImage(buffer, filename = "upload") {
  const cld = client();
  const folder = env("CLOUDINARY_FOLDER") || "portfolio";
  const publicId = filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60);

  const result = await new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        public_id: `${publicId || "image"}-${Date.now().toString(36)}`,
        resource_type: "image",
        overwrite: false,
      },
      (err, res) => {
        if (err) return reject(err);
        if (!res?.secure_url) return reject(new Error("Cloudinary returned no image URL"));
        resolve(res);
      },
    );
    stream.on("error", reject);
    stream.end(buffer);
  });

  // Insert automatic format/quality into the delivery URL.
  const url = result.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  return { url, publicId: result.public_id, width: result.width, height: result.height };
}
