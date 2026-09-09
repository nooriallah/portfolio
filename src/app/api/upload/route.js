/**
 * src/app/api/upload/route.js — POST /api/upload
 *
 * Receives one image file (multipart field "file") from the admin ImageField,
 * uploads it to Cloudinary and returns { url }. Protected by src/proxy.js
 * (must be logged in) and double-checked here.
 *
 * Limits: images only, max 8 MB. Change MAX_BYTES below if you need bigger.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth.js";
import { uploadImage, cloudinaryEnabled } from "@/lib/cloudinary.js";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!cloudinaryEnabled()) {
    return NextResponse.json(
      { error: "Cloudinary is not configured. Fill CLOUDINARY_* in .env.local (or paste an image URL instead)." },
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
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
