import "server-only";

import { put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

export const MAX_IMAGES = 11;
export const MAX_BYTES_PER_FILE = 12 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 82;
const OWNER_PORTRAIT_SIZE = 512;
export const OWNER_PORTRAIT_MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export type SaveImageResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export type SaveImagesResult =
  | { ok: true; paths: string[] }
  | { ok: false; error: string; paths: string[] };

/**
 * Persist an optimized WebP buffer. Uses Vercel Blob when
 * `BLOB_READ_WRITE_TOKEN` is set (required on Vercel serverless); otherwise
 * writes under `public/uploads` for local / VPS hosting.
 */
export async function persistWebpPublicUrl(
  filename: string,
  buffer: Buffer,
): Promise<SaveImageResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    try {
      const blob = await put(`properties/${filename}`, buffer, {
        access: "public",
        token,
        contentType: "image/webp",
      });
      return { ok: true, path: blob.url };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cloud storage upload failed.";
      return { ok: false, error: message };
    }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  try {
    if (process.env.VERCEL) {
      return {
        ok: false,
        error:
          "Photo storage is not configured for this deployment. Ask the administrator to enable Vercel Blob and set BLOB_READ_WRITE_TOKEN on the project.",
      };
    }
    const fullPath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(fullPath, buffer);
    return { ok: true, path: `${PUBLIC_PREFIX}/${filename}` };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save image to disk.";
    return { ok: false, error: message };
  }
}

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    !!value &&
    typeof value === "object" &&
    "size" in value &&
    "type" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    (value as File).size > 0
  );
}

export async function saveUploadedImage(
  file: File | null,
): Promise<SaveImageResult> {
  if (!file || !isUploadedFile(file)) {
    return { ok: false, error: "No file provided." };
  }
  if (file.size > MAX_BYTES_PER_FILE) {
    return { ok: false, error: "Image is larger than 12 MB." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.webp`;
    return persistWebpPublicUrl(filename, optimized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process image.";
    return { ok: false, error: message };
  }
}

/** Square portrait for property consultant / agent (cover crop, WebP). */
export async function saveOwnerPortrait(
  file: File | null,
): Promise<SaveImageResult> {
  if (!file || !isUploadedFile(file)) {
    return { ok: false, error: "No file provided." };
  }
  if (file.size > OWNER_PORTRAIT_MAX_BYTES) {
    return { ok: false, error: "Photo must be 4 MB or smaller." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: `Unsupported file type: ${file.type || "unknown"}.` };
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({
        width: OWNER_PORTRAIT_SIZE,
        height: OWNER_PORTRAIT_SIZE,
        fit: "cover",
        position: "attention",
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    const filename = `owner-${Date.now()}-${crypto.randomBytes(8).toString("hex")}.webp`;
    return persistWebpPublicUrl(filename, optimized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process image.";
    return { ok: false, error: message };
  }
}

export async function saveUploadedImages(
  files: File[],
  options?: { maxCount?: number },
): Promise<SaveImagesResult> {
  const maxCount = options?.maxCount ?? MAX_IMAGES;
  const usable = files.filter(isUploadedFile);

  if (usable.length === 0) {
    return { ok: false, error: "No files provided.", paths: [] };
  }
  if (usable.length > maxCount) {
    return {
      ok: false,
      error: `Too many files. Maximum ${maxCount} allowed.`,
      paths: [],
    };
  }

  const paths: string[] = [];
  for (const file of usable) {
    const result = await saveUploadedImage(file);
    if (result.ok) {
      paths.push(result.path);
    } else {
      return { ok: false, error: result.error, paths };
    }
  }

  return { ok: true, paths };
}
