import { z } from "zod";

const listingType = z.enum(["Apartment", "Villa", "Plot", "PG"]);
const listingPurpose = z.enum(["Sale", "Rent"]);
const furnishingType = z.enum(["Unfurnished", "SemiFurnished", "Furnished"]);
const optionalNumberField = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(0).max(max).optional(),
  );

export const propertySubmissionSchema = z.object({
  ownerName: z.string().trim().min(1).max(200),
  ownerEmail: z.string().trim().email().max(254),
  ownerPhone: z.string().trim().min(5).max(40),
  purpose: listingPurpose,
  type: listingType,
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(1).max(120),
  areaSqft: z.coerce.number().int().positive().max(1_000_000),
  bedrooms: optionalNumberField(50),
  bathrooms: optionalNumberField(50),
  balconies: optionalNumberField(20),
  parkingSpots: optionalNumberField(20),
  furnishing: furnishingType.optional(),
  propertyAgeYears: optionalNumberField(200),
  availableFrom: z.string().trim().min(8).max(40),
  legalClearance: z.boolean(),
  imageUrl: z.string().trim().min(1).max(2048),
  imageUrls: z.array(z.string().trim().min(1).max(2048)).min(1).max(10),
  price: z.coerce.number().int().positive().max(999_999_999_999),
  description: z.string().trim().min(10).max(8000),
})
  .superRefine((data, ctx) => {
    const requiresRoomDetails = data.type === "Apartment" || data.type === "Villa" || data.type === "PG";
    const requiresBalconyAndParking =
      data.type === "Apartment" || data.type === "Villa" || data.type === "PG";

    if (requiresRoomDetails && data.bedrooms == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bedrooms is required for this property type.",
        path: ["bedrooms"],
      });
    }
    if (requiresRoomDetails && data.bathrooms == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bathrooms is required for this property type.",
        path: ["bathrooms"],
      });
    }
    if (requiresBalconyAndParking && data.balconies == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Balconies is required for this property type.",
        path: ["balconies"],
      });
    }
    if (requiresBalconyAndParking && data.parkingSpots == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Parking spots is required for this property type.",
        path: ["parkingSpots"],
      });
    }
    if (requiresRoomDetails && !data.furnishing) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Furnishing is required for this property type.",
        path: ["furnishing"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    balconies: data.balconies ?? 0,
    parkingSpots: data.parkingSpots ?? 0,
    furnishing: data.furnishing ?? "Unfurnished",
    propertyAgeYears: data.propertyAgeYears ?? 0,
  }));

export const contactLeadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(254),
  message: z.string().trim().max(8000).optional(),
});

export const registrationSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    phone: z.string().trim().min(5).max(40),
    email: z.string().trim().email().max(254),
    city: z.string().trim().min(1).max(120),
    password: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
    accountRole: z.enum(["CONSULTANT", "MEMBER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  })
  .transform(({ confirmPassword, ...rest }) => {
    void confirmPassword;
    return rest;
  });

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().max(254),
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().trim().min(10).max(512),
    password: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  })
  .transform(({ confirmPassword, token, password }) => {
    void confirmPassword;
    return { token, password };
  });
