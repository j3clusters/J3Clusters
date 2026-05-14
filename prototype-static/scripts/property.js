function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPropertyId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

const id = getPropertyId();
const item = listings.find((entry) => entry.id === id);
const container = document.getElementById("property-container");

if (!item) {
  container.innerHTML = `
    <h1>Property not found</h1>
    <p>Please check the listing link again.</p>
    <a href="./listings.html">Back to listings</a>
  `;
} else {
  container.innerHTML = `
    <article class="card">
      <img src="${item.image}" alt="${item.title}" />
      <div class="card-body">
        <h1>${item.title}</h1>
        <p class="price">${formatPrice(item.price)}</p>
        <p class="meta">${item.city} • ${item.type}</p>
        <p>${item.description}</p>
        <p><strong>Area:</strong> ${item.areaSqft} sqft</p>
        <p><strong>Bedrooms:</strong> ${item.beds || "N/A"}</p>
        <p><strong>Bathrooms:</strong> ${item.baths || "N/A"}</p>
        <a href="./contact.html">Request callback</a>
      </div>
    </article>
  `;
}
