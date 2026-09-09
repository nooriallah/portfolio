/**
 * src/lib/cloudinary.js — IMAGE UPLOADS TO CLOUDINARY (server only).
 *
 * The database stores only the final image URL; the file itself lives in your
 * Cloudinary account, inside the folder named by CLOUDINARY_FOLDER.
 * Credentials: CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env.local.
 */
import { v2 as cloudinary } from "cloudinary";

let configured = false;
function client() {
  if (!configured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary is not configured — fill CLOUDINARY_* in .env.local");
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

/** True when all three Cloudinary variables are set. */
export function cloudinaryEnabled() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

/**
 * Upload a file (Buffer) and return { url, publicId, width, height }.
 * Images are delivered with automatic format + quality (f_auto,q_auto).
 */
export async function uploadImage(buffer, filename = "upload") {
  const cld = client();
  const folder = process.env.CLOUDINARY_FOLDER || "portfolio";
  const publicId = filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60);

  const result = await new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        folder,
        public_id: `${publicId}-${Date.now().toString(36)}`,
        resource_type: "image",
        overwrite: false,
      },
      (err, res) => (err ? reject(err) : resolve(res)),
    );
    stream.end(buffer);
  });

  // Insert automatic format/quality into the delivery URL.
  const url = result.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
  return { url, publicId: result.public_id, width: result.width, height: result.height };
}
