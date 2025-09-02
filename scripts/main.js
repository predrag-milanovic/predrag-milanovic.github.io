// Set page title
document.getElementById("page-title").textContent = "Home";

// Load the home page into the template
fetch("pages/home.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("page-content").innerHTML = data;
  })
  .catch(error => {
    document.getElementById("page-content").innerHTML = "<h1>Error loading page</h1>";
    console.error(error);
  });
