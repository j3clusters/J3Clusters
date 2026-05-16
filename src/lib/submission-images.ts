import { randomUUID } from "node:crypto";
import sharp from "sharp";

import { persistWebpPublicUrl } from "@/lib/upload";
import { MAX_LISTING_IMAGES } from "@/lib/listing-image-limits";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function processSubmissionImageFiles(
  images: File[],
): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  if (!images.length) {
    return { ok: true, paths: [] };
  }
  if (images.length > MAX_LISTING_IMAGES) {
    return {
      ok: false,
      error: `You can upload a maximum of ${MAX_LISTING_IMAGES} images.`,
    };
  }

  const paths: string[] = [];
  for (const image of images) {
    if (!image.type.startsWith("image/")) {
      return { ok: false, error: "Only image file uploads are allowed." };
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Each image must be 8 MB or smaller." };
    }

    const fileName = `${Date.now()}-${randomUUID()}.webp`;
    const buffer = Buffer.from(await image.arrayBuffer());
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    } catch (error) {
      console.error("[submission-images] processing failed:", error);
      return {
        ok: false,
        error:
          "One or more images could not be processed. Try different photos or formats.",
      };
    }

    const stored = await persistWebpPublicUrl(fileName, optimizedBuffer);
    if (!stored.ok) {
      console.error("[submission-images] storage failed:", stored.error);
      return { ok: false, error: stored.error };
    }
    paths.push(stored.path);
  }

  return { ok: true, paths };
}

export function existingImagesFromFormData(formData: FormData): string[] {
  return formData
    .getAll("existingImages")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, MAX_LISTING_IMAGES);
}
