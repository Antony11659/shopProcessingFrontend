const productsList = document.querySelector("#productsList");
const productCount = document.querySelector("#productCount");
const productSearch = document.querySelector("#productSearch");
const addProductBtn = document.querySelector("#addProductBtn");

// Change this if your backend URL is different.
const API_URL = "http://localhost:3000";

let perfumes = [];

function openPerfume(perfumeId) {
  window.location.href = `./editProduct.html?id=${perfumeId}`;
}


async function loadPerfumes() {
  try {
    showLoading();

    const response = await fetch(`${API_URL}/perfumes`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    perfumes = await response.json();

    renderPerfumes(perfumes);

  } catch (error) {
    console.error("Failed to load perfumes:", error);

    productsList.innerHTML = `
      <div class="empty-state">
        Не удалось загрузить ароматы.
      </div>
    `;

    productCount.textContent = "0 ароматов";
  }
}


function renderPerfumes(items) {
  productCount.textContent = `${items.length} ароматов`;

  if (items.length === 0) {
    productsList.innerHTML = `
      <div class="empty-state">
        Ароматы не найдены.
      </div>
    `;

    return;
  }

  productsList.innerHTML = items
    .map(createPerfumeCard)
    .join("");
}


function createPerfumeCard(perfume) {
  const brandName = perfume.brand?.name ?? "Без бренда";

  const volumes = (perfume.variants ?? [])
    .map((variant) => variant.volume_ml)
    .join(" / ");

  const primaryImage =
    perfume.images?.find((image) => image.is_primary) ??
    perfume.images?.[0];

  return `
    <article
      class="product-card"
      data-perfume-id="${perfume.id}"
      onclick="openPerfume(${perfume.id})"
    >
      <div class="product-image">
        ${
          primaryImage
            ? `
              <img
                src="${primaryImage.image_url}"
                alt="${perfume.name}"
              >
            `
            : `
              <div class="product-image-placeholder">
                Нет фото
              </div>
            `
        }
      </div>

      <div class="product-info">
        <div class="product-brand">
          ${brandName}
        </div>

        <h3 class="product-name">
          ${perfume.name}
        </h3>

        <div class="product-meta">
          <span>
            ${perfume.gender ?? "—"}
          </span>

          <span>
            ${perfume.fragrance_family ?? "—"}
          </span>
        </div>

        <div class="product-volumes">
          ${volumes ? `${volumes} мл` : "Нет объёмов"}
        </div>
      </div>
    </article>
  `;
}


function showLoading() {
  productsList.innerHTML = `
    <div class="empty-state">
      Загружаем ароматы...
    </div>
  `;
}


function searchPerfumes(searchValue) {
  const query = searchValue
    .trim()
    .toLowerCase();

  if (!query) {
    renderPerfumes(perfumes);
    return;
  }

  const filteredPerfumes = perfumes.filter((perfume) => {
    const name = perfume.name?.toLowerCase() ?? "";
    const brand = perfume.brand?.name?.toLowerCase() ?? "";

    return (
      name.includes(query) ||
      brand.includes(query)
    );
  });

  renderPerfumes(filteredPerfumes);
}


productSearch.addEventListener("input", (event) => {
  searchPerfumes(event.target.value);
});


addProductBtn.addEventListener("click", () => {
  window.location.href = "./addProduct.html";
});


loadPerfumes();