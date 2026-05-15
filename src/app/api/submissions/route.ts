import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

import { USER_SESSION_COOKIE_NAME, verifyUserJwt } from "@/lib/auth/session";
import { withListingPurpose } from "@/lib/listing-purpose";
import { prisma } from "@/lib/prisma";
import { saveOwnerPortrait } from "@/lib/upload";
import { propertySubmissionSchema } from "@/lib/validators";

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const token = (await cookies()).get(USER_SESSION_COOKIE_NAME)?.value;
  const session = await verifyUserJwt(token);
  if (!session) {
    return NextResponse.json(
      { error: "Please login to post property." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const rawImages = formData.getAll("images");
  const images = rawImages.filter((item): item is File => item instanceof File);
  if (!images.length) {
    return NextResponse.json(
      { error: "At least one property image is required." },
      { status: 400 },
    );
  }
  if (images.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `You can upload a maximum of ${MAX_IMAGES} images.` },
      { status: 400 },
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const imageUrls: string[] = [];
  for (const image of images) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image file uploads are allowed." },
        { status: 400 },
      );
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Each image must be 8 MB or smaller." },
        { status: 400 },
      );
    }

    const fileName = `${Date.now()}-${randomUUID()}.webp`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await image.arrayBuffer());
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      await writeFile(filePath, optimizedBuffer);
    } catch (error) {
      console.error("[submissions] Image processing failed:", error);
      return NextResponse.json(
        {
          error:
            "One or more images could not be processed. Try different photos or formats.",
        },
        { status: 400 },
      );
    }
    imageUrls.push(`/uploads/${fileName}`);
  }

  const ownerPhotoField = formData.get("ownerPhoto");
  let ownerPhotoUrl = "";
  if (ownerPhotoField instanceof File && ownerPhotoField.size > 0) {
    const portrait = await saveOwnerPortrait(ownerPhotoField);
    if (!portrait.ok) {
      return NextResponse.json({ error: portrait.error }, { status: 400 });
    }
    ownerPhotoUrl = portrait.path;
  }

  const body = {
    ownerName: String(formData.get("ownerName") ?? ""),
    ownerEmail: String(formData.get("ownerEmail") ?? ""),
    ownerPhone: String(formData.get("ownerPhone") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    type: String(formData.get("type") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    areaSqft: String(formData.get("areaSqft") ?? ""),
    bedrooms: String(formData.get("bedrooms") ?? ""),
    bathrooms: String(formData.get("bathrooms") ?? ""),
    balconies: String(formData.get("balconies") ?? ""),
    parkingSpots: String(formData.get("parkingSpots") ?? ""),
    furnishing: String(formData.get("furnishing") ?? ""),
    propertyAgeYears: String(formData.get("propertyAgeYears") ?? ""),
    availableFrom: String(formData.get("availableFrom") ?? ""),
    legalClearance: formData.get("legalClearance") === "on",
    imageUrl: imageUrls[0],
    imageUrls,
    price: String(formData.get("price") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const parsed = propertySubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const descriptionWithPurpose = withListingPurpose(
    parsed.data.description,
    parsed.data.purpose,
  );

  try {
    await prisma.propertySubmission.create({
      data: {
        appUserId: session.sub,
        ownerName: parsed.data.ownerName,
        ownerEmail: parsed.data.ownerEmail,
        ownerPhone: parsed.data.ownerPhone,
        purpose: parsed.data.purpose,
        type: parsed.data.type,
        address: parsed.data.address,
        city: parsed.data.city,
        areaSqft: parsed.data.areaSqft,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        balconies: parsed.data.balconies,
        parkingSpots: parsed.data.parkingSpots,
        furnishing: parsed.data.furnishing,
        propertyAgeYears: parsed.data.propertyAgeYears,
        availableFrom: parsed.data.availableFrom,
        legalClearance: parsed.data.legalClearance,
        imageUrl: parsed.data.imageUrl,
        imageUrls: parsed.data.imageUrls,
        ownerPhotoUrl,
        price: parsed.data.price,
        description: descriptionWithPurpose,
      },
    });
  } catch (error) {
    console.error("Failed to save property submission:", error);
    return NextResponse.json(
      {
        error:
          "Unable to save submission right now. Please ask admin to run latest database migration.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
