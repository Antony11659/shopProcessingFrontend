const API_URL =
  "https://antony11659-perfumestorebackend-e001.twc1.net";

const ordersContainer = document.querySelector("#orders");
const progress = document.querySelector("#progress");

const searchInput = document.querySelector("#order-search");
const searchButton = document.querySelector("#search-button");

const previousButton = document.querySelector("#previous-button");
const nextButton = document.querySelector("#next-button");

const limitButtons = document.querySelectorAll(
  ".page-size-buttons button"
);


// Current state of THIS browser / worker
let currentStartIndex = 0;
let nextIndex = 0;
let limit = 10;
let totalOrders = 0;
let hasNext = false;


// LOADING

const setLoading = (isLoading) => {
  searchButton.disabled = isLoading;
  previousButton.disabled = isLoading;
  nextButton.disabled = isLoading;

  limitButtons.forEach((button) => {
    button.disabled = isLoading;
  });

  if (isLoading) {
    ordersContainer.innerHTML = `
      <div class="order-card">
        Загрузка заказов...
      </div>
    `;
  }
};


// LOAD ORDERS

const loadOrders = async ({
  startNum,
  startIndex
} = {}) => {
  try {
    setLoading(true);

    const params = new URLSearchParams();

    params.set("limit", limit);

    if (startNum) {
      params.set("startNum", startNum);
    } else if (startIndex !== undefined) {
      params.set("startIndex", startIndex);
    }

    const response = await fetch(
      `${API_URL}/ozon/packaging?${params}`
    );

    if (response.status === 404) {
      ordersContainer.innerHTML = `
        <div class="order-card">
          Заказ не найден
        </div>
      `;

      return;
    }

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status}`
      );
    }

    const data = await response.json();

    currentStartIndex = data.startIndex;
    nextIndex = data.nextIndex;
    totalOrders = data.totalOrders;
    hasNext = data.hasNext;

    renderOrders(data.orders);
    updateNavigation();

  } catch (error) {
    console.error(error);

    ordersContainer.innerHTML = `
      <div class="order-card">
        Не удалось загрузить заказы
      </div>
    `;

  } finally {
    searchButton.disabled = false;

    limitButtons.forEach((button) => {
      button.disabled = false;
    });

    previousButton.disabled =
      currentStartIndex === 0;

    nextButton.disabled =
      !hasNext;
  }
};


// RENDER ORDERS

const renderOrders = (orders) => {
  ordersContainer.innerHTML = "";

  orders.forEach((order) => {

    const productsHTML = order.products
      .map((product) => {

        if (product.unknown) {
          return `
            <div class="product unknown">

              <div class="unknown-title">
                ⚠ Неизвестный товар
              </div>

              <div class="unknown-sku">
                SKU: ${product.sku}
              </div>

            </div>
          `;
        }

        return `
          <div class="product">

            <span class="product-name">
              ${product.name}
            </span>

            <span class="product-info">
              ${product.volume} мл × ${product.quantity}
            </span>

          </div>
        `;
      })
      .join("");


    ordersContainer.insertAdjacentHTML(
      "beforeend",
      `
        <article class="order-card">

          <div class="order-header">

            <span class="order-number">
              ${order.displayedNum}
            </span>

            <span class="shop-name">
              ${order.shop}
            </span>

          </div>

          ${productsHTML}

        </article>
      `
    );
  });
};


// NAVIGATION STATE

const updateNavigation = () => {
  const from = currentStartIndex + 1;
  const to = Math.min(nextIndex, totalOrders);

  progress.textContent =
    `${from}–${to} из ${totalOrders}`;

  previousButton.disabled =
    currentStartIndex === 0;

  nextButton.disabled =
    !hasNext;
};


// SEARCH

const searchOrder = () => {
  const startNum = searchInput.value.trim();

  if (!startNum) {
    return;
  }

  loadOrders({
    startNum
  });
};


searchButton.addEventListener(
  "click",
  searchOrder
);


searchInput.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Enter") {
      searchOrder();
    }
  }
);


// NEXT

nextButton.addEventListener(
  "click",
  () => {
    if (!hasNext) {
      return;
    }

    loadOrders({
      startIndex: nextIndex
    });
  }
);


// PREVIOUS

previousButton.addEventListener(
  "click",
  () => {
    const previousIndex = Math.max(
      0,
      currentStartIndex - limit
    );

    loadOrders({
      startIndex: previousIndex
    });
  }
);


// PAGE SIZE

limitButtons.forEach((button) => {

  button.addEventListener("click", () => {

    limit = Number(
      button.dataset.limit
    );

    limitButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    loadOrders({
      startIndex: currentStartIndex
    });

  });

});


// INITIAL LOAD

loadOrders();