const API_URL = window.API_URL;

const ozonReadyButton =
  document.querySelector("#ozonReadyButton");

const status =
  document.querySelector("#status");


ozonReadyButton.addEventListener(
  "click",
  async () => {

    ozonReadyButton.disabled = true;

    status.className = "";

    status.textContent =
      "Создаём производственную партию...";


    try {

      // ==========================================
      // 1. CREATE NEW PRODUCTION SESSION
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
      // 2. CHECK PRODUCTS FROM NEW SESSION
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


      console.log(
        "UNKNOWN PRODUCTS:",
        labelsResult.unknownProducts
      );


      // ==========================================
      // 3. UNKNOWN SKU → MAPPING
      // ==========================================

      if (
        labelsResult.unknownProducts.length > 0
      ) {

        console.log(
          `Found ${labelsResult.unknownProducts.length} unknown products`
        );


        window.location.href =
          "./skuMapping.html?mode=printing";


        return;
      }


      // ==========================================
      // 4. EVERYTHING READY → LOCAL PRINTER
      // ==========================================

      console.log(
        "All products are mapped. Opening local printer."
      );


      window.location.href =
        "http://127.0.0.1:3000/";


    } catch (error) {

      console.error(
        "PRODUCTION START ERROR:",
        error
      );


      status.textContent =
        error.message ||
        "Не удалось начать производственную партию";


      status.className =
        "error";


      ozonReadyButton.disabled =
        false;
    }

  }
);