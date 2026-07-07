
(function () {
  const FADE_OUT_MS = 700;
  let currentLanguage = "en";
  let hasLoadedOnce = false;
  let currentPage = "home";
  let headerMenuBtn = null;
  let headerMenuPanel = null;
  let languageMenu = null;
  let languageBtn = null;

  function closeHeaderMenu() {
    if (headerMenuPanel) {
      headerMenuPanel.classList.add("hidden");
    }

    if (headerMenuBtn) {
      headerMenuBtn.setAttribute("aria-expanded", "false");
    }

    if (languageMenu) {
      languageMenu.classList.add("hidden");
    }

    if (languageBtn) {
      languageBtn.setAttribute("aria-expanded", "false");
    }
  }

  function updateHeaderMenuState(pageName) {
    if (!headerMenuBtn) return;

    const isHomePage = pageName === "home";

    headerMenuBtn.disabled = !isHomePage;
    headerMenuBtn.setAttribute("aria-disabled", isHomePage ? "false" : "true");
    headerMenuBtn.setAttribute("tabindex", isHomePage ? "0" : "-1");
    headerMenuBtn.classList.toggle("is-disabled", !isHomePage);

    const menuShell = headerMenuBtn.closest(".header-menu-shell");
    if (menuShell) {
      menuShell.classList.toggle("is-hidden", !isHomePage);
    }

    if (!isHomePage) {
      closeHeaderMenu();
    }
  }

  function setShellLoaded(elements, isLoaded) {
    elements.forEach(el => {
      if (el) el.classList.toggle("loaded", isLoaded);
    });
  }

  function getPageByHash(hash) {
    const matchedPage = Object.keys(pages).find(key => hash === pages[key].route);
    if (matchedPage) return matchedPage;

    if (hash === "blog") {
      const localizedBlogPage = `blog-${currentLanguage}`;
      if (pages[localizedBlogPage]) return localizedBlogPage;
      if (pages.blog) return "blog";
    }

    return "home";
  }

  function loadPage() {
    const hash = (window.location.hash || "#home").replace(/^#/, "") || "home";
    currentPage = getPageByHash(hash);
    const pageConfig = pages[currentPage];
    const isHomePage = currentPage === "home";

    const container = document.getElementById("page-content");
    const pageStyle = document.getElementById("page-style");
    const pageStyleLight = document.getElementById("page-style-light");
    const portal = document.getElementById("portal-animation-container");
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");
    const shellElements = [container, header, footer];
    const pageTransition = window.pageTransition;
    const portalAnimation = window.portalAnimation;

    if (!isHomePage) {
      updateHeaderMenuState(currentPage);
    }

    if (!container || !pageStyle) {
      console.error("Required layout elements missing for loadPage; aborting route change.");
      return;
    }

    document.title = pageConfig.title;

    const shouldFadeOut = hasLoadedOnce;

    if (shouldFadeOut) {
      if (pageTransition && typeof pageTransition.fadeOutShell === "function") {
        pageTransition.fadeOutShell({ container, header, footer });
      } else {
        setShellLoaded(shellElements, false);
      }

      if (portalAnimation && typeof portalAnimation.beforePageTransition === "function") {
        portalAnimation.beforePageTransition({ portal, nextPage: currentPage });
      }
    }

    setTimeout(() => {
      if (shouldFadeOut && portalAnimation && typeof portalAnimation.afterFadeOut === "function") {
        portalAnimation.afterFadeOut({ portal, nextPage: currentPage });
      }

      document.body.classList.remove("cad-active");

      fetch(pageConfig.path)
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          if (pageTransition && typeof pageTransition.applyTranslations === "function") {
            pageTransition.applyTranslations(currentLanguage, false);
          }

          const fadeInAll = () => {
            hasLoadedOnce = true;

            if (currentPage === "cad") {
              document.body.classList.add("cad-active");

              if (typeof window.initCadPortfolio === "function") {
                window.initCadPortfolio();
              }
            }

            if (pageTransition && typeof pageTransition.fadeInShell === "function") {
              pageTransition.fadeInShell({ container, header, footer });
            } else {
              setShellLoaded(shellElements, true);
            }

            if (isHomePage) {
              updateHeaderMenuState(currentPage);
            }
          };

          if (portalAnimation && typeof portalAnimation.onHomePageLoaded === "function") {
            portalAnimation.onHomePageLoaded({
              portal,
              animationHref: pageConfig.animation,
              nextPage: currentPage
            });
          }

          if (pageConfig.css) {
            pageStyle.onload = fadeInAll;
            pageStyle.href = pageConfig.css;
          } else {
            fadeInAll();
          }

          if (pageStyleLight) {
            const lightHref = pageConfig.cssLight;
            if (lightHref) {
              pageStyleLight.href = lightHref;
            } else {
              pageStyleLight.removeAttribute("href");
            }
          }
        })
        .catch(err => {
          console.error("Error loading page:", err);
          hasLoadedOnce = true;
          container.innerHTML = "<h1>Error loading page</h1>";
        });
    }, shouldFadeOut ? FADE_OUT_MS : 0);
  }


  window.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("language") || "en";
    currentLanguage = savedLanguage;

    loadPage();
    initHeaderMenu();
    updateHeaderMenuState(currentPage);
    initLanguageSwitcher();
    initThemeSwitcher();
  });
  window.addEventListener("hashchange", loadPage);

  function initHeaderMenu() {
    headerMenuBtn = document.getElementById("header-menu-btn");
    headerMenuPanel = document.getElementById("header-menu-panel");
    languageMenu = document.getElementById("language-menu");
    languageBtn = document.getElementById("language-btn");

    if (!headerMenuBtn || !headerMenuPanel) return;

    const closeInnerMenus = () => {
      if (languageMenu) {
        languageMenu.classList.add("hidden");
      }
      if (languageBtn) {
        languageBtn.setAttribute("aria-expanded", "false");
      }
    };

    const setMenuOpen = isOpen => {
      headerMenuPanel.classList.toggle("hidden", !isOpen);
      headerMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (!isOpen) {
        closeInnerMenus();
      }
    };

    headerMenuBtn.addEventListener("click", event => {
      event.stopPropagation();
      setMenuOpen(headerMenuPanel.classList.contains("hidden"));
    });

    document.addEventListener("click", event => {
      if (!headerMenuPanel.classList.contains("hidden") && !headerMenuPanel.contains(event.target) && !headerMenuBtn.contains(event.target)) {
        setMenuOpen(false);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeHeaderMenu();
      }
    });
  }

  function initThemeSwitcher() {
    const themeBtn = document.getElementById("theme-btn");
    const moonIcon = document.querySelector(".moon-icon");
    const sunIcons = document.querySelectorAll(".sun-icon");
    const bgVideoEl = document.querySelector("#background-video video");
    const body = document.body;
    
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);

    themeBtn.addEventListener("click", () => {
      const currentTheme = body.classList.contains("light-theme") ? "light" : "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });

    function applyTheme(theme) {
      if (theme === "light") {
        body.classList.add("light-theme");
        if (bgVideoEl) {
          bgVideoEl.pause();
        }
        if (moonIcon) moonIcon.style.display = "block";
        sunIcons.forEach(icon => icon.style.display = "none");
        themeBtn.setAttribute("aria-pressed", "true");
      } else {
        body.classList.remove("light-theme");
        if (bgVideoEl && bgVideoEl.paused) {
          const playPromise = bgVideoEl.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        }
        if (moonIcon) moonIcon.style.display = "none";
        sunIcons.forEach(icon => icon.style.display = "block");
        themeBtn.setAttribute("aria-pressed", "false");
      }
    }
  }

  function initLanguageSwitcher() {
    const langBtn = document.getElementById("language-btn");
    const langMenu = document.getElementById("language-menu");
    if (!langBtn || !langMenu) return;

    const setLanguageMenuOpen = isOpen => {
      langMenu.classList.toggle("hidden", !isOpen);
      langBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    langBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = langMenu.classList.contains("hidden");
      setLanguageMenuOpen(isOpen);
    });

    document.addEventListener("click", e => {
      if (!langMenu.classList.contains("hidden") && !langBtn.contains(e.target)) {
        setLanguageMenuOpen(false);
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
        }
        closeHeaderMenu();
      });
    });
  }
})();
