const API_URL = window.API_URL;

const params =
  new URLSearchParams(window.location.search);

const isPrintingMode =
  params.get("mode") === "printing";


const shopSelect =
  document.querySelector("#shopSelect");

const productsList =
  document.querySelector("#productsList");

const statsCard =
  document.querySelector("#statsCard");

const ozonCount =
  document.querySelector("#ozonCount");

const mappedCount =
  document.querySelector("#mappedCount");

const missingCount =
  document.querySelector("#missingCount");

const backBtn =
  document.querySelector("#backBtn");


let perfumes = [];
let brands = [];
let shops = [];

let currentShopId = null;
let missingProducts = [];


const STANDARD_VOLUMES = [
  1,
  3,
  5,
  10,
  20,
  30,
  50,
];


/* =====================================================
   BACK
===================================================== */

backBtn.addEventListener("click", () => {
  window.location.href = "./products.html";
});


/* =====================================================
   SHOP CHANGE
===================================================== */

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


/* =====================================================
   LOAD SHOPS
===================================================== */

async function loadShops() {

  try {

    shopSelect.disabled = true;

    shopSelect.innerHTML = `
      <option value="">
        Загружаем магазины...
      </option>
    `;


    const response = await fetch(
      `${API_URL}/shops`
    );


    if (!response.ok) {

      const result = await response
        .json()
        .catch(() => null);


      throw new Error(
        result?.message ||
        "Не удалось загрузить магазины"
      );
    }


    shops = await response.json();


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


    shopSelect.disabled = false;

    return true;

  } catch (error) {

    console.error(
      "LOAD SHOPS ERROR:",
      error
    );


    shopSelect.innerHTML = `
      <option value="">
        Ошибка загрузки магазинов
      </option>
    `;


    shopSelect.disabled = true;


    productsList.innerHTML = `
      <div class="error-state">
        ${escapeHtml(error.message)}
      </div>
    `;

    return false;
  }
}


/* =====================================================
   CURRENT SESSION UNKNOWN PRODUCTS
===================================================== */

async function loadPrintingProducts() {

  productsList.innerHTML = `
    <div class="empty-state">
      Проверяем SKU текущей партии...
    </div>
  `;


  document.querySelector(
    ".section-header h2"
  ).textContent =
    "Неизвестные SKU текущей партии";


  try {

    const response = await fetch(
      `${API_URL}/ozon/print-sticking-labels`
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Не удалось проверить SKU текущей партии"
      );
    }


    if (
      !Array.isArray(
        result.unknownProducts
      )
    ) {

      throw new Error(
        "Не удалось получить неизвестные SKU текущей партии"
      );
    }


    missingProducts =
      result.unknownProducts;


    renderProducts(
      missingProducts
    );


  } catch (error) {

    console.error(
      "LOAD PRINTING PRODUCTS ERROR:",
      error
    );


    productsList.innerHTML = `
      <div class="error-state">
        ${escapeHtml(error.message)}
      </div>

      <button
        class="secondary-button"
        type="button"
        data-action="retry-printing"
      >
        Повторить проверку
      </button>
    `;
  }
}


/* =====================================================
   RESOLVE PRODUCT SHOP
===================================================== */

function resolveProductShopId(product) {

  if (!isPrintingMode) {
    return currentShopId;
  }


  const shop =
    shops.find(
      (item) =>
        item.code === product.shop
    );


  if (!shop?.id) {

    throw new Error(
      `Не удалось найти магазин для кода «${product.shop ?? ""}». SKU не привязан.`
    );
  }


  return shop.id;
}


/* =====================================================
   LOAD PERFUMES
===================================================== */

async function loadPerfumes() {

  try {

    const response = await fetch(
      `${API_URL}/perfumes`
    );


    if (!response.ok) {

      const result = await response
        .json()
        .catch(() => null);


      throw new Error(
        result?.message ||
        "Не удалось загрузить ароматы"
      );
    }


    perfumes =
      await response.json();


    return perfumes;


  } catch (error) {

    console.error(
      "LOAD PERFUMES ERROR:",
      error
    );


    perfumes = [];


    throw error;
  }
}


