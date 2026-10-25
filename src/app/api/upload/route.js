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
 * Limits and accepted types: src/backend/media/limits.js.
 */
import { NextResponse } from "next/server";
import { getSession } from "@backend/auth/index.js";
import {
  uploadImage,
  uploadFile,
  cloudinaryEnabled,
  cloudinaryStatus,
  explainCloudinaryError,
} from "@backend/media/cloudinary.js";

/* What may be uploaded, per kind. The browser sends `kind` alongside the file:
   "image" from the image fields, "file" from the CV / document fields.
   The limits and accepted types live in src/backend/media/limits.js, shared
   with the admin so the browser can refuse a file before sending it. */
import { MAX_IMAGE_BYTES, MAX_FILE_BYTES, DOC_TYPES, formatMB } from "@backend/media/limits.js";

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
  // "image" (default) or "file" — the admin field says which it is, so a PDF
  // can never be dropped into an image field, or a photo into the CV field.
  const kind = form.get("kind") === "file" ? "file" : "image";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  if (kind === "image") {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed here" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Image is larger than ${formatMB(MAX_IMAGE_BYTES)}` },
        { status: 413 },
      );
    }
  } else {
    if (!DOC_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Only PDF or Word documents are allowed here" },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        {
          error: `That file is ${formatMB(file.size)} — the limit is ${formatMB(MAX_FILE_BYTES)}. Compress the PDF and try again.`,
        },
        { status: 413 },
      );
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result =
      kind === "file"
        ? await uploadFile(buffer, file.name)
        : await uploadImage(buffer, file.name);
    return NextResponse.json(result);
  } catch (err) {
    // Log the full error for the terminal, and send the readable reason to the
    // admin panel so you can see what to fix without reading the console.
    console.error("[upload] failed:", err);
    return NextResponse.json({ error: explainCloudinaryError(err) }, { status: 500 });
  }
}
