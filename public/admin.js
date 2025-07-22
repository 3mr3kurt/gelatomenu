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
  const flavorElement = document.createElement("div");
  const imgElement = document.createElement("img");
  imgElement.src = flavor.image;
  imgElement.alt = flavor.name;
  flavorElement.appendChild(imgElement);
  return flavorElement;
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
    .then((response) => response.json())
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
