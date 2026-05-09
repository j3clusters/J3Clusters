import "server-only";

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

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

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
    const fullPath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(fullPath, optimized);

    return { ok: true, path: `${PUBLIC_PREFIX}/${filename}` };
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
