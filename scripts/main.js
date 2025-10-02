// Set page title
document.getElementById("page-title").textContent = "Home";

// Load the home page into the template
fetch("/pages/home.html")
  .then(response => response.text())
  .then(data => {
    const container = document.getElementById("page-content");
    container.innerHTML = data;

    // Trigger fade-in after a tiny delay
    setTimeout(() => {
      container.classList.add("loaded");
    }, 100);
  })
  .catch(error => {
    document.getElementById("page-content").innerHTML = "<h1>Error loading page</h1>";
    console.error(error);
  });
