function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function listingCard(item) {
  return `
    <article class="card">
      <img src="${item.image}" alt="${item.title}" />
      <div class="card-body">
        <h3>${item.title}</h3>
        <p class="price">${formatPrice(item.price)}</p>
        <p class="meta">${item.city} • ${item.type} • ${item.areaSqft} sqft</p>
        <a href="./property.html?id=${item.id}">View details</a>
      </div>
    </article>
  `;
}

const featured = listings.slice(0, 3);
const container = document.getElementById("featured-listings");

if (container) {
  container.innerHTML = featured.map(listingCard).join("");
}
