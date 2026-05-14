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

function getQueryDefaults() {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get("type") || "",
    city: params.get("city") || "",
    maxBudget: params.get("budget")?.split("-")[1] || "",
  };
}

const grid = document.getElementById("listing-grid");
const resultCount = document.getElementById("result-count");
const typeFilter = document.getElementById("type-filter");
const cityFilter = document.getElementById("city-filter");
const budgetFilter = document.getElementById("budget-filter");
const applyFilters = document.getElementById("apply-filters");

const defaults = getQueryDefaults();
typeFilter.value = defaults.type;
cityFilter.value = defaults.city;
budgetFilter.value = defaults.maxBudget;

function render() {
  const type = typeFilter.value.trim().toLowerCase();
  const city = cityFilter.value.trim().toLowerCase();
  const budget = Number(budgetFilter.value || "0");

  const filtered = listings.filter((item) => {
    const typeOk = !type || item.type.toLowerCase() === type;
    const cityOk = !city || item.city.toLowerCase().includes(city);
    const budgetOk = !budget || item.price <= budget;
    return typeOk && cityOk && budgetOk;
  });

  grid.innerHTML = filtered.map(listingCard).join("");
  resultCount.textContent = `${filtered.length} properties found`;
}

render();
applyFilters.addEventListener("click", render);
