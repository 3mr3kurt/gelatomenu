document.addEventListener('DOMContentLoaded', function() {
    loadCurrentFlavors();
});

function loadCurrentFlavors() {
    fetch('/flavors')
        .then(response => response.json())
        .then(flavors => {
            const menu = document.getElementById('icecream-menu');
            menu.innerHTML = ''; // Clear current flavors
            flavors.forEach(flavor => {
                const flavorElement = createFlavorElement(flavor);
                menu.appendChild(flavorElement);
            });
        })
        .catch(err => console.error(err));
}

function createFlavorElement(flavor) {
    const flavorElement = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = flavor.image;
    imgElement.alt = flavor.name;
    flavorElement.appendChild(imgElement);
    return flavorElement;
}