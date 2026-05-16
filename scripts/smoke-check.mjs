/**
 * API smoke checks. Requires a running server (dev or production).
 *
 *   SMOKE_BASE_URL=http://localhost:3003 node scripts/smoke-check.mjs
 *
 * Admin login step uses ADMIN_EMAIL + ADMIN_PASSWORD from the environment
 * (same as seed). If unset, that step is reported as SKIP.
 */

const base = (process.env.SMOKE_BASE_URL || "http://localhost:3003").replace(
  /\/$/,
  "",
);

const ts = Date.now();
const smokeEmail = `smoketest${ts}@example.com`;
const smokePassword = "TestPass123!";

const jsonRequest = async (url, options = {}) => {
  const response = await fetch(`${base}${url}`, options);
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch {
    bodyText = "";
  }

  const headers = Object.fromEntries(response.headers.entries());
  return { status: response.status, bodyText, headers };
};

const main = async () => {
  const results = [];

  const listings = await jsonRequest("/api/listings");
  let listingCount = 0;
  let firstListingId = "";
  try {
    const parsed = JSON.parse(listings.bodyText);
    const items = parsed.items ?? [];
    listingCount = items.length;
    firstListingId = items[0]?.id ?? "";
  } catch {
    listingCount = 0;
  }
  results.push(`GET /api/listings => ${listings.status} (items=${listingCount})`);

  if (firstListingId) {
    const one = await jsonRequest(`/api/listings/${firstListingId}`);
    results.push(`GET /api/listings/${firstListingId} => ${one.status}`);
    const propPage = await fetch(`${base}/property/${firstListingId}`, {
      redirect: "manual",
    });
    results.push(`GET /property/${firstListingId} => ${propPage.status}`);
  } else {
    results.push("GET /api/listings/[id] => SKIP (no listings)");
  }

  const listingsRent = await jsonRequest("/api/listings?mode=rent");
  results.push(`GET /api/listings?mode=rent => ${listingsRent.status}`);

  const lead = await jsonRequest("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test",
      phone: "1234567890",
      email: smokeEmail,
      message: "Connectivity smoke test",
    }),
  });
  results.push(`POST /api/leads => ${lead.status}`);

  const register = await jsonRequest("/api/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Tester",
      phone: "1234567890",
      email: smokeEmail,
      city: "Dubai",
      password: smokePassword,
      confirmPassword: smokePassword,
      accountRole: "CONSULTANT",
    }),
  });
  results.push(`POST /api/register => ${register.status}`);

  const setCookie = register.headers["set-cookie"];
  const userCookie = Array.isArray(setCookie)
    ? setCookie.join("; ")
    : (setCookie ?? "");

  const imageBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2m8l8AAAAASUVORK5CYII=",
    "base64",
  );
  const form = new FormData();
  form.append("ownerName", "Smoke Owner");
  form.append("ownerEmail", smokeEmail);
  form.append("ownerPhone", "1234567890");
  form.append("purpose", "Sale");
  form.append("type", "Apartment");
  form.append("address", "Test Address 123 Main Street");
  form.append("city", "Dubai");
  form.append("areaSqft", "750");
  form.append("bedrooms", "1");
  form.append("bathrooms", "1");
  form.append("balconies", "0");
  form.append("parkingSpots", "1");
  form.append("furnishing", "Furnished");
  form.append("propertyAgeYears", "2");
  form.append("availableFrom", "2026-05-10");
  form.append("legalClearance", "on");
  form.append("price", "1200000");
  form.append(
    "description",
    "This is a valid smoke-test property description for submission.",
  );
  form.append(
    "images",
    new Blob([imageBytes], { type: "image/png" }),
    "smoke-test.png",
  );

  const submission = await fetch(`${base}/api/submissions`, {
    method: "POST",
    headers: userCookie ? { cookie: userCookie } : {},
    body: form,
  });
  results.push(`POST /api/submissions => ${submission.status}`);

  const userLogin = await jsonRequest("/api/auth/user-login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: smokeEmail,
      password: smokePassword,
    }),
  });
  results.push(`POST /api/auth/user-login => ${userLogin.status}`);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const adminLogin = await jsonRequest("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });
    results.push(`POST /api/auth/login => ${adminLogin.status}`);
  } else {
    results.push("POST /api/auth/login => SKIP (set ADMIN_EMAIL and ADMIN_PASSWORD)");
  }

  results.push(`SMOKE_EMAIL=${smokeEmail}`);

  const pageChecks = [
    ["/", "GET /"],
    ["/listings", "GET /listings"],
    ["/listings/buy", "GET /listings/buy"],
    ["/listings/rent", "GET /listings/rent"],
    ["/login", "GET /login"],
    ["/register", "GET /register"],
    ["/register/consultant", "GET /register/consultant"],
    ["/register/member", "GET /register/member"],
    ["/community/consultant", "GET /community/consultant"],
    ["/community/member", "GET /community/member"],
    ["/contact", "GET /contact"],
    ["/about", "GET /about"],
    ["/faq", "GET /faq"],
    ["/privacy", "GET /privacy"],
    ["/terms", "GET /terms"],
    ["/forgot-password", "GET /forgot-password"],
    ["/reset-password?token=x", "GET /reset-password"],
    ["/post-property", "GET /post-property (expect 307/308 if unauthenticated)"],
    ["/my-properties", "GET /my-properties (expect 307/308 if unauthenticated)"],
    ["/admin", "GET /admin (expect 307/308 if unauthenticated)"],
    ["/admin/login", "GET /admin/login"],
  ];
  for (const [path, label] of pageChecks) {
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    results.push(`${label} => ${res.status}`);
  }

  console.log(results.join("\n"));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