/* =====================================================
   LOAD BRANDS
===================================================== */

async function loadBrands() {

  try {

    const response = await fetch(
      `${API_URL}/brands`
    );


    if (!response.ok) {

      const result = await response
        .json()
        .catch(() => null);


      throw new Error(
        result?.message ||
        "Не удалось загрузить бренды"
      );
    }


    brands =
      await response.json();


    return brands;


  } catch (error) {

    console.error(
      "LOAD BRANDS ERROR:",
      error
    );


    brands = [];


    throw error;
  }
}


/* =====================================================
   LOAD MISSING PRODUCTS
===================================================== */

async function loadMissingProducts(shopId) {

  productsList.innerHTML = `
    <div class="empty-state">
      Проверяем товары Ozon...
    </div>
  `;


  statsCard.classList.add(
    "hidden"
  );


  try {

    const response = await fetch(
      `${API_URL}/shops/${shopId}/missing-products`
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Не удалось проверить SKU"
      );
    }


    missingProducts =
      result.missingProducts ?? [];


    renderStats(
      result.stats
    );


    renderProducts(
      missingProducts
    );


  } catch (error) {

    console.error(
      "LOAD MISSING PRODUCTS ERROR:",
      error
    );


    productsList.innerHTML = `
      <div class="error-state">
        ${escapeHtml(error.message)}
      </div>
    `;
  }
}


/* =====================================================
   STATS
===================================================== */

function renderStats(stats) {

  ozonCount.textContent =
    stats?.ozonProducts ?? 0;


  mappedCount.textContent =
    stats?.mappedProducts ?? 0;


  missingCount.textContent =
    stats?.missingProducts ?? 0;


  statsCard.classList.remove(
    "hidden"
  );
}


/* =====================================================
   PRODUCT LIST
===================================================== */

function renderProducts(products) {

  if (isPrintingMode) {

    document.querySelector(
      ".section-header h2"
    ).textContent =
      `Неизвестные SKU текущей партии: ${products.length}`;
  }


  if (!products.length) {

    if (isPrintingMode) {

      productsList.innerHTML = `
        <div class="empty-state">
          <strong>
            ✓ Все SKU текущей партии привязаны
          </strong>

          <p>
            Партия готова к печати.
          </p>

          <button
            class="primary-button"
            type="button"
            data-action="start-printing"
          >
            🖨️ НАЧАТЬ ПЕЧАТЬ
          </button>
        </div>
      `;

      return;
    }


    productsList.innerHTML = `
      <div class="empty-state">
        Все SKU этого магазина привязаны 🎉
      </div>
    `;

    return;
  }


  productsList.innerHTML =
    products
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

              ${isPrintingMode ? `
                <div>
                  Магазин:
                  ${escapeHtml(
                    shops.find(
                      (shop) =>
                        shop.code === product.shop
                    )?.name ??
                    product.shop ??
                    "Код не указан"
                  )}

                  ${
                    product.quantity != null
                      ? ` · Количество: ${escapeHtml(product.quantity)}`
                      : ""
                  }
                </div>
              ` : ""}

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


/* =====================================================
   GLOBAL CLICK HANDLER
===================================================== */

productsList.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        "[data-action]"
      );


    if (!button) {
      return;
    }


    const action =
      button.dataset.action;


    /* -------------------------------------------------
       RETRY PRINTING CHECK
    ------------------------------------------------- */

    if (
      isPrintingMode &&
      action === "retry-printing"
    ) {

      await loadPrintingProducts();

      return;
    }


    /* -------------------------------------------------
       START PRINTING
    ------------------------------------------------- */

    if (
      isPrintingMode &&
      action === "start-printing"
    ) {

      window.location.href =
        "http://127.0.0.1:3000/print.html";

      return;
    }


    const sku =
      button.dataset.sku;


    if (action === "open-map") {

      await openMappingForm(sku);

      return;
    }


    if (action === "cancel-map") {

      closeMappingForm(sku);

      return;
    }


    if (
      action ===
      "show-create-perfume"
    ) {

      showCreatePerfumeForm(sku);

      return;
    }


    if (
      action ===
      "cancel-create-perfume"
    ) {

      hideCreatePerfumeForm(sku);

      return;
    }


    if (
      action ===
      "show-create-brand"
    ) {

      showCreateBrandForm(sku);

      return;
    }


    if (
      action ===
      "cancel-create-brand"
    ) {

      hideCreateBrandForm(sku);

      return;
    }

  }
);


