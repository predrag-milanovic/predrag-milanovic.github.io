
(function () {
  const FADE_OUT_MS = 450;
  let currentLanguage = "en";

  function loadPage() {
    const hash = (window.location.hash || "#home").replace(/^#/, "") || "home";
    let currentPage = "home";

    for (const key in pages) {
      if (hash === pages[key].route) {
      currentPage = key;
      break;
      }
    }

    const container = document.getElementById("page-content");
    const pageStyle = document.getElementById("page-style");
    const pageStyleLight = document.getElementById("page-style-light");
    const portal = document.getElementById("portal-animation-container");
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");

    if (!container || !pageStyle) {
      console.error("Required layout elements missing for loadPage; aborting route change.");
      return;
    }

    document.title = pages[currentPage].title;

    if (window.pageTransition && typeof window.pageTransition.fadeOutShell === "function") {
      window.pageTransition.fadeOutShell({ container, header, footer });
    } else {
      [container, header, footer].forEach(el => {
        if (el) el.classList.remove("loaded");
      });
    }
    
    // Delegate portal fade-out + animation stylesheet cleanup to portalAnimation core
    if (window.portalAnimation && typeof window.portalAnimation.beforePageTransition === "function") {
      window.portalAnimation.beforePageTransition({ portal, nextPage: currentPage });
    }

    // --- Step 2: Wait for fade-out before replacing content ---
    setTimeout(() => {
      // After fade-out, let the portalAnimation core handle hiding the portal
      if (window.portalAnimation && typeof window.portalAnimation.afterFadeOut === "function") {
        window.portalAnimation.afterFadeOut({ portal, nextPage: currentPage });
      }

      // Reset CAD page body state before loading new content
      document.body.classList.remove("cad-active");

      // --- Step 3: Load new page content ---
      fetch(pages[currentPage].path)
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          if (window.pageTransition && typeof window.pageTransition.applyTranslations === "function") {
            window.pageTransition.applyTranslations(currentLanguage, false);
          }

          const fadeInAll = () => {
            if (currentPage === "cad") {
              document.body.classList.add("cad-active");

              if (typeof window.initCadPortfolio === "function") {
                window.initCadPortfolio();
              }
            }

            if (window.pageTransition && typeof window.pageTransition.fadeInShell === "function") {
              window.pageTransition.fadeInShell({ container, header, footer });
            } else {
              [container, header, footer].forEach(el => {
                if (el) el.classList.add("loaded");
              });
            }
          };

          // --- Step 4: Handle portal animation for Home page via portalAnimation core ---
          if (window.portalAnimation && typeof window.portalAnimation.onHomePageLoaded === "function") {
            window.portalAnimation.onHomePageLoaded({
              portal,
              animationHref: pages[currentPage].animation,
              nextPage: currentPage
            });
          }

          // --- Step 5: Apply page-specific CSS then fade in ---
          if (pages[currentPage].css) {
            pageStyle.onload = fadeInAll;
            pageStyle.href = pages[currentPage].css;
          } else {
            fadeInAll();
          }

          // Apply page-specific light-theme overrides (if configured)
          if (pageStyleLight) {
            const lightHref = pages[currentPage].cssLight;
            if (lightHref) {
              pageStyleLight.href = lightHref;
            } else {
              pageStyleLight.removeAttribute("href");
            }
          }
        })
        .catch(err => {
          console.error("Error loading page:", err);
          container.innerHTML = "<h1>Error loading page</h1>";
        });
    }, FADE_OUT_MS);
  }


  window.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("language") || "en";
    currentLanguage = savedLanguage;

    loadPage();
    initLanguageSwitcher();
    initThemeSwitcher();
  });
  window.addEventListener("hashchange", loadPage);

  function initThemeSwitcher() {
    const themeBtn = document.getElementById("theme-btn");
    const moonIcon = document.querySelector(".moon-icon");
    const sunIcons = document.querySelectorAll(".sun-icon");
    const bgVideoEl = document.querySelector("#background-video video");
    
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);

    themeBtn.addEventListener("click", () => {
      const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });

    function applyTheme(theme) {
      if (theme === "light") {
        document.body.classList.add("light-theme");
        if (bgVideoEl) {
          bgVideoEl.pause();
        }
        if (moonIcon) moonIcon.style.display = "block";
        sunIcons.forEach(icon => icon.style.display = "none");
        if (themeBtn) themeBtn.setAttribute("aria-pressed", "true");
      } else {
        document.body.classList.remove("light-theme");
        if (bgVideoEl && bgVideoEl.paused) {
          const playPromise = bgVideoEl.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        }
        if (moonIcon) moonIcon.style.display = "none";
        sunIcons.forEach(icon => icon.style.display = "block");
        if (themeBtn) themeBtn.setAttribute("aria-pressed", "false");
      }
    }
  }

  function initLanguageSwitcher() {
    const langBtn = document.getElementById("language-btn");
    const langMenu = document.getElementById("language-menu");
    if (!langBtn || !langMenu) return;

    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = !langMenu.classList.contains("hidden");
      if (isOpen) {
        langMenu.classList.add("hidden");
        langBtn.setAttribute("aria-expanded", "false");
      } else {
        langMenu.classList.remove("hidden");
        langBtn.setAttribute("aria-expanded", "true");
      }
    });

    document.addEventListener("click", e => {
      if (!langMenu.classList.contains("hidden") && !langBtn.contains(e.target)) {
        langMenu.classList.add("hidden");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });

    langMenu.querySelectorAll("li").forEach(item => {
      item.addEventListener("click", () => {
        const selectedLang = item.dataset.lang;
        if (selectedLang && selectedLang !== currentLanguage) {
          currentLanguage = selectedLang;
          localStorage.setItem("language", selectedLang);
          
          if (window.pageTransition && typeof window.pageTransition.applyTranslations === "function") {
            window.pageTransition.applyTranslations(currentLanguage, true);
          }
          
          console.log(`Language changed to: ${selectedLang}`);
        }
        langMenu.classList.add("hidden");
        langBtn.setAttribute("aria-expanded", "false");
      });
    });

  }
})();
