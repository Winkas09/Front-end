// const express = require('express');
// require('dotenv').config();

// const cors = require('cors');
// const bodyParser = require('body-parser');

// const { MongoClient } = require('mongodb');
// const URI = 'mongodb+srv://Winkas09:fwP9U4UEP2FwBffJ@cluster0.vtgt6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// const client = new MongoClient(URI);

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// client.connect().then(() => {
//     const db = client.db('test-database-1');
//     const animalsCollection = db.collection('animals');

//     app.post('/api/animals', async (req, res) => {
//         const { type, age, name, breed, color } = req.body;
//         if (type && age && name && breed && color) {
//             await animalsCollection.insertOne({ type, age, name, breed, color });
//             res.send('Animal added');
//         } else {
//             res.status(400).send('Missing required fields');
//         }
//     });

//     // GET endpoint to retrieve all animals
//     app.get('/api/animals', async (req, res) => {
//         const animals = await animalsCollection.find().toArray();
//         res.send(animals);
//     });

//     // GET endpoint to retrieve animals sorted by a specified field
//     app.get('/api/animals/sorted', async (req, res) => {
//         const { sortBy } = req.query;
//         const validSortFields = ['type', 'age', 'name', 'breed', 'color'];
//         if (validSortFields.includes(sortBy)) {
//             const animals = await animalsCollection.find().sort({ [sortBy]: 1 }).toArray();
//             res.send(animals);
//         } else {
//             res.status(400).send('Invalid sort field');
//         }
//     });

//     app.listen(3000, () => {
//         console.log('Server is running on port 3000');
//     });
// }).catch(error => {
//     console.error(error);
// });

const express = require('express');
require('dotenv').config();

const cors = require('cors');
const bodyParser = require('body-parser');

const { MongoClient } = require('mongodb');
const URI = 'mongodb+srv://Winkas09:fwP9U4UEP2FwBffJ@cluster0.vtgt6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(URI);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.connect().then(() => {
    const db = client.db('test-database-1');
    const animalsCollection = db.collection('animals');

    app.post('/api/animals', async (req, res) => {
        const { type, age, name, breed, color } = req.body;
        if (type && age && name && breed && color) {
            await animalsCollection.insertOne({ type, age, name, breed, color });
            res.send('Animal added');
        } else {
            res.status(400).send('Missing required fields');
        }
    });

    // GET endpoint to retrieve all animals
    app.get('/api/animals', async (req, res) => {
        const animals = await animalsCollection.find().toArray();
        res.send(animals);
    });

    // GET endpoint to retrieve animals sorted by a specified field and filtered by search query
    app.get('/api/animals/sorted', async (req, res) => {
        const { sortBy, searchQuery } = req.query;
        const validSortFields = ['type', 'age', 'name', 'breed', 'color'];
        let query = {};
        if (searchQuery) {
            query = {
                $or: [
                    { type: { $regex: searchQuery, $options: 'i' } },
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { breed: { $regex: searchQuery, $options: 'i' } },
                    { color: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }
        if (validSortFields.includes(sortBy)) {
            const animals = await animalsCollection.find(query).sort({ [sortBy]: 1 }).toArray();
            res.send(animals);
        } else {
            res.status(400).send('Invalid sort field');
        }
    });

    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(error => {
    console.error(error);
});