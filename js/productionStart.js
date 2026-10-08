const API_URL = window.API_URL;

const LOCAL_PRINT_URL =
  "http://127.0.0.1:3000/print.html";

const SKU_MAPPING_URL =
  "./skuMapping.html?mode=printing";


const ozonReadyButton =
  document.querySelector("#ozonReadyButton");

const status =
  document.querySelector("#status");


/* =====================================================
   START PRODUCTION
===================================================== */

ozonReadyButton.addEventListener(
  "click",
  async () => {

    ozonReadyButton.disabled = true;

    status.className = "";

    status.textContent =
      "Создаём производственную партию...";


    try {

      // ==========================================
      // 1. CREATE NEW OZON SESSION
      // ==========================================

      const sessionResponse =
        await fetch(
          `${API_URL}/ozon/session`,
          {
            method: "POST",
          }
        );


      const sessionResult =
        await sessionResponse
          .json()
          .catch(() => null);


      if (!sessionResponse.ok) {

        throw new Error(
          sessionResult?.message ||
          sessionResult?.error ||
          "Не удалось создать производственную партию"
        );

      }


      console.log(
        "PRODUCTION SESSION CREATED:",
        sessionResult
      );


      // ==========================================
      // 2. CHECK CURRENT SESSION PRODUCTS
      // ==========================================

      status.textContent =
        "Проверяем товары текущей партии...";


      const labelsResponse =
        await fetch(
          `${API_URL}/ozon/print-sticking-labels`
        );


      const labelsResult =
        await labelsResponse
          .json()
          .catch(() => null);


      if (!labelsResponse.ok) {

        throw new Error(
          labelsResult?.message ||
          labelsResult?.error ||
          "Не удалось проверить товары партии"
        );

      }


      if (
        !Array.isArray(
          labelsResult?.unknownProducts
        )
      ) {

        throw new Error(
          "Backend не вернул список unknownProducts"
        );

      }


      const unknownProducts =
        labelsResult.unknownProducts;


      console.log(
        "UNKNOWN PRODUCTS:",
        unknownProducts
      );


      console.log(
        "UNKNOWN PRODUCTS COUNT:",
        unknownProducts.length
      );


      // ==========================================
      // 3. UNKNOWN SKU EXISTS
      //    → OPEN SKU MAPPING
      // ==========================================

      if (
        unknownProducts.length > 0
      ) {

        status.textContent =
          `Найдено неизвестных SKU: ${unknownProducts.length}`;


        console.log(
          "Unknown SKU found. Opening SKU mapping."
        );


        window.location.replace(
          SKU_MAPPING_URL
        );


        return;
      }


      // ==========================================
      // 4. EVERYTHING IS MAPPED
      //    → OPEN LOCAL PRINT PAGE
      // ==========================================

      status.textContent =
        "Все товары привязаны. Открываем печать...";


      console.log(
        "NO UNKNOWN SKU."
      );


      console.log(
        "REDIRECTING TO:",
        LOCAL_PRINT_URL
      );


      window.location.replace(
        LOCAL_PRINT_URL
      );


    } catch (error) {

      console.error(
        "PRODUCTION START ERROR:",
        error
      );


      status.textContent =
        error?.message ||
        "Не удалось начать производственную партию";


      status.className =
        "error";


      ozonReadyButton.disabled =
        false;

    }

  }
);