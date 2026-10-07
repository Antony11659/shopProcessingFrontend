const API_URL = window.API_URL;

const productContent = document.querySelector("#productContent");
const backBtn = document.querySelector("#backBtn");

const params = new URLSearchParams(window.location.search);
const perfumeId = params.get("id");

let shopProducts = [];
let shops = [];
let perfumeVariants = [];


// --------------------------------------------------
// BACK
// --------------------------------------------------

backBtn.addEventListener("click", () => {
  window.location.href = "./products.html";
});


// --------------------------------------------------
// LOAD PERFUME
// --------------------------------------------------

async function loadPerfume() {
  if (!perfumeId) {
    showError("Не указан ID аромата.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/perfumes/${perfumeId}`
    );

    if (response.status === 404) {
      showError("Аромат не найден.");
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const perfume = await response.json();

    renderPerfume(perfume);

  } catch (error) {
    console.error("Failed to load perfume:", error);

    showError("Не удалось загрузить аромат.");
  }
}


// --------------------------------------------------
// RENDER PERFUME
// --------------------------------------------------

function renderPerfume(perfume) {
  const brandName =
    perfume.brand?.name ?? "Без бренда";

  const country =
    perfume.brand?.country ?? "—";


  perfumeVariants =
    perfume.variants ?? [];


  const volumes = perfumeVariants
    .map(
      (variant) =>
        `${variant.volume_ml} мл`
    )
    .join(" / ");


  const images =
    perfume.images ?? [];


  productContent.innerHTML = `
    <section class="title-section">

      <div>

        <div class="brand">
          ${brandName}
        </div>

        <h1>
          ${perfume.name}
        </h1>

      </div>


      <div class="product-id">
        ID ${perfume.id}
      </div>

    </section>


    <!-- MAIN INFORMATION -->

    <section class="card">

      <div class="section-header">

        <h2>
          Основная информация
        </h2>

      </div>


      <form id="perfumeForm">

        <div class="form-grid">


          <div class="form-field">

            <label for="name">
              Название
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value="${perfume.name}"
              required
            >

          </div>


          <div class="form-field">

            <label>
              Бренд
            </label>

            <input
              type="text"
              value="${brandName}"
              disabled
            >

          </div>


          <div class="form-field">

            <label>
              Страна
            </label>

            <input
              type="text"
              value="${country}"
              disabled
            >

          </div>


          <div class="form-field">

            <label for="gender">
              Пол
            </label>

            <select
              id="gender"
              name="gender"
            >

              <option
                value="U"
                ${perfume.gender === "U" ? "selected" : ""}
              >
                Унисекс
              </option>

              <option
                value="M"
                ${perfume.gender === "M" ? "selected" : ""}
              >
                Мужской
              </option>

              <option
                value="W"
                ${perfume.gender === "W" ? "selected" : ""}
              >
                Женский
              </option>

            </select>

          </div>


          <div class="form-field form-field-wide">

            <label for="fragranceFamily">
              Семейство
            </label>

            <input
              id="fragranceFamily"
              name="fragrance_family"
              type="text"
              value="${perfume.fragrance_family ?? ""}"
            >

          </div>

        </div>


        <div class="form-actions">

          <span id="saveStatus"></span>

          <button
            type="submit"
            class="save-button"
          >
            Сохранить изменения
          </button>

        </div>

      </form>

    </section>


    <!-- VOLUMES -->

    <section class="card">

      <h2>
        Объёмы
      </h2>

      <div class="volumes">
        ${volumes || "Нет объёмов"}
      </div>

    </section>


    <!-- WEBSITE IMAGES -->

    <section class="card">

      <div class="section-header">

        <h2>
          Фото для сайта
        </h2>

        <button
          class="secondary-button"
          type="button"
        >
          + Добавить фото
        </button>

      </div>


      <div class="images">

        ${
          images.length
            ? images
                .map(createImageCard)
                .join("")
            : `
              <div class="empty-state">
                Фотографии пока не добавлены.
              </div>
            `
        }

      </div>

    </section>


    <!-- MARKETPLACES -->

    <section class="card">

      <div class="section-header">

        <h2>
          Маркетплейсы
        </h2>

        <button
          id="addSkuBtn"
          class="secondary-button"
          type="button"
        >
          + Добавить SKU
        </button>

      </div>


      <div id="shopProductsList">

        <div class="empty-state">
          Загружаем SKU...
        </div>

      </div>

    </section>
  `;


  // Edit perfume form.

  const perfumeForm =
    document.querySelector("#perfumeForm");

  perfumeForm.addEventListener(
    "submit",
    savePerfume
  );


  // Add SKU button.

  const addSkuBtn =
    document.querySelector("#addSkuBtn");

  addSkuBtn.addEventListener(
    "click",
    showAddSkuForm
  );


  // Load marketplace information.

  loadShopProducts();
  loadShops();
}


// --------------------------------------------------
// SAVE PERFUME
// --------------------------------------------------

async function savePerfume(event) {
  event.preventDefault();


  const saveButton =
    event.target.querySelector(
      ".save-button"
    );


  const saveStatus =
    document.querySelector(
      "#saveStatus"
    );


  const name =
    document
      .querySelector("#name")
      .value
      .trim();


  const gender =
    document
      .querySelector("#gender")
      .value;


  const fragranceFamily =
    document
      .querySelector(
        "#fragranceFamily"
      )
      .value
      .trim();


  const body = {
    name,
    gender,

    fragrance_family:
      fragranceFamily || null,
  };


  try {

    saveButton.disabled = true;

    saveButton.textContent =
      "Сохраняем...";

    saveStatus.textContent = "";


    const response = await fetch(
      `${API_URL}/perfumes/${perfumeId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),
      }
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ??
        `HTTP error: ${response.status}`
      );
    }


    saveStatus.textContent =
      "Сохранено ✓";


    document
      .querySelector(
        ".title-section h1"
      )
      .textContent =
        result.name;


  } catch (error) {

    console.error(
      "Failed to update perfume:",
      error
    );


    saveStatus.textContent =
      "Ошибка сохранения";


  } finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "Сохранить изменения";
  }
}


// --------------------------------------------------
// LOAD SHOPS
// --------------------------------------------------

async function loadShops() {
  try {

    const response = await fetch(
      `${API_URL}/shops`
    );


    if (!response.ok) {

      throw new Error(
        `HTTP error: ${response.status}`
      );
    }


    shops =
      await response.json();


  } catch (error) {

    console.error(
      "Failed to load shops:",
      error
    );
  }
}


// --------------------------------------------------
// LOAD SHOP PRODUCTS
// --------------------------------------------------

async function loadShopProducts() {
  try {

    const response = await fetch(
      `${API_URL}/perfumes/${perfumeId}/shop-products`
    );


    if (!response.ok) {

      throw new Error(
        `HTTP error: ${response.status}`
      );
    }


    shopProducts =
      await response.json();


    renderShopProducts();


  } catch (error) {

    console.error(
      "Failed to load shop products:",
      error
    );


    const container =
      document.querySelector(
        "#shopProductsList"
      );


    if (container) {

      container.innerHTML = `
        <div class="empty-state">
          Не удалось загрузить SKU.
        </div>
      `;
    }
  }
}


// --------------------------------------------------
// RENDER SHOP PRODUCTS
// --------------------------------------------------

function renderShopProducts() {

  const container =
    document.querySelector(
      "#shopProductsList"
    );


  if (!container) {
    return;
  }


  if (shopProducts.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Для этого аромата пока нет SKU.
      </div>
    `;

    return;
  }


  // Group SKUs by shop.

  const grouped = {};


  shopProducts.forEach(
    (product) => {

      const shopId =
        product.shop.id;


      if (!grouped[shopId]) {

        grouped[shopId] = {

          shop:
            product.shop,

          products: [],
        };
      }


      grouped[shopId]
        .products
        .push(product);
    }
  );


  container.innerHTML =
    Object
      .values(grouped)
      .map((group) => {

        const products =
          [...group.products]
            .sort(
              (a, b) =>
                a.volume_ml -
                b.volume_ml
            );


        return `
          <div class="shop-group">

            <div class="shop-header">

              <div>

                <strong>
                  ${group.shop.name}
                </strong>

                <span>
                  ${group.shop.marketplace}
                </span>

              </div>


              <span class="sku-count">
                ${products.length} SKU
              </span>

            </div>


            <div class="sku-list">

              ${products
                .map((product) => {

                  let status =
                    "Неактивен";


                  if (
                    product.is_archived
                  ) {

                    status =
                      "Архив";

                  } else if (
                    product.is_active
                  ) {

                    status =
                      "Активен";
                  }


                  return `
                    <div class="sku-row">

                      <div class="sku-volume">
                        ${product.volume_ml} мл
                      </div>


                      <div class="sku-value">
                        ${product.sku}
                      </div>


                      <div class="sku-status">
                        ${status}
                      </div>

                    </div>
                  `;
                })
                .join("")}

            </div>

          </div>
        `;
      })
      .join("");
}


// --------------------------------------------------
// SHOW ADD SKU FORM
// --------------------------------------------------

function showAddSkuForm() {

  // Do not open twice.

  if (
    document.querySelector(
      "#addSkuForm"
    )
  ) {
    return;
  }


  const container =
    document.querySelector(
      "#shopProductsList"
    );


  const form =
    document.createElement("div");


  form.id =
    "addSkuForm";

  form.className =
    "add-sku-form";


  const shopOptions =
    shops
      .map(
        (shop) => `
          <option value="${shop.id}">
            ${shop.name} — ${shop.marketplace}
          </option>
        `
      )
      .join("");


  const volumeOptions =
    [...perfumeVariants]
      .sort(
        (a, b) =>
          a.volume_ml -
          b.volume_ml
      )
      .map(
        (variant) => `
          <option value="${variant.volume_ml}">
            ${variant.volume_ml} мл
          </option>
        `
      )
      .join("");


  form.innerHTML = `
    <div class="add-sku-header">

      <strong>
        Новый SKU
      </strong>


      <button
        id="cancelSkuBtn"
        type="button"
        class="secondary-button"
      >
        Отмена
      </button>

    </div>


    <form id="skuForm">

      <div class="form-grid">


        <div class="form-field">

          <label for="skuShop">
            Магазин
          </label>


          <select
            id="skuShop"
            required
          >

            <option value="">
              Выберите магазин
            </option>

            ${shopOptions}

          </select>

        </div>


        <div class="form-field">

          <label for="skuVolume">
            Объём
          </label>


          <select
            id="skuVolume"
            required
          >

            <option value="">
              Выберите объём
            </option>

            ${volumeOptions}

          </select>

        </div>


        <div class="form-field form-field-wide">

          <label for="skuValue">
            SKU
          </label>


          <input
            id="skuValue"
            type="text"
            placeholder="Введите SKU"
            autocomplete="off"
            required
          >

        </div>

      </div>


      <div class="form-actions">

        <span id="skuStatus"></span>


        <button
          id="saveSkuBtn"
          type="submit"
          class="save-button"
        >
          Добавить SKU
        </button>

      </div>

    </form>
  `;


  // Put form above existing SKUs.

  container.prepend(form);


  // Cancel.

  document
    .querySelector(
      "#cancelSkuBtn"
    )
    .addEventListener(
      "click",
      () => {

        form.remove();

      }
    );


  // Submit.

  document
    .querySelector(
      "#skuForm"
    )
    .addEventListener(
      "submit",
      createShopProduct
    );
}


// --------------------------------------------------
// CREATE SHOP PRODUCT
// --------------------------------------------------

async function createShopProduct(event) {
  event.preventDefault();


  const shopId =
    document
      .querySelector(
        "#skuShop"
      )
      .value;


  const volume =
    document
      .querySelector(
        "#skuVolume"
      )
      .value;


  const sku =
    document
      .querySelector(
        "#skuValue"
      )
      .value
      .trim();


  const saveButton =
    document.querySelector(
      "#saveSkuBtn"
    );


  const status =
    document.querySelector(
      "#skuStatus"
    );


  const body = {

    shop_id:
      shopId,

    volume_ml:
      Number(volume),

    sku,
  };


  try {

    saveButton.disabled =
      true;

    saveButton.textContent =
      "Добавляем...";

    status.textContent =
      "";


    const response =
      await fetch(
        `${API_URL}/perfumes/${perfumeId}/shop-products`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(body),
        }
      );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ??
        `HTTP error: ${response.status}`
      );
    }


    // Remove form after successful insert.

    document
      .querySelector(
        "#addSkuForm"
      )
      ?.remove();


    // Reload the real data from DB.

    await loadShopProducts();


  } catch (error) {

    console.error(
      "Failed to create SKU:",
      error
    );


    status.textContent =
      error.message;


  } finally {

    saveButton.disabled =
      false;

    saveButton.textContent =
      "Добавить SKU";
  }
}


// --------------------------------------------------
// IMAGE
// --------------------------------------------------

function createImageCard(image) {

  return `
    <div class="image-card">

      <img
        src="${image.image_url}"
        alt=""
      >


      <div class="image-label">

        ${
          image.is_primary
            ? "Главное фото"
            : `Фото ${image.sort_order}`
        }

      </div>

    </div>
  `;
}


// --------------------------------------------------
// ERROR
// --------------------------------------------------

function showError(message) {

  productContent.innerHTML = `
    <div class="error-state">
      ${message}
    </div>
  `;
}


// --------------------------------------------------
// START
// --------------------------------------------------

loadPerfume();