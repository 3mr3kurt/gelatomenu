let isAuthenticated = false;

document.addEventListener("DOMContentLoaded", function () {
  const authSection = document.getElementById("auth-section");
  const adminPanel = document.getElementById("admin-panel");
  const authSubmit = document.getElementById("auth-submit");
  const flavorInput = document.getElementById("flavor-input");
  const flavorSubmit = document.getElementById("flavor-submit");
  const titleInput = document.getElementById("title-input");
  const titleSubmit = document.getElementById("title-submit");

  authSubmit.addEventListener("click", function () {
    const authCode = document.getElementById("auth-code").value;
    authenticateUser(authCode);
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

  titleInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && isAuthenticated) {
      handleTitleSubmission();
    }
  });

  titleSubmit.addEventListener("click", function () {
    if (isAuthenticated) {
      handleTitleSubmission();
    }
  });

  function handleFlavorSubmission() {
    const flavorName = flavorInput.value.trim().toLowerCase();
    if (flavorName) {
      toggleFlavor(flavorName);
    }
    flavorInput.value = ""; // clear the input field
  }

  function handleTitleSubmission() {
    const newTitle = titleInput.value.trim();
    if (newTitle) {
      updateTitle(newTitle);
    }
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

function loadCurrentTitle() {
  fetch("/title")
    .then((response) => response.json())
    .then((data) => {
      const titleInput = document.getElementById("title-input");
      titleInput.value = data.title;
    })
    .catch((err) => console.error("Error loading title:", err));
}

function updateTitle(newTitle) {
  fetch("/title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: newTitle }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Title updated successfully!");
      } else {
        alert(data.message || "Error updating title");
      }
    })
    .catch((err) => {
      console.error("Error updating title:", err);
      alert("Error updating title");
    });
}



function authenticateUser(accessCode) {
  fetch("/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessCode }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        isAuthenticated = true;
        document.getElementById("auth-section").style.display = "none";
        document.getElementById("admin-panel").style.display = "flex";
        loadFlavorOptions();
        loadCurrentFlavors();
        loadCurrentTitle();
      } else {
        alert("Incorrect access code");
      }
    })
    .catch((err) => {
      console.error("Authentication error:", err);
      alert("Authentication failed. Please try again.");
    });
}
