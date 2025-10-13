// scripts/main.js
(function () {
  const FADE_OUT_MS = 320;
  const INSERT_DELAY_MS = 50;

  function loadPage() {
    const hash = window.location.hash || "#home";
    let currentPage = "home";

    // Determine which page should load
    for (const key in pages) {
      if (hash === pages[key].route) {
        currentPage = key;
        break;
      }
    }

    // === Elements ===
    const container = document.getElementById("page-content");
    const pageStyle = document.getElementById("page-style");
    const portal = document.getElementById("portal-animation-container");
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    const animLinkId = "anim-style";

    document.title = pages[currentPage].title;

    // --- Step 1: Fade out old content + header/footer ---
    [container, header, footer].forEach(el => {
      if (el) el.classList.remove("loaded");
    });

    // --- Step 2: Wait for fade-out before replacing content ---
    setTimeout(() => {
      // Hide portal animation when not on home
      if (portal) {
        portal.classList.add("portal-hidden");
        portal.style.display = "none";
        document.body.classList.remove("home-active");
      }

      // Remove any previous animation stylesheet
      const existingAnim = document.getElementById(animLinkId);
      if (existingAnim) existingAnim.remove();

      // --- Step 3: Load new page content ---
      fetch(pages[currentPage].path)
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          // --- Helper: Fade everything in ---
          const fadeInAll = () => {
            setTimeout(() => {
              [container, header, footer].forEach(el => {
                if (el) el.classList.add("loaded");
              });
            }, INSERT_DELAY_MS);
          };

          // --- Step 4: Handle portal animation for Home page ---
          if (currentPage === "home" && portal) {
            const enablePortal = () => {
              portal.style.display = "block";
              portal.classList.remove("portal-hidden");
              setTimeout(() => document.body.classList.add("home-active"), 100);
            };

            // Load animation CSS dynamically (if defined)
            if (pages[currentPage].animation) {
              const animLink = document.createElement("link");
              animLink.rel = "stylesheet";
              animLink.id = animLinkId;
              animLink.href = pages[currentPage].animation;
              animLink.onload = () => {
                enablePortal();

                // Ensure responsive.css always cascades last
                const responsiveLink = document.getElementById("responsive-style");
                if (responsiveLink) {
                  document.head.removeChild(responsiveLink);
                  document.head.appendChild(responsiveLink);
                }
              };
              document.head.appendChild(animLink);
            } else {
              enablePortal();
            }
          }

          // --- Step 5: Apply page-specific CSS then fade in ---
          if (pages[currentPage].css) {
            pageStyle.onload = fadeInAll;
            pageStyle.href = pages[currentPage].css;
          } else {
            fadeInAll();
          }
        })
        .catch(err => {
          console.error("Error loading page:", err);
          container.innerHTML = "<h1>Error loading page</h1>";
        });
    }, FADE_OUT_MS);
  }

  // --- Step 6: Event listeners ---
  window.addEventListener("DOMContentLoaded", () => {
    loadPage();
    initLanguageSwitcher();
  });
  window.addEventListener("hashchange", loadPage);

  // === LANGUAGE SWITCHER LOGIC ===
  function initLanguageSwitcher() {
    const langBtn = document.getElementById("language-btn");
    const langMenu = document.getElementById("language-menu");
    if (!langBtn || !langMenu) return;

    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", e => {
      if (!langMenu.classList.contains("hidden") && !langBtn.contains(e.target)) {
        langMenu.classList.add("hidden");
      }
    });

    langMenu.querySelectorAll("li").forEach(item => {
      item.addEventListener("click", () => {
        const lang = item.dataset.lang;
        console.log(`Selected language: ${lang}`);
        langMenu.classList.add("hidden");
        // TODO: translation logic later
      });
    });
  }
})();