/* =====================================================
   OPEN MAPPING FORM
===================================================== */

async function openMappingForm(sku) {

  const product =
    missingProducts.find(
      (item) =>
        String(item.sku) ===
        String(sku)
    );


  if (!product) {
    return;
  }


  const card =
    getProductCard(sku);


  if (!card) {
    return;
  }


  document
    .querySelectorAll(
      ".mapping-form"
    )
    .forEach(
      (form) =>
        form.remove()
    );


  const originalButton =
    card.querySelector(
      '[data-action="open-map"]'
    );


  if (originalButton) {

    originalButton.disabled =
      true;

    originalButton.textContent =
      "Загрузка...";
  }


  try {

    const requests = [];


    if (!perfumes.length) {

      requests.push(
        loadPerfumes()
      );
    }


    if (!brands.length) {

      requests.push(
        loadBrands()
      );
    }


    if (requests.length) {

      await Promise.all(
        requests
      );
    }


  } catch (error) {

    if (originalButton) {

      originalButton.disabled =
        false;

      originalButton.textContent =
        "Привязать";
    }


    alert(
      error.message
    );

    return;
  }


  if (originalButton) {

    originalButton.disabled =
      false;

    originalButton.textContent =
      "Привязать";
  }


  const mappingContainer =
    document.createElement(
      "div"
    );


  mappingContainer.className =
    "mapping-form";


  mappingContainer.innerHTML = `
    <div class="mapping-header">

      <div>

        <strong>
          Привязать SKU
        </strong>

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


        <div
          class="perfume-results hidden"
        ></div>


        <div
          class="selected-perfume hidden"
        ></div>

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
          data-action="show-create-perfume"
          data-sku="${escapeHtml(product.sku)}"
        >
          + Создать новый аромат
        </button>


        <button
          class="secondary-button"
          type="button"
          data-action="cancel-map"
          data-sku="${escapeHtml(product.sku)}"
        >
          Отмена
        </button>


        <button
          class="primary-button map-submit-button"
          type="submit"
          disabled
        >
          Привязать
        </button>

      </div>


      <div class="form-message"></div>

    </form>


    <div
      class="create-perfume-container hidden"
    ></div>
  `;


  card.appendChild(
    mappingContainer
  );


  setupMappingForm(
    mappingContainer,
    product
  );


  mappingContainer
    .querySelector(
      ".perfume-search"
    )
    .focus();
}


/* =====================================================
   EXISTING PERFUME MAPPING
===================================================== */

