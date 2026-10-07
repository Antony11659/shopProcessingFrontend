const isDev = new URLSearchParams(window.location.search).get("env") === "dev";

window.API_URL = isDev
  ? "http://localhost:3000"
  : "https://antony11659-perfumestorebackend-e001.twc1.net";
