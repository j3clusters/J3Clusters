import { promises as fs } from "node:fs";
import path from "node:path";

type ListingRecycleBinEntry = {
  listingId: string;
  deletedAtIso: string;
};

const recycleBinFilePath = path.join(
  process.cwd(),
  "data",
  "listing-recycle-bin.json",
);

async function readEntries(): Promise<ListingRecycleBinEntry[]> {
  try {
    const json = await fs.readFile(recycleBinFilePath, "utf8");
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is ListingRecycleBinEntry =>
        !!item &&
        typeof item === "object" &&
        typeof (item as ListingRecycleBinEntry).listingId === "string" &&
        typeof (item as ListingRecycleBinEntry).deletedAtIso === "string",
    );
  } catch {
    return [];
  }
}

async function writeEntries(entries: ListingRecycleBinEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(recycleBinFilePath), { recursive: true });
  await fs.writeFile(recycleBinFilePath, JSON.stringify(entries, null, 2), "utf8");
}

export async function getListingRecycleBinEntries(): Promise<ListingRecycleBinEntry[]> {
  return await readEntries();
}

export async function markListingDeleted(listingId: string): Promise<void> {
  const entries = await readEntries();
  const nowIso = new Date().toISOString();
  const withoutListing = entries.filter((item) => item.listingId !== listingId);
  withoutListing.push({ listingId, deletedAtIso: nowIso });
  await writeEntries(withoutListing);
}

export async function removeListingFromRecycleBin(listingId: string): Promise<void> {
  const entries = await readEntries();
  const next = entries.filter((item) => item.listingId !== listingId);
  await writeEntries(next);
}

export async function purgeExpiredRecycleBinEntries(
  retentionDays = 30,
): Promise<string[]> {
  const entries = await readEntries();
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const expired = entries.filter(
    (item) => new Date(item.deletedAtIso).getTime() < cutoff,
  );
  const active = entries.filter(
    (item) => new Date(item.deletedAtIso).getTime() >= cutoff,
  );
  if (expired.length > 0) {
    await writeEntries(active);
  }
  return expired.map((item) => item.listingId);
}
