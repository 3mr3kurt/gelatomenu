document.addEventListener('DOMContentLoaded', function() {
    loadCurrentFlavors();
});

function loadCurrentFlavors() {
    fetch('/flavors')
        .then(response => response.json())
        .then(flavors => {
            const menu = document.getElementById('icecream-menu');
            menu.innerHTML = ''; // Clear current flavors
            // Split flavors into groups of 16
            const flavorGroups = [];
            for (let i = 0; i < flavors.length; i += 16) {
                flavorGroups.push(flavors.slice(i, i + 16));
            }

            // Create the first group
            if (flavorGroups.length > 0) {
                displayFlavorGroup(menu, flavorGroups[0]);
            }

            // Create indicators container
            const indicators = document.createElement('div');
            indicators.className = 'page-indicators';
            // Create dot indicators
            flavorGroups.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'indicator-dot';
                if (index === 0) dot.classList.add('active');
                indicators.appendChild(dot);
            });

            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            const progress = document.createElement('div');
            progress.className = 'progress';
            progressBar.appendChild(progress);

            // Add indicators and progress bar after the menu
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'controls-container';
            controlsContainer.appendChild(indicators);
            controlsContainer.appendChild(progressBar);
            menu.parentNode.insertBefore(controlsContainer, menu.nextSibling);

            // Start slideshow if there's more than one group
            if (flavorGroups.length > 1) {
                let currentGroupIndex = 0;
                let timeLeft = 12000;
                const interval = 100; // Update progress every 100ms

                const updateProgress = setInterval(() => {
                    timeLeft -= interval;
                    const percentage = (timeLeft / 12000) * 100;
                    progress.style.width = `${percentage}%`;
                }, interval);

                setInterval(() => {
                    currentGroupIndex = (currentGroupIndex + 1) % flavorGroups.length;
                    displayFlavorGroup(menu, flavorGroups[currentGroupIndex]);
                    // Update dot indicators
                    const dots = indicators.getElementsByClassName('indicator-dot');
                    Array.from(dots).forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentGroupIndex);
                    });
                    // Reset progress bar
                    timeLeft = 12000;
                    progress.style.width = '100%';
                }, 12000);
            }
        })
        .catch(err => console.error(err));
}

function displayFlavorGroup(menu, flavors) {
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