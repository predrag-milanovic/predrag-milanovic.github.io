// scripts/main.js
(function () {
  const FADE_OUT_MS = 320;
  const INSERT_DELAY_MS = 50;
  const LANGUAGE_TRANSITION_MS = 300; // Duration for language text transitions
  let currentLanguage = "en"; // Default language

  // Translation object
  const translations = {
    en: {
      name: "Predrag Milanović",
      intro: "Hi, my name is",
      tagline: "and I'm a Mechanical and IT Engineer",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "CV",
      blog: "Blog",
      cvPath: "assets/cv/predrag-milanovic-cv.pdf",
      showBlog: true
    },
    de: {
      name: "Predrag Milanović",
      intro: "Hallo, mein Name ist",
      tagline: "ich bin Maschinenbau- und IT-Ingenieur",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "Lebenslauf",
      blog: "Blog",
      cvPath: "assets/cv/predrag-milanovic-lebenslauf.pdf",
      showBlog: false
    }
  };

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

          // Apply translations after content is loaded
          applyTranslations(currentLanguage, false); // No animation on initial load

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

  // Apply translations to the current page with smooth transitions
  function applyTranslations(language, withAnimation = true) {
    const trans = translations[language];
    if (!trans) return;

    // Get elements that will be translated
    const textElements = [
      { el: document.querySelector('.name'), text: trans.name },
      { el: document.querySelector('.intro'), text: trans.intro },
      { el: document.querySelector('.tagline'), text: trans.tagline }
    ];

    const socialElements = [
      { el: document.querySelector('a[href*="linkedin"] span'), text: trans.linkedin },
      { el: document.querySelector('a[href*="github"] span'), text: trans.github },
      { el: document.querySelector('a[href*="cv"] span'), text: trans.cv }
    ];

    // Get icon elements
    const iconElements = [
      document.querySelector('a[href*="linkedin"] .icon'),
      document.querySelector('a[href*="github"] .icon'),
      document.querySelector('a[href*="cv"] .icon'),
      document.querySelector('a[href="#blog"] .icon')
    ].filter(Boolean);

    // Get other elements
    const cvLink = document.querySelector('a[href*="cv"]');
    const blogBox = document.querySelector('a[href="#blog"]')?.closest('.social-box');
    const socialsContainer = document.querySelector('.socials-container');

    if (withAnimation) {
      // Fade out all text elements and icons
      const allElements = [...textElements, ...socialElements].map(item => item.el).filter(Boolean);
      const allAnimatedElements = [...allElements, ...iconElements];
      
      allAnimatedElements.forEach(el => {
        if (el) {
          el.style.transition = `opacity ${LANGUAGE_TRANSITION_MS}ms ease`;
          el.style.opacity = '0';
        }
      });

      // Also fade out the blog button if it needs to be hidden
      if (blogBox && !trans.showBlog) {
        blogBox.style.transition = `opacity ${LANGUAGE_TRANSITION_MS}ms ease`;
        blogBox.style.opacity = '0';
      }

      // Wait for fade out, then update content and fade in
      setTimeout(() => {
        // Update text content
        textElements.forEach(({ el, text }) => {
          if (el) el.textContent = text;
        });

        socialElements.forEach(({ el, text }) => {
          if (el) el.textContent = text;
        });

        // Update CV link
        if (cvLink) {
          cvLink.href = trans.cvPath;
        }

        // Handle blog button visibility
        if (blogBox) {
          if (trans.showBlog) {
            blogBox.style.display = 'flex';
            setTimeout(() => {
              blogBox.style.opacity = '1';
            }, 50);
          } else {
            blogBox.style.display = 'none';
          }
        }

        // Apply language-specific styling
        applyLanguageSpecificStyling(language, socialsContainer);

        // Fade in all elements
        setTimeout(() => {
          allAnimatedElements.forEach(el => {
            if (el) {
              el.style.opacity = '1';
            }
          });

          // Show blog button if needed
          if (blogBox && trans.showBlog) {
            blogBox.style.opacity = '1';
          }
        }, 50);

      }, LANGUAGE_TRANSITION_MS);

    } else {
      // No animation - direct update
      textElements.forEach(({ el, text }) => {
        if (el) el.textContent = text;
      });

      socialElements.forEach(({ el, text }) => {
        if (el) el.textContent = text;
      });

      // Update CV link
      if (cvLink) {
        cvLink.href = trans.cvPath;
      }

      // Handle blog button visibility
      if (blogBox) {
        blogBox.style.display = trans.showBlog ? 'flex' : 'none';
      }

      // Apply language-specific styling
      applyLanguageSpecificStyling(language, socialsContainer);
    }
  }

  // Apply language-specific styling adjustments
  function applyLanguageSpecificStyling(language, socialsContainer) {
    const body = document.body;
    const introContainer = document.querySelector('.introduction-container');
    const pageContainer = document.querySelector('.page-container');

    // Remove existing language classes
    body.classList.remove('lang-en', 'lang-de');
    
    // Add current language class
    body.classList.add(`lang-${language}`);

    if (language === 'de') {
      // German-specific adjustments
      if (socialsContainer) {
        socialsContainer.style.transition = 'gap 0.3s ease, justify-content 0.3s ease';
        socialsContainer.style.justifyContent = 'center';
        socialsContainer.style.gap = '2rem';
      }

      if (pageContainer) {
        pageContainer.style.transition = 'max-width 0.3s ease';
        pageContainer.style.maxWidth = '700px';
      }
    } else {
      // English (default) - reset to original styles
      if (socialsContainer) {
        socialsContainer.style.transition = 'gap 0.3s ease, justify-content 0.3s ease';
        socialsContainer.style.justifyContent = '';
        socialsContainer.style.gap = '';
      }

      if (pageContainer) {
        pageContainer.style.transition = 'max-width 0.3s ease';
        pageContainer.style.maxWidth = '';
      }
    }
  }

  // --- Event listeners ---
  window.addEventListener("DOMContentLoaded", () => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("language") || "en";
    currentLanguage = savedLanguage;
    
    loadPage();
    initLanguageSwitcher();
    initThemeSwitcher();
  });
  window.addEventListener("hashchange", loadPage);

  // === THEME SWITCHER LOGIC ===
  function initThemeSwitcher() {
    const themeBtn = document.getElementById("theme-btn");
    const moonIcon = document.querySelector(".moon-icon");
    const sunIcons = document.querySelectorAll(".sun-icon");
    
    if (!themeBtn) return;

    // Load saved theme preference
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
        // When in light mode show the moon icon (so clicking it switches to dark)
        if (moonIcon) moonIcon.style.display = "block";
        sunIcons.forEach(icon => icon.style.display = "none");
      } else {
        document.body.classList.remove("light-theme");
        // When in dark mode show the sun icon (so clicking it switches to light)
        if (moonIcon) moonIcon.style.display = "none";
        sunIcons.forEach(icon => icon.style.display = "block");
      }
    }
  }

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
        const selectedLang = item.dataset.lang;
        if (selectedLang && selectedLang !== currentLanguage) {
          currentLanguage = selectedLang;
          localStorage.setItem("language", selectedLang);
          
          // Apply translations with smooth animation
          applyTranslations(currentLanguage, true);
          
          console.log(`Language changed to: ${selectedLang}`);
        }
        langMenu.classList.add("hidden");
      });
    });

    // Apply initial translations without animation
    applyTranslations(currentLanguage, false);
  }
})();
