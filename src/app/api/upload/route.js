/**
 * src/app/api/upload/route.js
 *
 * POST /api/upload — receives one image file (multipart field "file") from the
 *                    admin image field, uploads it to Cloudinary, returns { url }.
 * GET  /api/upload — a self-check: open http://localhost:3000/api/upload in the
 *                    browser while logged in and it tells you exactly which
 *                    CLOUDINARY_* values it can see (never the secret itself).
 *                    Use this first whenever an upload fails.
 *
 * Both are protected by src/proxy.js (must be logged in) and double-checked here.
 * Limits: images only, max 8 MB — change MAX_BYTES below if you need bigger.
 */
import { NextResponse } from "next/server";
import { getSession } from "@backend/auth/index.js";
import {
  uploadImage,
  cloudinaryEnabled,
  cloudinaryStatus,
  explainCloudinaryError,
} from "@backend/media/cloudinary.js";

const MAX_BYTES = 8 * 1024 * 1024;

/* ------------------------------------------------------------------ *
 * GET — configuration self-check (no secrets in the response)
 * ------------------------------------------------------------------ */
export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = cloudinaryStatus();
  return NextResponse.json({
    ...status,
    hint: status.ready
      ? "Credentials found. If an upload still fails, the reason is now shown in the admin panel under the Upload button."
      : `Add ${status.missing.join(", ")} to .env.local (or a single CLOUDINARY_URL line), then restart npm run dev.`,
  });
}

/* ------------------------------------------------------------------ *
 * POST — the actual upload
 * ------------------------------------------------------------------ */
export async function POST(request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No credentials at all → say precisely which ones are missing.
  if (!cloudinaryEnabled()) {
    const { missing } = cloudinaryStatus();
    return NextResponse.json(
      {
        error: `Cloudinary is not configured — missing ${missing.join(", ")} in .env.local. Add them (or one CLOUDINARY_URL line), restart npm run dev, then try again. You can also just paste an image URL in the box above.`,
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8 MB" }, { status: 413 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, file.name);
    return NextResponse.json(result);
  } catch (err) {
    // Log the full error for the terminal, and send the readable reason to the
    // admin panel so you can see what to fix without reading the console.
    console.error("[upload] failed:", err);
    return NextResponse.json({ error: explainCloudinaryError(err) }, { status: 500 });
  }
}
