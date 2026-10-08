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
      "Подготавливаем производственную партию...";


    try {

      // ==========================================
      // 1. CREATE NEW PRODUCTION SESSION
      // DEVELOPMENT MODE
      // ==========================================

      /*
       * TODO BEFORE PRODUCTION:
       *
       * Here we must create a NEW Ozon session:
       *
       * POST /ozon/session
       *
       * For now we intentionally DO NOT create
       * a new session because we are developing
       * against the existing current session.
       */

      console.log(
        "[DEV] POST /ozon/session would happen here"
      );


      // ==========================================
      // 2. CHECK CURRENT SESSION PRODUCTS
      // ==========================================

      status.textContent =
        "Проверяем товары текущей партии...";


      const labelsResponse = await fetch(
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


      // Backend must always return unknownProducts
      // as an array.

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
        "[DEV] Unknown products:",
        labelsResult.unknownProducts
      );


      // ==========================================
      // 3. DECIDE WHERE WORKER GOES NEXT
      // ==========================================

      if (
        labelsResult.unknownProducts.length > 0
      ) {

        console.log(
          `[DEV] Found ${labelsResult.unknownProducts.length} unknown products`
        );


        // Worker must map unknown SKUs first.

        window.location.href =
          "./skuMapping.html?mode=printing";

        return;

      }


      // ==========================================
      // 4. EVERYTHING IS READY FOR PRINTING
      // ==========================================

      console.log(
        "[DEV] All products are mapped. Going to local print."
      );


      window.location.href =
        "./localPrint.html";


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


      ozonReadyButton.disabled = false;

    }

  }
);