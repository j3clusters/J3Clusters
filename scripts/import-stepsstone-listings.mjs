/**
 * Import StepsStone project posts from a local HTTrack / wp-json mirror
 * into src/data/stepsstone-listings.generated.ts
 *
 * Usage:
 *   node scripts/import-stepsstone-listings.mjs --live
 *   node scripts/import-stepsstone-listings.mjs "C:/path/to/https___stepsstone.in_"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_MIRROR =
  "C:/My Web Sites/https___stepsstone.in_/stepsstone.in/wp-json/wp/v2/posts";

const BLOG_CATEGORY = 61;
const EXCLUDED_SLUG_RE =
  /reasons|issues|things|verified-before|airport-metro|compelling|parents-of-school|2-bhk-flats-chennai|flats-in-chennai/i;

const STEPSSTONE_OWNER = {
  ownerName: "StepsStone Promoters Pvt Ltd",
  ownerEmail: "mm@stepsstone.net",
  ownerPhone: "+91 93828 93828",
};

const WP_MEDIA_API = "https://stepsstone.in/wp-json/wp/v2/media";
const MAX_IMAGES_PER_LISTING = 24;
const MEDIA_FETCH_CONCURRENCY = 6;

const CITY_ALIASES = [
  ["Coimbatore", "Coimbatore"],
  ["Pollachi", "Pollachi"],
  ["Kattupakkam", "Chennai"],
  ["Porur", "Chennai"],
  ["Adyar", "Chennai"],
  ["Urapakkam", "Chennai"],
  ["Guduvanchery", "Chennai"],
  ["West Mambalam", "Chennai"],
  ["Mambalam", "Chennai"],
  ["Perumbakkam", "Chennai"],
  ["Choolaimedu", "Chennai"],
  ["Saligramam", "Chennai"],
  ["Perungudi", "Chennai"],
  ["Poonamallee", "Chennai"],
  ["Nemam", "Chennai"],
  ["Thiruvidanthai", "Chennai"],
  ["Thiruninravur", "Chennai"],
  ["Thirumazhisai", "Chennai"],
  ["Singaperumal", "Chennai"],
  ["Kovalam", "Chennai"],
  ["ECR", "Chennai"],
  ["Nemmeli", "Chennai"],
  ["Parandur", "Parandur"],
  ["Paranthur", "Parandur"],
  ["Madurai", "Madurai"],
  ["Kodaikanal", "Kodaikanal"],
];

function decodeHtml(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function introHtml(html) {
  const m = html.match(/id=&#8221;project-intro&#8221;[\s\S]*?\[\/vc_row\]/i);
  return m ? m[0] : html.slice(0, 12_000);
}

/** HTML slices that match visible hero + gallery on stepsstone.in project pages. */
function extractRelevantSections(html) {
  const parts = [];
  const intro = html.match(/id=&#8221;project-intro&#8221;[\s\S]*?\[\/vc_row\]/i);
  if (intro) parts.push(intro[0]);

  const gi = html.search(/text=&#8221;Gallery&#8221;/i);
  if (gi >= 0) {
    const slice = html.slice(gi, gi + 12_000);
    const first = slice.match(/images=&#8221;([^&#]+?)&#8243;/);
    if (first) parts.push(`images=&#8221;${first[1]}&#8243;`);
  }
  return parts.join("\n");
}

function stripVc(html) {
  const intro = introHtml(html).match(
    /\[vc_column_text[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/i
  );
  if (intro) {
    const heading = decodeHtml(intro[1]);
    const bullets = decodeHtml(intro[2]);
    return `${heading}. ${bullets}`;
  }
  const overview = html.match(/title=&#8221;Project Overview&#8221;[\s\S]*?\[vc_column_text[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  if (overview) {
    const text = decodeHtml(overview[1]).slice(0, 600);
    if (text.length > 40) return text;
  }
  const plain = decodeHtml(html).slice(0, 500);
  return plain.length > 30 ? plain : "";
}

function toRupees(num, unit) {
  const u = unit.toLowerCase();
  if (u.startsWith("cr") || u === "c") return Math.round(num * 10_000_000);
  return Math.round(num * 100_000);
}

/** Parse price from project intro (matches stepsstone.in hero cards). */
function parsePriceInfo(html) {
  const text = decodeHtml(introHtml(html));

  const range = text.match(
    /[₹\u20b9]\s*([\d.,]+)\s*(Lakhs?|L|Cr(?:ore)?|C)\s*(?:to|-)\s*([\d.,]+)\s*(Lakhs?|L|Cr(?:ore)?|C)/i
  );
  if (range) {
    const min = toRupees(parseFloat(range[1].replace(/,/g, "")), range[2]);
    const max = toRupees(parseFloat(range[3].replace(/,/g, "")), range[4]);
    return {
      price: min,
      priceNote: `₹${range[1]} ${range[2]} – ₹${range[3]} ${range[4]}`,
      areaSqft: parseAreaSqft(text),
    };
  }

  const perSqft = text.match(
    /[₹\u20b9]\s*([\d,]+)\s*\/?\s*(?:-)?\s*Per\s*Sq\.?\s*Ft/i
  );
  if (perSqft) {
    const rate = parseInt(perSqft[1].replace(/,/g, ""), 10);
    const areaSqft = parseAreaSqft(text) || 1200;
    return {
      price: rate * areaSqft,
      priceNote: `₹${rate.toLocaleString("en-IN")} per sq.ft`,
      areaSqft,
    };
  }

  const patterns = [
    /[₹\u20b9]\s*([\d.,]+)\s*(Lakhs?|L)\s*(?:Onwards)?/i,
    /[₹\u20b9]\s*([\d.,]+)\s*(Cr(?:ore)?|C)\s*(?:Onwards)?/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const val = toRupees(parseFloat(m[1].replace(/,/g, "")), m[2]);
    return { price: val, priceNote: m[0].trim(), areaSqft: parseAreaSqft(text) };
  }
  return { price: 0, priceNote: "", areaSqft: parseAreaSqft(text) };
}

function parseAreaSqft(text) {
  const range =
    text.match(
      /([\d,]+)\s*(?:sq\.?\s*ft\.?|Sq\.?\s*Ft\.?)\s*to\s*([\d,]+)\s*(?:sq\.?\s*ft\.?|Sq\.?\s*Ft\.?)?/i
    ) || text.match(/([\d,]+)\s*to\s*([\d,]+)\s*(?:sq\.?\s*ft\.?|Sq\.?\s*Ft\.?)/i);
  if (range) {
    const a = parseInt(range[1].replace(/,/g, ""), 10);
    const b = parseInt(range[2].replace(/,/g, ""), 10);
    return Math.round((a + b) / 2);
  }
  const single = text.match(/([\d,]+)\s*(?:sq\.?\s*ft\.?|Sq\.?\s*Ft\.?)/i);
  if (single) return parseInt(single[1].replace(/,/g, ""), 10);
  return 0;
}

function parseBeds(html, type) {
  if (type === "Plot") return 0;
  const text = decodeHtml(introHtml(html));
  const triple = text.match(/(\d)\s*,\s*(\d)\s*&\s*(\d)\s*BHK/i);
  if (triple) {
    return Math.max(Number(triple[1]), Number(triple[2]), Number(triple[3]));
  }
  const andPair = text.match(/(\d)\s+and\s+(\d)\s*BHK/i);
  if (andPair) return Math.max(Number(andPair[1]), Number(andPair[2]));
  const pair = text.match(/(\d)\s*&\s*(\d)(?:\s*,\s*\d+)?\s*BHK/i);
  if (pair) return Math.max(Number(pair[1]), Number(pair[2]));
  const bhkNums = [...text.matchAll(/(\d)\s*BHK/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= 1 && n <= 4);
  if (bhkNums.length) return Math.max(...bhkNums.slice(0, 3));
  if (/senior living|villa/i.test(text)) return 2;
  return type === "Apartment" ? 2 : 0;
}

function parseCity(title, slug, html) {
  const hay = `${title} ${slug} ${decodeHtml(introHtml(html))}`.toLowerCase();
  if (/pollachi/i.test(hay)) return "Pollachi";
  for (const [needle, city] of CITY_ALIASES) {
    if (hay.includes(needle.toLowerCase())) return city;
  }
  if (/chennai|ecr|porur|avadi/i.test(hay)) return "Chennai";
  return "Tamil Nadu";
}

function parseAddress(title, slug, city) {
  if (/kattupakkam/i.test(`${title} ${slug}`)) return "Kattupakkam, Porur";
  if (/pollachi/i.test(`${title} ${slug}`)) return "Pollachi, Coimbatore";
  if (/parandur|paranthur/i.test(`${title} ${slug}`)) return "Jambodai, Nr. Parandur";
  if (/nemmeli|kovalam|thiruvidanthai/i.test(`${title} ${slug}`)) return title.split(",").slice(1).join(",").trim() || city;
  const loc = title.includes(",")
    ? title.split(",").slice(1).join(",").trim()
    : city;
  return loc || city;
}

function inferType(title, slug, categories) {
  const hay = `${title} ${slug}`.toLowerCase();
  if (/plot|aaero|aero square|srinivasa palms|avarta|secret auraa|cloud 9/i.test(hay))
    return "Plot";
  if (/senior living|aalam/i.test(hay)) return "Apartment";
  if (/villa/i.test(hay)) return "Villa";
  if ((categories || []).some((c) => [97, 98].includes(c))) return "Apartment";
  if (/apartment|bhk|viraam|vatsa|enclave|laasya|ananthaya|mahathes|artithaa|aksharas|ranjan|avyaa|dattatreyas/i.test(hay))
    return "Apartment";
  return "Plot";
}

function normalizeImageUrl(url) {
  if (!url) return null;
  return url.split("?")[0].replace(/-\d+x\d+(?=\.\w+$)/i, "");
}

const STOCK_IMAGE_RE =
  /Apartments-in-|Senior-Living-in-|Senior-Living-Flats|Apartments-Pollachi|Retirements\.|Apartments-in-Coimbatore|Apartments-in-Pollachi-\d/i;

function projectImageKeywords(slug, title) {
  const stop = new Set([
    "apartments",
    "plots",
    "projects",
    "completed",
    "ongoing",
    "senior",
    "living",
    "phase",
    "stepsstone",
  ]);
  const tokens = new Set();
  for (const part of `${slug} ${title}`.toLowerCase().split(/[^a-z0-9]+/)) {
    if (part.length >= 3 && !stop.has(part)) tokens.add(part);
  }
  if (slug.includes("aaero")) tokens.add("aero");
  if (slug.includes("auraa")) {
    tokens.add("auraa");
    tokens.add("aurra");
  }
  return tokens;
}

function imageMatchesProject(url, keywords) {
  const file = url.split("/").pop()?.toLowerCase() ?? "";
  if (STOCK_IMAGE_RE.test(file)) return false;
  return [...keywords].some((k) => file.includes(k));
}

/** WordPress VC galleries store numeric attachment IDs, not URLs. */
function extractAttachmentIds(html) {
  const ids = [];
  const seen = new Set();
  const push = (raw) => {
    for (const part of raw.split(/[,\s]+/)) {
      if (!/^\d+$/.test(part) || seen.has(part)) continue;
      seen.add(part);
      ids.push(part);
    }
  };
  for (const m of html.matchAll(/images=&#8221;([^&#]+?)&#8243;/g)) {
    push(m[1]);
  }
  for (const m of html.matchAll(/images="([^"]+)"/g)) {
    push(m[1]);
  }
  for (const m of html.matchAll(/image_url=&#8221;(\d+)&#8243;/g)) {
    push(m[1]);
  }
  for (const m of html.matchAll(/image_url="(\d+)"/g)) {
    push(m[1]);
  }
  return ids;
}

function loadMediaCache() {
  const cachePath = path.join(ROOT, "scripts/.stepsstone-media-cache.json");
  if (!fs.existsSync(cachePath)) return new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    return new Map(Object.entries(raw));
  } catch {
    return new Map();
  }
}

function saveMediaCache(cache) {
  const cachePath = path.join(ROOT, "scripts/.stepsstone-media-cache.json");
  const obj = Object.fromEntries([...cache.entries()].filter(([, v]) => v));
  fs.writeFileSync(cachePath, JSON.stringify(obj, null, 2), "utf8");
}

async function resolveMediaUrl(id, cache) {
  if (cache.has(id)) return cache.get(id) || null;
  try {
    const res = await fetch(`${WP_MEDIA_API}/${id}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      cache.set(id, null);
      return null;
    }
    const data = await res.json();
    const url =
      data.media_details?.sizes?.full?.source_url ||
      data.media_details?.sizes?.large?.source_url ||
      data.source_url;
    const normalized = normalizeImageUrl(url);
    cache.set(id, normalized);
    return normalized;
  } catch {
    cache.set(id, null);
    return null;
  }
}

async function resolveMediaBatch(ids, cache) {
  const out = [];
  for (let i = 0; i < ids.length; i += MEDIA_FETCH_CONCURRENCY) {
    const chunk = ids.slice(i, i + MEDIA_FETCH_CONCURRENCY);
    const urls = await Promise.all(
      chunk.map((id) => resolveMediaUrl(id, cache))
    );
    out.push(...urls);
  }
  return out;
}

function addUnique(ordered, seen, url) {
  const normalized = normalizeImageUrl(url);
  if (!normalized || seen.has(normalized)) return;
  seen.add(normalized);
  ordered.push(normalized);
}

async function collectImages(post, cache) {
  const html = post.content?.rendered || "";
  const sectionHtml = extractRelevantSections(html);
  const keywords = projectImageKeywords(post.slug, decodeHtml(post.title?.rendered || ""));
  const ordered = [];
  const seen = new Set();

  const og = post.yoast_head_json?.og_image;
  if (Array.isArray(og)) {
    for (const img of og) addUnique(ordered, seen, img?.url);
  }

  if (post.featured_media) {
    const featured = await resolveMediaUrl(String(post.featured_media), cache);
    if (featured) {
      const idx = ordered.indexOf(featured);
      if (idx > 0) {
        ordered.splice(idx, 1);
        ordered.unshift(featured);
      } else if (idx === -1) {
        ordered.unshift(featured);
      }
    }
  }

  const attachmentIds = extractAttachmentIds(sectionHtml);
  const resolved = await resolveMediaBatch(attachmentIds, cache);
  for (const url of resolved) {
    if (url && imageMatchesProject(url, keywords)) addUnique(ordered, seen, url);
  }

  const directRe =
    /https:\/\/stepsstone\.in\/wp-content\/uploads\/[^"'\\s]+?\.(?:jpe?g|png|webp)/gi;
  for (const m of sectionHtml.matchAll(directRe)) {
    const url = m[0];
    if (imageMatchesProject(url, keywords)) addUnique(ordered, seen, url);
  }

  // If filtering removed everything, keep og/featured only
  if (!ordered.length && og?.[0]?.url) addUnique(ordered, seen, og[0].url);

  return ordered.slice(0, MAX_IMAGES_PER_LISTING);
}

function isProjectPost(post) {
  if (post.status !== "publish") return false;
  if ((post.categories || []).includes(BLOG_CATEGORY)) return false;
  if (EXCLUDED_SLUG_RE.test(post.slug || "")) return false;
  const html = post.content?.rendered || "";
  if (html.includes("project-intro")) return true;
  return (
    post.featured_media > 0 &&
    /apartments|plots|senior|palms|aalam|viraam|vatsa|aaero|auraa|enclave|cloud-9|aero-square|elite|laasya|ananthaya|mahathes|artithaa|aksharas|enclave/i.test(
      post.slug
    )
  );
}

function defaultAreaSqft(type, beds) {
  if (type === "Plot") return 2400;
  if (type === "Villa") return 2200;
  return beds >= 3 ? 1450 : beds === 2 ? 1150 : 950;
}

function esc(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function formatListing(l, index) {
  const featured = index < 3 ? "\n    isFeatured: true," : "";
  const imageUrls =
    l.imageUrls.length > 0
      ? `[\n${l.imageUrls.map((u) => `      "${esc(u)}",`).join("\n")}\n    ]`
      : `["${esc(l.image)}"]`;

  return `  withListingDefaults({
    id: "${esc(l.id)}",
    title: "${esc(l.title)}",
    type: "${l.type}",
    city: "${esc(l.city)}",
    address: "${esc(l.address)}",
    beds: ${l.beds},
    baths: ${l.baths},
    balconies: ${l.balconies},
    parkingSpots: ${l.parkingSpots},
    areaSqft: ${l.areaSqft},
    price: ${l.price},
    image: "${esc(l.image)}",
    imageUrls: ${imageUrls},
    description: "${esc(l.description)}",
    ownerName: "${esc(l.ownerName)}",
    ownerEmail: "${esc(l.ownerEmail)}",
    ownerPhone: "${esc(l.ownerPhone)}",
    postedAt: "${l.postedAt}",
    updatedAt: "${l.updatedAt}",${featured}
  })`;
}

async function loadPostsFromLive() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://stepsstone.in/wp-json/wp/v2/posts?per_page=100&page=${page}&status=publish`
    );
    if (!res.ok) throw new Error(`Live API failed: ${res.status}`);
    const batch = await res.json();
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return all.filter(isProjectPost).sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

function loadPostsFromMirror(mirrorRoot) {
  const postsDir = path.join(mirrorRoot, "stepsstone.in/wp-json/wp/v2/posts");
  if (!fs.existsSync(postsDir)) {
    throw new Error(`Posts directory not found: ${postsDir}`);
  }
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(postsDir, f), "utf8")))
    .filter(isProjectPost)
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

async function main() {
  const useLive = process.argv.includes("--live");
  const mirrorArg = process.argv.find(
    (a) => !a.startsWith("-") && a !== process.argv[1] && !a.endsWith(".mjs")
  );

  console.info(
    useLive || !mirrorArg
      ? "Loading posts from https://stepsstone.in (live API)…"
      : `Loading posts from mirror: ${mirrorArg}`
  );

  const posts = useLive
    ? await loadPostsFromLive()
    : loadPostsFromMirror(mirrorArg || path.dirname(DEFAULT_MIRROR.replace(/\/wp-json.*/, "")));

  const mediaCache = loadMediaCache();
  const listings = [];

  for (const [index, post] of posts.entries()) {
    const title = decodeHtml(post.title?.rendered || post.slug);
    const html = post.content?.rendered || "";
    const type = inferType(title, post.slug, post.categories);
    const beds = parseBeds(html, type);
    const { price, priceNote, areaSqft: parsedArea } = parsePriceInfo(html);
    const city = parseCity(title, post.slug, html);
    const imageUrls = await collectImages(post, mediaCache);
    const fallbackImage =
      "https://stepsstone.in/wp-content/uploads/2025/06/Stepsstone-Logo-new.png";
    const image = imageUrls[0] || fallbackImage;
    let description =
      stripVc(html) ||
      `${title} by StepsStone Promoters — premium ${type.toLowerCase()} project in ${city}. Enquire for pricing, floor plans, and site visit.`;
    if (priceNote && !description.includes(priceNote)) {
      description = `${description} Price: ${priceNote}.`;
    }

    listings.push({
      id: `ss-${post.slug}`.slice(0, 64),
      title,
      type,
      city,
      address: parseAddress(title, post.slug, city),
      beds,
      baths: type === "Plot" ? 0 : Math.max(1, beds),
      balconies: type === "Plot" ? 0 : Math.min(2, beds),
      parkingSpots: type === "Plot" ? 0 : 1,
      areaSqft: parsedArea || defaultAreaSqft(type, beds),
      price: price || (type === "Plot" ? 1_500_000 : 3_700_000),
      image,
      imageUrls: imageUrls.length ? imageUrls : [image],
      description,
      ...STEPSSTONE_OWNER,
      postedAt: post.date?.slice(0, 10) || "",
      updatedAt: post.modified?.slice(0, 10) || "",
      _sortIndex: index,
    });

    console.info(`  ${post.slug}: ${imageUrls.length} image(s)`);
  }

  saveMediaCache(mediaCache);

  const outPath = path.join(ROOT, "src/data/stepsstone-listings.generated.ts");
  const body = listings.map((l, i) => formatListing(l, i)).join(",\n");

  const file = `// Auto-generated by scripts/import-stepsstone-listings.mjs — do not edit by hand
import { withListingDefaults } from "@/lib/listing-defaults";
import type { Listing } from "@/types/listing";

/** ${listings.length} projects imported from StepsStone (stepsstone.in) */
export const stepsstoneListings: Listing[] = [
${body},
];
`;

  fs.writeFileSync(outPath, file, "utf8");
  const totalImages = listings.reduce((n, l) => n + l.imageUrls.length, 0);
  console.info(
    `Wrote ${listings.length} listings (${totalImages} images total) to ${outPath}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
