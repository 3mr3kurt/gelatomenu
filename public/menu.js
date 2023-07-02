// Array of flavors currently in the case

let flavorsInCase = JSON.parse(localStorage.getItem('flavorsInCase')) || [];

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const flavorName = document.getElementById('flavor-input').value;
        if (flavorName) {
            if (flavorsInCase.includes(flavorName)) {
                removeFlavor(flavorName);
            } else {
                addFlavor(flavorName);
            }
        }
        document.getElementById('flavor-input').value = ''; // clear the input field
    }
});

document.getElementById('flavor-input').addEventListener('blur', function() {
    setTimeout(() => this.focus(), 0);
});



function addFlavor(flavorName) {
    fetch(`http://localhost:3000/flavors/${flavorName}`)
        .then(response => response.json())
        .then(flavorData => {
            const flavorElement = createFlavorElement(flavorData);
            const menu = document.getElementById('icecream-menu');
            menu.appendChild(flavorElement);
            flavorsInCase.push(flavorName); // add flavor to the list of flavors in the case

            localStorage.setItem('flavorsInCase', JSON.stringify(flavorsInCase));
        })
        .catch(err => console.error(err));
}


function removeFlavor(flavorName) {
    const menu = document.getElementById('icecream-menu');
    const flavorElements = Array.from(menu.getElementsByTagName('div')); // converting HTMLCollection to array
    for (let i = 0; i < flavorElements.length; i++) {
        if (flavorElements[i].getElementsByClassName('flavor-name')[0].textContent === flavorName) {
            menu.removeChild(flavorElements[i]);
            const index = flavorsInCase.indexOf(flavorName); // find index of the flavor in the list
            if (index > -1) {
                flavorsInCase.splice(index, 1); // remove flavor from the list

                localStorage.setItem('flavorsInCase', JSON.stringify(flavorsInCase));
            }
            break;
        }
    }
}


function createFlavorElement(flavorData) {
    const flavorElement = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = flavorData.image_path;

    const nameElement = document.createElement('p');
    nameElement.className = 'flavor-name';
    nameElement.textContent = flavorData.flavor_name;

    flavorElement.appendChild(nameElement);
    flavorElement.appendChild(imgElement);

    return flavorElement;
}

flavorsInCase.forEach(flavor => {
    fetch(`http://localhost:3000/flavors/${flavor}`)
        .then(response => response.json())
        .then(flavorData => {
            const flavorElement = createFlavorElement(flavorData);
            const menu = document.getElementById('icecream-menu');
            menu.appendChild(flavorElement);
        })
        .catch(err => console.error(err));
});
