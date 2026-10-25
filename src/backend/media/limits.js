/**
 * src/backend/media/limits.js — UPLOAD RULES, shared by the server and the admin.
 *
 * One place for "what may be uploaded and how big", imported by:
 *   - src/app/api/upload/route.js        (the server enforces it)
 *   - src/backend/admin-ui/Fields.jsx    (the browser checks it BEFORE sending,
 *                                         so an oversized file gets an instant,
 *                                         readable message instead of a vague
 *                                         server error)
 *
 * Why 9 MB for documents and not more: Next.js refuses request bodies over
 * 10 MB before our code even runs (the reply is an empty 500), and a multipart
 * upload carries a little overhead on top of the file itself. 9 MB leaves
 * room for that. Cloudinary's free plan also caps raw files at 10 MB, so going
 * higher would need both a Next config change and a paid Cloudinary plan.
 */

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_FILE_BYTES = 9 * 1024 * 1024; // 9 MB (see note above)

/** Document types accepted by the file (CV) field, MIME → readable name. */
export const DOC_TYPES = {
  "application/pdf": "PDF",
  "application/msword": "Word document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
};

/** Human-readable size, e.g. "9 MB" or "2.4 MB". */
export function formatMB(bytes) {
  const mb = bytes / 1024 / 1024;
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
}
