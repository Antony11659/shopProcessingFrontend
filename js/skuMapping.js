const API_URL = "http://localhost:3000";


const shopSelect = document.querySelector("#shopSelect");
const productsList = document.querySelector("#productsList");

const statsCard = document.querySelector("#statsCard");

const ozonCount = document.querySelector("#ozonCount");
const mappedCount = document.querySelector("#mappedCount");
const missingCount = document.querySelector("#missingCount");

const backBtn = document.querySelector("#backBtn");


let perfumes = [];
let currentShopId = null;
let missingProducts = [];


backBtn.addEventListener("click", () => {
  window.location.href = "./products.html";
});


shopSelect.addEventListener("change", () => {

  const shopId = shopSelect.value;

  currentShopId = shopId;


  if (!shopId) {

    statsCard.classList.add("hidden");

    productsList.innerHTML = `
      <div class="empty-state">
        Выберите магазин
      </div>
    `;

    return;
  }


  loadMissingProducts(shopId);
});


async function loadShops() {

  try {

    const response = await fetch(
      `${API_URL}/shops`
    );


    if (!response.ok) {
      throw new Error(
        "Не удалось загрузить магазины"
      );
    }


    const shops = await response.json();


    shopSelect.innerHTML = `
      <option value="">
        Выберите магазин
      </option>

      ${shops.map((shop) => `
        <option value="${shop.id}">
          ${escapeHtml(shop.name)}
        </option>
      `).join("")}
    `;


  } catch (error) {

    productsList.innerHTML = `
      <div class="error-state">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}


async function loadPerfumes() {

  try {

    const response = await fetch(
      `${API_URL}/perfumes`
    );


    if (!response.ok) {
      throw new Error(
        "Не удалось загрузить ароматы"
      );
    }


    perfumes = await response.json();


  } catch (error) {

    console.error(error);

    perfumes = [];
  }
}


async function loadMissingProducts(shopId) {

  productsList.innerHTML = `
    <div class="empty-state">
      Проверяем товары Ozon...
    </div>
  `;

  statsCard.classList.add("hidden");


  try {

    const response = await fetch(
      `${API_URL}/shops/${shopId}/missing-products`
    );


    const result = await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Не удалось проверить SKU"
      );
    }


    missingProducts =
      result.missingProducts ?? [];


    renderStats(result.stats);

    renderProducts(missingProducts);


  } catch (error) {

    productsList.innerHTML = `
      <div class="error-state">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}


function renderStats(stats) {

  ozonCount.textContent =
    stats.ozonProducts;

  mappedCount.textContent =
    stats.mappedProducts;

  missingCount.textContent =
    stats.missingProducts;


  statsCard.classList.remove("hidden");
}


function renderProducts(products) {

  if (!products.length) {

    productsList.innerHTML = `
      <div class="empty-state">
        Все SKU этого магазина привязаны 🎉
      </div>
    `;

    return;
  }


  productsList.innerHTML = products
    .map((product) => `
      <div
        class="product-card"
        data-sku="${escapeHtml(product.sku)}"
      >

        <div class="product-row">

          <div class="product-info">

            <div class="offer-id">
              ${escapeHtml(product.offer_id)}
            </div>

            <div class="sku mobile-sku">
              SKU ${escapeHtml(product.sku)}
            </div>

          </div>


          <div class="sku desktop-sku">
            SKU ${escapeHtml(product.sku)}
          </div>


          <button
            class="map-button"
            type="button"
            data-action="open-map"
            data-sku="${escapeHtml(product.sku)}"
          >
            Привязать
          </button>

        </div>

      </div>
    `)
    .join("");
}


productsList.addEventListener("click", (event) => {

  const button = event.target.closest(
    "[data-action]"
  );


  if (!button) {
    return;
  }


  const action = button.dataset.action;
  const sku = button.dataset.sku;


  if (action === "open-map") {
    openMappingForm(sku);
  }


  if (action === "cancel-map") {
    closeMappingForm(sku);
  }

});


function openMappingForm(sku) {

  const product = missingProducts.find(
    (item) => String(item.sku) === String(sku)
  );


  if (!product) {
    return;
  }


  const card = getProductCard(sku);


  if (!card) {
    return;
  }


  // Close another open form first
  document
    .querySelectorAll(".mapping-form")
    .forEach((form) => form.remove());


  const form = document.createElement("div");

  form.className = "mapping-form";


  form.innerHTML = `
    <div class="mapping-header">

      <div>
        <strong>Привязать SKU</strong>

        <span>
          ${escapeHtml(product.offer_id)}
        </span>
      </div>

      <button
        class="close-button"
        type="button"
        data-action="cancel-map"
        data-sku="${escapeHtml(product.sku)}"
      >
        ×
      </button>

    </div>


    <form
      class="sku-map-form"
      data-sku="${escapeHtml(product.sku)}"
    >

      <div class="field perfume-field">

        <label>
          Аромат
        </label>

        <input
          class="perfume-search"
          type="text"
          placeholder="Начните вводить название..."
          autocomplete="off"
        >

        <input
          class="selected-perfume-id"
          type="hidden"
        >

        <div class="perfume-results hidden"></div>

        <div class="selected-perfume hidden"></div>

      </div>


      <div class="field">

        <label>
          Объём
        </label>

        <select
          class="volume-select"
          disabled
        >
          <option value="">
            Сначала выберите аромат
          </option>
        </select>

      </div>


      <div class="mapping-actions">

        <button
          class="secondary-button"
          type="button"
          data-action="cancel-map"
          data-sku="${escapeHtml(product.sku)}"
        >
          Отмена
        </button>

        <button
          class="primary-button"
          type="submit"
          disabled
        >
          Привязать
        </button>

      </div>


      <div class="form-message"></div>

    </form>
  `;


  card.appendChild(form);


  setupMappingForm(
    form,
    product
  );


  form
    .querySelector(".perfume-search")
    .focus();
}


function setupMappingForm(
  container,
  product
) {

  const form =
    container.querySelector(".sku-map-form");

  const searchInput =
    container.querySelector(".perfume-search");

  const perfumeIdInput =
    container.querySelector(".selected-perfume-id");

  const results =
    container.querySelector(".perfume-results");

  const selectedPerfume =
    container.querySelector(".selected-perfume");

  const volumeSelect =
    container.querySelector(".volume-select");

  const submitButton =
    container.querySelector(".primary-button");

  const message =
    container.querySelector(".form-message");


  searchInput.addEventListener("input", () => {

    const query =
      searchInput.value
        .trim()
        .toLowerCase();


    clearSelectedPerfume(
      perfumeIdInput,
      selectedPerfume,
      volumeSelect,
      submitButton
    );


    if (!query) {

      results.classList.add("hidden");

      results.innerHTML = "";

      return;
    }


    const filtered = perfumes
      .filter((perfume) => {

        const name =
          perfume.name?.toLowerCase() ?? "";

        const brand =
          perfume.brand?.name?.toLowerCase() ?? "";


        return (
          name.includes(query) ||
          brand.includes(query)
        );

      })
      .slice(0, 10);


    renderPerfumeResults(
      filtered,
      results
    );

  });


  results.addEventListener("click", (event) => {

    const option = event.target.closest(
      "[data-perfume-id]"
    );


    if (!option) {
      return;
    }


    const perfumeId =
      Number(option.dataset.perfumeId);


    const perfume = perfumes.find(
      (item) => Number(item.id) === perfumeId
    );


    if (!perfume) {
      return;
    }


    selectPerfume({
      perfume,
      perfumeIdInput,
      searchInput,
      results,
      selectedPerfume,
      volumeSelect,
      submitButton,
    });

  });


  form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const perfumeId =
      perfumeIdInput.value;

    const volume =
      volumeSelect.value;


    if (!perfumeId || !volume) {
      return;
    }


    submitButton.disabled = true;
    submitButton.textContent = "Сохраняем...";

    message.textContent = "";
    message.className = "form-message";


    try {

      const response = await fetch(
        `${API_URL}/perfumes/${perfumeId}/shop-products`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            shop_id: currentShopId,
            volume_ml: Number(volume),
            sku: String(product.sku),
          }),
        }
      );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          "Не удалось привязать SKU"
        );
      }


      removeMappedProduct(
        product.sku
      );


    } catch (error) {

      message.textContent =
        error.message;

      message.className =
        "form-message error-message";

      submitButton.disabled = false;
      submitButton.textContent = "Привязать";
    }

  });

}


