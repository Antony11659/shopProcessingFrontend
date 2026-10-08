(() => {
  const items = [
    {
      label: "Упаковка",
      page: "index.html",
      icon: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    },
    {
      label: "Товары",
      page: "products.html",
      icon: '<rect x="4" y="7" width="16" height="14" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
    },
    {
      label: "SKU",
      page: "skuMapping.html",
      icon: '<path d="M4 4h6l10 10-6 6L4 10z"/><circle cx="8" cy="8" r="1"/>',
    },
    {

      label: "Поклейка",
      page: "sticking.html",  
      icon: '<path d="M7 3h10v4h4v14H3V7h4V3z"/><path d="M7 7h10"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    
    },
  ];

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const env = new URLSearchParams(window.location.search).get("env");
  const query = new URLSearchParams();

  if (env !== null) {
    query.set("env", env);
  }

  const suffix = query.toString() ? `?${query}` : "";
  const nav = document.createElement("nav");
  nav.className = "bottom-navigation";
  nav.setAttribute("aria-label", "Основная навигация");

  items.forEach((item) => {
    const link = document.createElement("a");
    link.href = `./${item.page}${suffix}`;
    link.className = "bottom-navigation-item";

    if (item.page === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">${item.icon}</svg>
      <span>${item.label}</span>
    `;
    nav.appendChild(link);
  });

  document.querySelector("#navigation").appendChild(nav);
})();
