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
      const gelatos = flavors
        .filter((f) => !f.name.toLowerCase().includes("sorbet"))
        .sort((a, b) => a.name.localeCompare(b.name));
      const sorbets = flavors
        .filter((f) => f.name.toLowerCase().includes("sorbet"))
        .sort((a, b) => a.name.localeCompare(b.name));

      const gelatoMenu = document.getElementById("admin-gelato-menu");
      const sorbetMenu = document.getElementById("admin-sorbet-menu");

      gelatoMenu.innerHTML = "";
      sorbetMenu.innerHTML = "";

      gelatos.forEach((f) => gelatoMenu.appendChild(createFlavorElement(f)));
      sorbets.forEach((f) => sorbetMenu.appendChild(createFlavorElement(f)));
    })
    .catch((err) => console.error(err));
}

function createFlavorElement(flavor) {
  const el = document.createElement("div");
  el.classList.add("admin-flavor-card");

  const img = document.createElement("img");
  img.src = flavor.image;
  img.alt = flavor.name;
  el.appendChild(img);

  const overlay = document.createElement("div");
  overlay.classList.add("remove-overlay");
  el.appendChild(overlay);

  let holdTimer = null;

  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    el.classList.add("holding");
    holdTimer = setTimeout(() => {
      holdTimer = null;
      el.classList.remove("holding");
      el.classList.add("confirmed");
      setTimeout(() => toggleFlavor(flavor.name), 200);
    }, 600);
  });

  function cancel() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
      el.classList.remove("holding");
    }
  }

  el.addEventListener("pointerup", cancel);
  el.addEventListener("pointercancel", cancel);

  return el;
}
