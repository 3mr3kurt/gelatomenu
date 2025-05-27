let isAuthenticated = false;

document.addEventListener("DOMContentLoaded", function () {
  const authSection = document.getElementById("auth-section");
  const adminPanel = document.getElementById("admin-panel");
  const authSubmit = document.getElementById("auth-submit");
  const flavorInput = document.getElementById("flavor-input");
  const flavorSubmit = document.getElementById("flavor-submit");

  authSubmit.addEventListener("click", function () {
    const authCode = document.getElementById("auth-code").value;

    // Verify access code with server
    fetch("/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: authCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          isAuthenticated = true;
          authSection.style.display = "none";
          adminPanel.style.display = "flex";
          loadFlavorOptions();
          loadCurrentFlavors();
        } else {
          alert("Incorrect access code");
        }
      })
      .catch((err) => {
        console.error("Authentication error:", err);
        alert("Authentication failed");
      });
  });

  flavorInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && isAuthenticated) {
      handleFlavorSubmission();
    }
  });

  flavorSubmit.addEventListener("click", function () {
    if (isAuthenticated) {
      handleFlavorSubmission();
    }
  });

  function handleFlavorSubmission() {
    const flavorName = flavorInput.value.trim().toLowerCase();
    if (flavorName) {
      toggleFlavor(flavorName);
    }
    flavorInput.value = ""; // clear the input field
  }
});

function loadFlavorOptions() {
  fetch("/flavors/all")
    .then((response) => response.json())
    .then((flavors) => {
      const datalist = document.getElementById("flavor-list");
      datalist.innerHTML = ""; // Clear existing options
      flavors.forEach((flavor) => {
        const option = document.createElement("option");
        option.value = flavor;
        datalist.appendChild(option);
      });
    })
    .catch((err) => console.error(err));
}

function toggleFlavor(flavorName) {
  fetch("/flavors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ flavor: flavorName }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadCurrentFlavors();
        alert(`Flavor ${data.action}`);
      } else {
        alert(data.message);
      }
    })
    .catch((err) => console.error(err));
}

function loadCurrentFlavors() {
  fetch("/flavors")
    .then((response) => response.json())
    .then((flavors) => {
      const menu = document.getElementById("icecream-menu");
      menu.innerHTML = "";
      flavors.forEach((flavor) => {
        const flavorElement = createFlavorElement(flavor);
        menu.appendChild(flavorElement);
      });
    })
    .catch((err) => console.error(err));
}

function createFlavorElement(flavor) {
  const flavorElement = document.createElement("div");
  const imgElement = document.createElement("img");
  imgElement.src = flavor.image;
  imgElement.alt = flavor.name;
  flavorElement.appendChild(imgElement);
  return flavorElement;
}