function setupMappingForm(
  container,
  product
) {

  const form =
    container.querySelector(
      ".sku-map-form"
    );


  const searchInput =
    container.querySelector(
      ".perfume-search"
    );


  const perfumeIdInput =
    container.querySelector(
      ".selected-perfume-id"
    );


  const results =
    container.querySelector(
      ".perfume-results"
    );


  const selectedPerfume =
    container.querySelector(
      ".selected-perfume"
    );


  const volumeSelect =
    container.querySelector(
      ".volume-select"
    );


  const submitButton =
    container.querySelector(
      ".map-submit-button"
    );


  const message =
    container.querySelector(
      ".form-message"
    );


  searchInput.addEventListener(
    "input",
    () => {

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

        results.classList.add(
          "hidden"
        );

        results.innerHTML = "";

        return;
      }


      const filtered =
        perfumes
          .filter(
            (perfume) => {

              const name =
                perfume.name
                  ?.toLowerCase() ??
                "";


              const brand =
                perfume.brand
                  ?.name
                  ?.toLowerCase() ??
                "";


              return (
                name.includes(query) ||
                brand.includes(query)
              );

            }
          )
          .slice(
            0,
            10
          );


      renderPerfumeResults(
        filtered,
        results,
        product
      );

    }
  );


  results.addEventListener(
    "click",
    (event) => {

      const option =
        event.target.closest(
          "[data-perfume-id]"
        );


      if (!option) {
        return;
      }


      const perfumeId =
        Number(
          option.dataset.perfumeId
        );


      const perfume =
        perfumes.find(
          (item) =>
            Number(item.id) ===
            perfumeId
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

    }
  );


  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const perfumeId =
        perfumeIdInput.value;


      const volume =
        volumeSelect.value;


      if (
        !perfumeId ||
        !volume
      ) {
        return;
      }


      submitButton.disabled =
        true;


      submitButton.textContent =
        "Сохраняем...";


      message.textContent = "";

      message.className =
        "form-message";


      try {

        await createShopProduct({
          perfumeId,

          shopId:
            resolveProductShopId(
              product
            ),

          volume:
            Number(volume),

          sku:
            product.sku,
        });


        await removeMappedProduct(
          product.sku
        );


      } catch (error) {

        message.textContent =
          error.message;


        message.className =
          "form-message error-message";


        submitButton.disabled =
          false;


        submitButton.textContent =
          "Привязать";
      }

    }
  );
}


/* =====================================================
   PERFUME SEARCH RESULTS
===================================================== */

function renderPerfumeResults(
  filtered,
  container,
  product
) {

  if (!filtered.length) {

    container.innerHTML = `
      <div class="no-results">

        <div>
          Аромат не найден
        </div>


        <button
          class="create-from-search-button"
          type="button"
          data-action="show-create-perfume"
          data-sku="${escapeHtml(product.sku)}"
        >
          + Создать новый аромат
        </button>

      </div>
    `;


    container.classList.remove(
      "hidden"
    );


    return;
  }


  container.innerHTML =
    filtered
      .map(
        (perfume) => `
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
                perfume.brand?.name ??
                "Без бренда"
              )}
            </span>

          </button>
        `
      )
      .join("");


  container.classList.remove(
    "hidden"
  );
}


/* =====================================================
   SELECT PERFUME
===================================================== */

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

  results.classList.add(
    "hidden"
  );


  selectedPerfume.innerHTML = `
    <strong>
      ${escapeHtml(perfume.name)}
    </strong>

    <span>
      ${escapeHtml(
        perfume.brand?.name ??
        "Без бренда"
      )}
    </span>
  `;


  selectedPerfume.classList.remove(
    "hidden"
  );


  const variants = [
    ...(perfume.variants ?? [])
  ].sort(
    (a, b) =>
      a.volume_ml -
      b.volume_ml
  );


  volumeSelect.innerHTML = `
    <option value="">
      Выберите объём
    </option>

    ${variants
      .map(
        (variant) => `
          <option value="${variant.volume_ml}">
            ${variant.volume_ml} мл
          </option>
        `
      )
      .join("")}
  `;


  volumeSelect.disabled =
    false;


  volumeSelect.onchange =
    () => {

      submitButton.disabled =
        !volumeSelect.value;

    };
}


/* =====================================================
   CLEAR SELECTED PERFUME
===================================================== */

function clearSelectedPerfume(
  perfumeIdInput,
  selectedPerfume,
  volumeSelect,
  submitButton
) {

  perfumeIdInput.value = "";


  selectedPerfume.innerHTML =
    "";


  selectedPerfume.classList.add(
    "hidden"
  );


  volumeSelect.innerHTML = `
    <option value="">
      Сначала выберите аромат
    </option>
  `;


  volumeSelect.disabled =
    true;

  submitButton.disabled =
    true;
}


