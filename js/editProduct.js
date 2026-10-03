const API_URL = "http://localhost:3000";

const productContent = document.querySelector("#productContent");
const backBtn = document.querySelector("#backBtn");

const params = new URLSearchParams(window.location.search);
const perfumeId = params.get("id");


backBtn.addEventListener("click", () => {
  window.location.href = "./products.html";
});


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


function renderPerfume(perfume) {
  const brandName = perfume.brand?.name ?? "Без бренда";
  const country = perfume.brand?.country ?? "—";

  const volumes = (perfume.variants ?? [])
    .map((variant) => `${variant.volume_ml} мл`)
    .join(" / ");

  const images = perfume.images ?? [];

  productContent.innerHTML = `
    <section class="title-section">

      <div>
        <div class="brand">${brandName}</div>
        <h1>${perfume.name}</h1>
      </div>

      <div class="product-id">
        ID ${perfume.id}
      </div>

    </section>


    <section class="card">

      <div class="section-header">
        <h2>Основная информация</h2>
      </div>

      <form id="perfumeForm">

        <div class="form-grid">

          <div class="form-field">
            <label for="name">Название</label>

            <input
              id="name"
              name="name"
              type="text"
              value="${perfume.name}"
              required
            >
          </div>


          <div class="form-field">
            <label>Бренд</label>

            <input
              type="text"
              value="${brandName}"
              disabled
            >
          </div>


          <div class="form-field">
            <label>Страна</label>

            <input
              type="text"
              value="${country}"
              disabled
            >
          </div>


          <div class="form-field">
            <label for="gender">Пол</label>

            <select id="gender" name="gender">

              <option value="U" ${perfume.gender === "U" ? "selected" : ""}>
                Унисекс
              </option>

              <option value="M" ${perfume.gender === "M" ? "selected" : ""}>
                Мужской
              </option>

              <option value="W" ${perfume.gender === "W" ? "selected" : ""}>
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


    <section class="card">

      <h2>Объёмы</h2>

      <div class="volumes">
        ${volumes || "Нет объёмов"}
      </div>

    </section>


    <section class="card">

      <div class="section-header">

        <h2>Фото для сайта</h2>

        <button class="secondary-button">
          + Добавить фото
        </button>

      </div>

      <div class="images">

        ${
          images.length
            ? images.map(createImageCard).join("")
            : `
              <div class="empty-state">
                Фотографии пока не добавлены.
              </div>
            `
        }

      </div>

    </section>


    <section class="card">

      <div class="section-header">

        <h2>Маркетплейсы</h2>

        <button class="secondary-button">
          + Добавить SKU
        </button>

      </div>

      <div class="empty-state">
        SKU добавим следующим этапом.
      </div>

    </section>
  `;

  const perfumeForm = document.querySelector("#perfumeForm");

  perfumeForm.addEventListener("submit", savePerfume);
}

async function savePerfume(event) {
  event.preventDefault();

  const saveButton = event.target.querySelector(".save-button");
  const saveStatus = document.querySelector("#saveStatus");

  const name = document.querySelector("#name").value.trim();
  const gender = document.querySelector("#gender").value;
  const fragranceFamily =
    document.querySelector("#fragranceFamily").value.trim();

  const body = {
    name,
    gender,
    fragrance_family: fragranceFamily || null,
  };

  try {
    saveButton.disabled = true;
    saveButton.textContent = "Сохраняем...";

    saveStatus.textContent = "";

    const response = await fetch(
      `${API_URL}/perfumes/${perfumeId}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ?? `HTTP error: ${response.status}`
      );
    }

    saveStatus.textContent = "Сохранено ✓";

    // Update page title without reloading everything.
    document.querySelector(".title-section h1").textContent =
      result.name;

  } catch (error) {
    console.error("Failed to update perfume:", error);

    saveStatus.textContent = "Ошибка сохранения";

  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Сохранить изменения";
  }
}


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


function showError(message) {
  productContent.innerHTML = `
    <div class="error-state">
      ${message}
    </div>
  `;
}


loadPerfume();