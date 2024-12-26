const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

const allFlavors = require('./flavors.json');
let currentFlavors = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/flavors', (req, res) => {
    res.json(currentFlavors);
});

app.get('/flavors/all', (req, res) => {
    res.json(Object.keys(allFlavors));
});

app.post('/flavors', (req, res) => {
    const { flavor } = req.body;
    if (allFlavors[flavor]) {
        const index = currentFlavors.findIndex(f => f.name === flavor);
        if (index === -1) {
            currentFlavors.push({ name: flavor, image: allFlavors[flavor] });
            res.json({ success: true, message: 'Flavor added', action: 'added' });
        } else {
            currentFlavors.splice(index, 1);
            res.json({ success: true, message: 'Flavor removed', action: 'removed' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid flavor' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});