/* =====================================================
   CREATE PERFUME FORM
===================================================== */

function showCreatePerfumeForm(
  sku
) {

  const product =
    missingProducts.find(
      (item) =>
        String(item.sku) ===
        String(sku)
    );


  const card =
    getProductCard(sku);


  if (
    !product ||
    !card
  ) {
    return;
  }


  const mappingForm =
    card.querySelector(
      ".mapping-form"
    );


  if (!mappingForm) {
    return;
  }


  const searchResults =
    mappingForm.querySelector(
      ".perfume-results"
    );


  searchResults?.classList.add(
    "hidden"
  );


  const container =
    mappingForm.querySelector(
      ".create-perfume-container"
    );


  container.classList.remove(
    "hidden"
  );


  container.innerHTML = `
    <div class="create-perfume-box">

      <div class="create-perfume-header">

        <div>

          <strong>
            Новый аромат
          </strong>

          <span>
            Ozon:
            ${escapeHtml(product.offer_id)}
          </span>

        </div>


        <button
          class="close-button"
          type="button"
          data-action="cancel-create-perfume"
          data-sku="${escapeHtml(product.sku)}"
        >
          ×
        </button>

      </div>


      <form class="create-perfume-form">

        <div class="field brand-field">

          <label>
            Бренд
          </label>


          <select
            class="new-perfume-brand"
            required
          >

            <option value="">
              Выберите бренд
            </option>

            ${[...brands]
              .sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
              .map(
                (brand) => `
                  <option value="${brand.id}">
                    ${escapeHtml(brand.name)}
                  </option>
                `
              )
              .join("")}

          </select>


          <button
            class="text-button"
            type="button"
            data-action="show-create-brand"
            data-sku="${escapeHtml(product.sku)}"
          >
            + Новый бренд
          </button>

        </div>


        <div class="field">

          <label>
            Название
          </label>

          <input
            class="new-perfume-name"
            type="text"
            required
            placeholder="Название аромата"
          >

        </div>


        <div class="field">

          <label>
            Пол
          </label>

          <select
            class="new-perfume-gender"
            required
          >

            <option value="U">
              Унисекс
            </option>

            <option value="M">
              Мужской
            </option>

            <option value="W">
              Женский
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            Семейство
          </label>

          <input
            class="new-perfume-family"
            type="text"
            placeholder="Необязательно"
          >

        </div>


        <div class="field">

          <label>
            Объём этого SKU
          </label>

          <select
            class="new-perfume-volume"
            required
          >

            <option value="">
              Выберите объём
            </option>

            ${STANDARD_VOLUMES
              .map(
                (volume) => `
                  <option value="${volume}">
                    ${volume} мл
                  </option>
                `
              )
              .join("")}

          </select>

        </div>


        <div
          class="create-brand-container hidden"
        ></div>


        <div class="create-perfume-actions">

          <button
            class="secondary-button"
            type="button"
            data-action="cancel-create-perfume"
            data-sku="${escapeHtml(product.sku)}"
          >
            Отмена
          </button>


          <button
            class="primary-button create-perfume-submit"
            type="submit"
          >
            Создать и привязать
          </button>

        </div>


        <div
          class="create-perfume-message"
        ></div>

      </form>

    </div>
  `;


  setupCreatePerfumeForm(
    container,
    product
  );
}


/* =====================================================
   CREATE PERFUME
===================================================== */

