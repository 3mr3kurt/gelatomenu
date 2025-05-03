/**
 * Test Script: Populate Menu with Random Flavors
 * 
 * This script is for testing purposes only.
 * It adds 48 random flavors to the menu instantly when functions are called.
 */

/**
 * Selects random flavors from the available list
 * @param {Array} allFlavors - List of all available flavors
 * @param {Number} count - Number of flavors to select
 * @returns {Array} - Selected flavors
 */
function getRandomFlavors(allFlavors, count) {
    // Create a copy of the array to avoid modifying the original
    const flavors = [...allFlavors];
    const selectedFlavors = [];
    
    // Make sure we don't try to select more flavors than are available
    count = Math.min(count, flavors.length);
    
    // Randomly select flavors
    for (let i = 0; i < count; i++) {
        // Get a random index
        const randomIndex = Math.floor(Math.random() * flavors.length);
        
        // Add the flavor at that index to the selected list
        selectedFlavors.push(flavors[randomIndex]);
        
        // Remove the selected flavor to avoid duplicates
        flavors.splice(randomIndex, 1);
    }
    
    return selectedFlavors;
}

/**
 * Adds each flavor to the menu by making POST requests
 * @param {Array} flavors - List of flavors to add
 * @returns {Object} - Results of the operation
 */
async function addFlavorsToMenu(flavors) {
    let successCount = 0;
    let failureCount = 0;
    
    // Get current flavors to avoid re-adding them
    const currentResponse = await fetch('/flavors');
    const currentFlavors = await currentResponse.json();
    const currentFlavorNames = currentFlavors.map(f => f.name);
    
    console.log(`Current menu has ${currentFlavorNames.length} flavors`);
    
    // Process each flavor
    for (const flavor of flavors) {
        // Skip if flavor is already on the menu
        if (currentFlavorNames.includes(flavor)) {
            console.log(`Skipping ${flavor} - already on menu`);
            continue;
        }
        
        try {
            // Add the flavor
            const response = await fetch('/flavors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flavor }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                successCount++;
                console.log(`Added: ${flavor}`);
            } else {
                failureCount++;
                console.log(`Failed to add ${flavor}: ${result.message}`);
            }
        } catch (error) {
            failureCount++;
            console.error(`Error adding ${flavor}:`, error);
        }
    }
    
    return { successCount, failureCount };
}

/**
 * Optional: Clear all current flavors from the menu
 */
async function clearAllFlavors() {
    try {
        const response = await fetch('/flavors');
        const currentFlavors = await response.json();
        
        console.log(`Clearing ${currentFlavors.length} flavors from menu...`);
        
        for (const flavor of currentFlavors) {
            await fetch('/flavors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ flavor: flavor.name }),
            });
        }
        
        console.log('All flavors cleared from menu');
    } catch (error) {
        console.error('Error clearing flavors:', error);
    }
} 