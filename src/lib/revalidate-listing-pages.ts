import { revalidatePath } from "next/cache";

/** Bust public catalog + owner portal after listing publish state changes. */
export function revalidateListingPages() {
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath("/listings/buy");
  revalidatePath("/listings/rent");
  revalidatePath("/my-properties");
}