function renderPerfumeResults(
  filtered,
  container
) {

  if (!filtered.length) {

    container.innerHTML = `
      <div class="no-results">
        Аромат не найден
      </div>
    `;

    container.classList.remove("hidden");

    return;
  }


  container.innerHTML = filtered
    .map((perfume) => `
      <button
        class="perfume-option"
        type="button"
        data-perfume-id="${perfume.id}"
      >

        <strong>
          ${escapeHtml(perfume.name)}
        </strong>

        <span>
          ${escapeHtml(
            perfume.brand?.name ?? "Без бренда"
          )}
        </span>

      </button>
    `)
    .join("");


  container.classList.remove("hidden");
}


function selectPerfume({
  perfume,
  perfumeIdInput,
  searchInput,
  results,
  selectedPerfume,
  volumeSelect,
  submitButton,
}) {

  perfumeIdInput.value =
    perfume.id;


  searchInput.value = "";


  results.innerHTML = "";
  results.classList.add("hidden");


  selectedPerfume.innerHTML = `
    <strong>
      ${escapeHtml(perfume.name)}
    </strong>

    <span>
      ${escapeHtml(
        perfume.brand?.name ?? "Без бренда"
      )}
    </span>
  `;


  selectedPerfume.classList.remove("hidden");


  const variants = [
    ...(perfume.variants ?? [])
  ].sort(
    (a, b) =>
      a.volume_ml - b.volume_ml
  );


  volumeSelect.innerHTML = `
    <option value="">
      Выберите объём
    </option>

    ${variants.map((variant) => `
      <option value="${variant.volume_ml}">
        ${variant.volume_ml} мл
      </option>
    `).join("")}
  `;


  volumeSelect.disabled = false;


  volumeSelect.onchange = () => {

    submitButton.disabled =
      !volumeSelect.value;

  };

}