function setupCreatePerfumeForm(
  container,
  product
) {

  const form =
    container.querySelector(
      ".create-perfume-form"
    );


  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const brandId =
        form.querySelector(
          ".new-perfume-brand"
        ).value;


      const name =
        form.querySelector(
          ".new-perfume-name"
        ).value.trim();


      const gender =
        form.querySelector(
          ".new-perfume-gender"
        ).value;


      const fragranceFamily =
        form.querySelector(
          ".new-perfume-family"
        ).value.trim();


      const volume =
        Number(
          form.querySelector(
            ".new-perfume-volume"
          ).value
        );


      const submitButton =
        form.querySelector(
          ".create-perfume-submit"
        );


      const message =
        form.querySelector(
          ".create-perfume-message"
        );


      if (
        !brandId ||
        !name ||
        !volume
      ) {
        return;
      }


      submitButton.disabled =
        true;


      submitButton.textContent =
        "Создаём...";


      message.textContent = "";

      message.className =
        "create-perfume-message";


      try {

        const shopId =
          resolveProductShopId(
            product
          );


        const perfume =
          await createPerfume({
            brandId,
            name,
            gender,
            fragranceFamily,
          });


        perfumes.push(
          perfume
        );


        await createShopProduct({
          shopId,

          perfumeId:
            perfume.id,

          volume,

          sku:
            product.sku,
        });


        await removeMappedProduct(
          product.sku
        );


      } catch (error) {

        message.textContent =
          error.message;


        message.className =
          "create-perfume-message error-message";


        submitButton.disabled =
          false;


        submitButton.textContent =
          "Создать и привязать";
      }

    }
  );
}


/* =====================================================
   CREATE PERFUME REQUEST
===================================================== */

async function createPerfume({
  brandId,
  name,
  gender,
  fragranceFamily,
}) {

  const response = await fetch(
    `${API_URL}/perfumes`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        name,

        brand_id:
          brandId,

        gender,

        fragrance_family:
          fragranceFamily ||
          null,
      }),
    }
  );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.message ||
      "Не удалось создать аромат"
    );
  }


  return result;
}


/* =====================================================
   CREATE BRAND FORM
===================================================== */

function showCreateBrandForm(
  sku
) {

  const card =
    getProductCard(sku);


  const container =
    card?.querySelector(
      ".create-brand-container"
    );


  if (!container) {
    return;
  }


  container.classList.remove(
    "hidden"
  );


  container.innerHTML = `
    <div class="create-brand-box">

      <strong>
        Новый бренд
      </strong>


      <div class="create-brand-fields">

        <input
          class="new-brand-name"
          type="text"
          placeholder="Название бренда"
        >


        <input
          class="new-brand-country"
          type="text"
          placeholder="Страна"
        >

      </div>


      <div class="create-brand-actions">

        <button
          class="secondary-button"
          type="button"
          data-action="cancel-create-brand"
          data-sku="${escapeHtml(sku)}"
        >
          Отмена
        </button>


        <button
          class="primary-button"
          type="button"
          data-action="save-new-brand"
          data-sku="${escapeHtml(sku)}"
        >
          Создать бренд
        </button>

      </div>


      <div
        class="create-brand-message"
      ></div>

    </div>
  `;


  const saveButton =
    container.querySelector(
      '[data-action="save-new-brand"]'
    );


  saveButton.addEventListener(
    "click",
    () => {

      createBrand(
        sku,
        container
      );

    }
  );
}


/* =====================================================
   CREATE BRAND
===================================================== */

async function createBrand(
  sku,
  container
) {

  const name =
    container.querySelector(
      ".new-brand-name"
    ).value.trim();


  const country =
    container.querySelector(
      ".new-brand-country"
    ).value.trim();


  const message =
    container.querySelector(
      ".create-brand-message"
    );


  const button =
    container.querySelector(
      '[data-action="save-new-brand"]'
    );


  if (!name) {

    message.textContent =
      "Введите название бренда";


    message.className =
      "create-brand-message error-message";


    return;
  }


  button.disabled =
    true;


  button.textContent =
    "Создаём...";


  try {

    const response = await fetch(
      `${API_URL}/brands`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name,

          country:
            country ||
            null,
        }),
      }
    );


    const brand =
      await response.json();


    if (!response.ok) {

      throw new Error(
        brand.message ||
        "Не удалось создать бренд"
      );
    }


    brands.push(
      brand
    );


    brands.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );


    const card =
      getProductCard(sku);


    const brandSelect =
      card.querySelector(
        ".new-perfume-brand"
      );


    brandSelect.innerHTML = `
      <option value="">
        Выберите бренд
      </option>

      ${brands
        .map(
          (item) => `
            <option value="${item.id}">
              ${escapeHtml(item.name)}
            </option>
          `
        )
        .join("")}
    `;


    brandSelect.value =
      brand.id;


    container.innerHTML =
      "";


    container.classList.add(
      "hidden"
    );


  } catch (error) {

    message.textContent =
      error.message;


    message.className =
      "create-brand-message error-message";


    button.disabled =
      false;


    button.textContent =
      "Создать бренд";
  }
}


