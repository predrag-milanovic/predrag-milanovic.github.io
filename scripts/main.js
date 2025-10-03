function loadPage() {
  const hash = window.location.hash || "#home";
  let currentPage = "home";

  for (const key in pages) {
    if (hash === pages[key].route) {
      currentPage = key;
      break;
    }
  }

  console.log("Loading:", currentPage);

  // Apply title
  document.title = pages[currentPage].title;

  const container = document.getElementById("page-content");
  const pageStyle = document.getElementById("page-style");

  // Fade out old content
  container.classList.remove("loaded");

  setTimeout(() => {
    // Fetch new content
    fetch(pages[currentPage].path)
      .then(r => r.text())
      .then(html => {
        container.innerHTML = html;

        // Handle page-specific CSS
        if (pages[currentPage].css) {
          pageStyle.onload = () => {
            // Only fade in AFTER CSS is applied
            setTimeout(() => container.classList.add("loaded"), 50);
          };
          pageStyle.href = pages[currentPage].css;
        } else {
          // No page-specific CSS → fade in right away
          setTimeout(() => container.classList.add("loaded"), 50);
        }
      })
      .catch(err => {
        console.error("Error loading page:", err);
        container.innerHTML = "<h1>Error loading page</h1>";
      });
  }, 200); // matches CSS transition
}

// Initial load
window.addEventListener("DOMContentLoaded", loadPage);

// Handle navigation changes
window.addEventListener("hashchange", loadPage);
