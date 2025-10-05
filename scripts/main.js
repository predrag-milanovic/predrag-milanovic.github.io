// scripts/main.js
(function () {
  const FADE_OUT_MS = 320;
  const INSERT_DELAY_MS = 50;

  function loadPage() {
    const hash = window.location.hash || "#home";
    let currentPage = "home";

    for (const key in pages) {
      if (hash === pages[key].route) {
        currentPage = key;
        break;
      }
    }

    const container = document.getElementById("page-content");
    const pageStyle = document.getElementById("page-style");
    const portal = document.getElementById("portal-animation-container");
    const animLinkId = "anim-style";

    document.title = pages[currentPage].title;

    // Step 1: Start fading out old page
    container.classList.remove("loaded");

    // Step 2: Wait until fade-out finishes before changing anything
    setTimeout(() => {
      // --- Hide portal AFTER fade-out, not before ---
      if (portal) {
        portal.classList.add("portal-hidden");
        portal.style.display = "none";
        document.body.classList.remove("home-active");
      }

      // --- Now remove old animation CSS (after portal is gone) ---
      const existingAnim = document.getElementById(animLinkId);
      if (existingAnim) existingAnim.remove();

      // --- Load new page content ---
      fetch(pages[currentPage].path)
        .then((r) => r.text())
        .then((html) => {
          container.innerHTML = html;

          // Helper for showing new content
          const fadeIn = () => {
            setTimeout(() => container.classList.add("loaded"), INSERT_DELAY_MS);
          };

          // If this page has animation (e.g., home), re-add it and show portal
          if (currentPage === "home" && portal) {
            const enablePortal = () => {
              portal.style.display = "block";
              portal.classList.remove("portal-hidden");
              setTimeout(() => document.body.classList.add("home-active"), 100);
            };

            if (pages[currentPage].animation) {
              const animLink = document.createElement("link");
              animLink.rel = "stylesheet";
              animLink.id = animLinkId;
              animLink.href = pages[currentPage].animation;
              animLink.onload = enablePortal;
              document.head.appendChild(animLink);
            } else {
              enablePortal();
            }
          }

          // Page-specific CSS logic
          if (pages[currentPage].css) {
            pageStyle.onload = fadeIn;
            pageStyle.href = pages[currentPage].css;
          } else {
            fadeIn();
          }
        })
        .catch((err) => {
          console.error("Error loading page:", err);
          container.innerHTML = "<h1>Error loading page</h1>";
        });
    }, FADE_OUT_MS);
  }

  window.addEventListener("DOMContentLoaded", loadPage);
  window.addEventListener("hashchange", loadPage);
})();