function clearSelectedPerfume(
  perfumeIdInput,
  selectedPerfume,
  volumeSelect,
  submitButton
) {

  perfumeIdInput.value = "";


  selectedPerfume.innerHTML = "";
  selectedPerfume.classList.add("hidden");


  volumeSelect.innerHTML = `
    <option value="">
      Сначала выберите аромат
    </option>
  `;


  volumeSelect.disabled = true;
  submitButton.disabled = true;
}


function closeMappingForm(sku) {

  const card =
    getProductCard(sku);


  card
    ?.querySelector(".mapping-form")
    ?.remove();
}


function getProductCard(sku) {

  return [...document.querySelectorAll(
    ".product-card"
  )].find(
    (card) =>
      String(card.dataset.sku) ===
      String(sku)
  );
}


function removeMappedProduct(sku) {

  missingProducts =
    missingProducts.filter(
      (product) =>
        String(product.sku) !==
        String(sku)
    );


  const card =
    getProductCard(sku);


  if (card) {

    card.classList.add(
      "product-mapped"
    );


    setTimeout(() => {
      card.remove();
    }, 250);
  }


  missingCount.textContent =
    missingProducts.length;


  const mapped =
    Number(mappedCount.textContent) || 0;

  mappedCount.textContent =
    mapped + 1;


  if (!missingProducts.length) {

    setTimeout(() => {

      productsList.innerHTML = `
        <div class="empty-state">
          Все SKU этого магазина привязаны 🎉
        </div>
      `;

    }, 300);
  }
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


async function init() {

  await Promise.all([
    loadShops(),
    loadPerfumes(),
  ]);

}


init();