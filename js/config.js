const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

window.API_URL = isDev
  ? "http://localhost:3000"
  : "https://antony11659-perfumestorebackend-e001.twc1.net";
