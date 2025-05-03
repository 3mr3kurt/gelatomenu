document.addEventListener('DOMContentLoaded', function() {
    loadCurrentFlavors();
    // Set up polling to check for menu updates every 5 seconds
    setInterval(checkForMenuUpdates, 3000);
});

// Store the current flavors to detect changes
let currentFlavorsList = [];

function checkForMenuUpdates() {
    fetch('/flavors')
        .then(response => response.json())
        .then(flavors => {
            // Check if the flavors list has changed
            if (hasMenuChanged(flavors)) {
                console.log('Menu updated, refreshing display');
                currentFlavorsList = JSON.parse(JSON.stringify(flavors)); // Deep copy
                updateMenuDisplay(flavors);
            }
        })
        .catch(err => console.error('Error checking for updates:', err));
}

function hasMenuChanged(newFlavors) {
    // If different number of flavors, menu has changed
    if (newFlavors.length !== currentFlavorsList.length) {
        return true;
    }
    // Check if any flavors have been added or removed
    for (let i = 0; i < newFlavors.length; i++) {
        const newFlavor = newFlavors[i];
        const existingFlavor = currentFlavorsList.find(f => f.name === newFlavor.name);
        if (!existingFlavor) {
            return true; // New flavor added
        }
    }
    return false;
}

function loadCurrentFlavors() {
    fetch('/flavors')
        .then(response => response.json())
        .then(flavors => {
            currentFlavorsList = JSON.parse(JSON.stringify(flavors)); // Store a deep copy
            updateMenuDisplay(flavors);
        })
        .catch(err => console.error('Error loading flavors:', err));
}

function updateMenuDisplay(flavors) {
    const menu = document.getElementById('icecream-menu');
    menu.innerHTML = ''; // Clear current flavors
    flavors.forEach(flavor => {
        const flavorElement = createFlavorElement(flavor);
        menu.appendChild(flavorElement);
    });
}

function createFlavorElement(flavor) {
    const flavorElement = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = flavor.image;
    imgElement.alt = flavor.name;
    flavorElement.appendChild(imgElement);
    return flavorElement;
}