/* =====================================================
   CREATE SHOP PRODUCT
===================================================== */

async function createShopProduct({
  perfumeId,
  volume,
  sku,
  shopId,
}) {

  if (!shopId) {

    throw new Error(
      "Магазин не выбран"
    );
  }


  const response = await fetch(
    `${API_URL}/perfumes/${perfumeId}/shop-products`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        shop_id:
          shopId,

        volume_ml:
          Number(volume),

        sku:
          String(sku),

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


  return result;
}


/* =====================================================
   HIDE CREATE PERFUME
===================================================== */

function hideCreatePerfumeForm(
  sku
) {

  const card =
    getProductCard(sku);


  const container =
    card?.querySelector(
      ".create-perfume-container"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  container.classList.add(
    "hidden"
  );
}


/* =====================================================
   HIDE CREATE BRAND
===================================================== */

function hideCreateBrandForm(
  sku
) {

  const card =
    getProductCard(sku);


  const container =
    card?.querySelector(
      ".create-brand-container"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  container.classList.add(
    "hidden"
  );
}


/* =====================================================
   CLOSE MAPPING
===================================================== */

function closeMappingForm(
  sku
) {

  const card =
    getProductCard(sku);


  card
    ?.querySelector(
      ".mapping-form"
    )
    ?.remove();
}


/* =====================================================
   GET PRODUCT CARD
===================================================== */

function getProductCard(
  sku
) {

  return [
    ...document.querySelectorAll(
      ".product-card"
    )
  ].find(
    (card) =>
      String(
        card.dataset.sku
      ) ===
      String(sku)
  );
}


/* =====================================================
   REMOVE MAPPED PRODUCT
===================================================== */

async function removeMappedProduct(
  sku
) {

  if (isPrintingMode) {

    const card =
      getProductCard(sku);


    card?.remove();


    await loadPrintingProducts();

    return;
  }


  missingProducts =
    missingProducts.filter(
      (product) =>
        String(
          product.sku
        ) !==
        String(sku)
    );


  const card =
    getProductCard(sku);


  if (card) {

    card.classList.add(
      "product-mapped"
    );


    setTimeout(
      () => {
        card.remove();
      },
      250
    );
  }


  missingCount.textContent =
    missingProducts.length;


  const mapped =
    Number(
      mappedCount.textContent
    ) || 0;


  mappedCount.textContent =
    mapped + 1;


  if (
    !missingProducts.length
  ) {

    setTimeout(
      () => {

        productsList.innerHTML = `
          <div class="empty-state">
            Все SKU этого магазина привязаны 🎉
          </div>
        `;

      },
      300
    );
  }
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
  value
) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =====================================================
   INIT
===================================================== */

async function init() {

  if (isPrintingMode) {

    document
      .querySelector(
        "#shopCard"
      )
      .classList.add(
        "hidden"
      );


    document.querySelector(
      ".header h1"
    ).textContent =
      "Проверка SKU перед печатью";


    document.querySelector(
      ".header p"
    ).textContent =
      "Товары текущей производственной партии нужно привязать к базе, чтобы продолжить печать.";


    document.title =
      "Проверка SKU перед печатью";


    productsList.innerHTML = `
      <div class="empty-state">
        Загружаем магазины текущей партии...
      </div>
    `;
  }


  const shopsLoaded =
    await loadShops();


  if (
    isPrintingMode &&
    shopsLoaded
  ) {

    await loadPrintingProducts();
  }

}


init();