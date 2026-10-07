const API_URL = window.API_URL;


const productForm =
  document.querySelector("#productForm");

const brandSelect =
  document.querySelector("#brand");

const backBtn =
  document.querySelector("#backBtn");

const showBrandFormBtn =
  document.querySelector("#showBrandFormBtn");

const newBrandCard =
  document.querySelector("#newBrandCard");

const cancelBrandBtn =
  document.querySelector("#cancelBrandBtn");

const createBrandBtn =
  document.querySelector("#createBrandBtn");

const brandStatus =
  document.querySelector("#brandStatus");

const productStatus =
  document.querySelector("#productStatus");

const createProductBtn =
  document.querySelector("#createProductBtn");


let brands = [];


// ------------------------------------
// LOAD BRANDS
// ------------------------------------

async function loadBrands(selectedBrandId = null) {

  try {

    brandSelect.innerHTML = `
      <option value="">
        Загружаем бренды...
      </option>
    `;


    const response = await fetch(
      `${API_URL}/brands`
    );


    if (!response.ok) {
      throw new Error(
        `HTTP error: ${response.status}`
      );
    }


    brands = await response.json();


    renderBrands(selectedBrandId);


  } catch (error) {

    console.error(
      "Failed to load brands:",
      error
    );


    brandSelect.innerHTML = `
      <option value="">
        Не удалось загрузить бренды
      </option>
    `;
  }
}


// ------------------------------------
// RENDER BRANDS
// ------------------------------------

function renderBrands(selectedBrandId = null) {

  brandSelect.innerHTML = `
    <option value="">
      Выберите бренд
    </option>

    ${brands
      .map((brand) => `
        <option
          value="${brand.id}"
          ${
            brand.id === selectedBrandId
              ? "selected"
              : ""
          }
        >
          ${brand.name}
        </option>
      `)
      .join("")}
  `;
}


// ------------------------------------
// SHOW NEW BRAND FORM
// ------------------------------------

function showBrandForm() {

  newBrandCard.classList.remove("hidden");

  brandStatus.textContent = "";

  document
    .querySelector("#newBrandName")
    .focus();
}


// ------------------------------------
// HIDE NEW BRAND FORM
// ------------------------------------

function hideBrandForm() {

  newBrandCard.classList.add("hidden");

  brandStatus.textContent = "";

  document.querySelector("#newBrandName").value = "";
  document.querySelector("#newBrandCountry").value = "";
}


// ------------------------------------
// CREATE BRAND
// ------------------------------------

async function createBrand() {

  const name = document
    .querySelector("#newBrandName")
    .value
    .trim();

  const country = document
    .querySelector("#newBrandCountry")
    .value
    .trim();


  if (!name) {

    brandStatus.textContent =
      "Введите название бренда";

    return;
  }


  try {

    createBrandBtn.disabled = true;

    createBrandBtn.textContent =
      "Создаём...";

    brandStatus.textContent = "";


    const response = await fetch(
      `${API_URL}/brands`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          country: country || null,
        }),
      }
    );


    const result = await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ??
        `HTTP error: ${response.status}`
      );
    }


    // Add new brand to our local list.
    brands.push(result);

    brands.sort((a, b) =>
      a.name.localeCompare(b.name)
    );


    // Render brands and automatically
    // select the newly created one.
    renderBrands(result.id);


    hideBrandForm();


  } catch (error) {

    console.error(
      "Failed to create brand:",
      error
    );

    brandStatus.textContent =
      error.message;

  } finally {

    createBrandBtn.disabled = false;

    createBrandBtn.textContent =
      "Создать бренд";
  }
}


// ------------------------------------
// CREATE PERFUME
// ------------------------------------

async function createPerfume(event) {

  event.preventDefault();


  const brandId =
    brandSelect.value;

  const name = document
    .querySelector("#name")
    .value
    .trim();

  const gender =
    document.querySelector("#gender").value;

  const fragranceFamily = document
    .querySelector("#fragranceFamily")
    .value
    .trim();


  if (!brandId) {

    productStatus.textContent =
      "Выберите бренд";

    return;
  }


  if (!name) {

    productStatus.textContent =
      "Введите название аромата";

    return;
  }


  try {

    createProductBtn.disabled = true;

    createProductBtn.textContent =
      "Создаём...";

    productStatus.textContent = "";


    const response = await fetch(
      `${API_URL}/perfumes`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          brand_id: brandId,
          gender,
          fragrance_family:
            fragranceFamily || null,
        }),
      }
    );


    const result = await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ??
        `HTTP error: ${response.status}`
      );
    }


    // Perfume + variants created.
    // Open its edit page immediately.

    window.location.href =
      `./editProduct.html?id=${result.id}`;


  } catch (error) {

    console.error(
      "Failed to create perfume:",
      error
    );


    productStatus.textContent =
      error.message;

  } finally {

    createProductBtn.disabled = false;

    createProductBtn.textContent =
      "Создать товар";
  }
}


// ------------------------------------
// EVENTS
// ------------------------------------

backBtn.addEventListener("click", () => {
  window.location.href = "./products.html";
});


showBrandFormBtn.addEventListener(
  "click",
  showBrandForm
);


cancelBrandBtn.addEventListener(
  "click",
  hideBrandForm
);


createBrandBtn.addEventListener(
  "click",
  createBrand
);


productForm.addEventListener(
  "submit",
  createPerfume
);


// ------------------------------------
// START
// ------------------------------------

loadBrands();