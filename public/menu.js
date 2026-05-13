document.addEventListener('DOMContentLoaded', function() {
    loadCurrentFlavors();
    setInterval(checkForMenuUpdates, 3000);

    document.querySelectorAll('#tab-bar .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#tab-bar .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.flavor-section').forEach(s => s.classList.remove('active'));
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });
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
    const gelatos = flavors.filter(f => !f.name.toLowerCase().includes('sorbet'))
        .sort((a, b) => a.name.localeCompare(b.name));
    const sorbets = flavors.filter(f => f.name.toLowerCase().includes('sorbet'))
        .sort((a, b) => a.name.localeCompare(b.name));

    const gelatoMenu = document.getElementById('gelato-menu');
    const sorbetMenu = document.getElementById('sorbet-menu');

    gelatoMenu.innerHTML = '';
    sorbetMenu.innerHTML = '';

    gelatos.forEach(flavor => gelatoMenu.appendChild(createFlavorElement(flavor)));
    sorbets.forEach(flavor => sorbetMenu.appendChild(createFlavorElement(flavor)));
}

function createFlavorElement(flavor) {
    const flavorElement = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = flavor.image;
    imgElement.alt = flavor.name;
    flavorElement.appendChild(imgElement);
    return flavorElement;
}