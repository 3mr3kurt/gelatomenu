const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const flavors = require('./flavors.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/flavors/:flavor_name', (req, res) => {
    const { flavor_name } = req.params;
    const imagePath = flavors[flavor_name];
    if (imagePath) {
        res.json({ flavor_name, image_path: imagePath });
    } else {
        res.status(404).send('Flavor not found');
    }
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
