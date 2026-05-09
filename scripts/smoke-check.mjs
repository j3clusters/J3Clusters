const base = "http://localhost:3000";

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
  try {
    listingCount = (JSON.parse(listings.bodyText).items ?? []).length;
  } catch {
    listingCount = 0;
  }
  results.push(`GET /api/listings => ${listings.status} (items=${listingCount})`);

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
    }),
  });
  results.push(`POST /api/register => ${register.status}`);

  const userCookie = register.headers["set-cookie"] ?? "";
  const imageBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2m8l8AAAAASUVORK5CYII=",
    "base64"
  );
  const form = new FormData();
  form.append("ownerName", "Smoke Owner");
  form.append("ownerEmail", smokeEmail);
  form.append("ownerPhone", "1234567890");
  form.append("type", "Apartment");
  form.append("address", "Test Address 123");
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
    "This is a valid smoke-test property description."
  );
  form.append("images", new Blob([imageBytes], { type: "image/png" }), "smoke-test.png");

  const submission = await fetch(`${base}/api/submissions`, {
    method: "POST",
    headers: userCookie ? { cookie: userCookie } : {},
    body: form,
  });
  results.push(`POST /api/submissions => ${submission.status}`);

  const adminLogin = await jsonRequest("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "j3clusters-admin@localhost",
      password: "ChangeMe_Dashboard_2026",
    }),
  });
  results.push(`POST /api/auth/login => ${adminLogin.status}`);

  results.push(`SMOKE_EMAIL=${smokeEmail}`);
  console.log(results.join("\n"));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
