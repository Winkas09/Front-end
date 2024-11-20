const express = require('express');
require('dotenv').config();

const cors = require('cors');
const bodyParser = require('body-parser');

const { MongoClient } = require('mongodb');
const URI = process.env.MONGODB_URI || 'mongodb+srv://Winkas09:fwP9U4UEP2FwBffJ@cluster0.vtgt6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(URI);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let animalsCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('test-database-1');
        animalsCollection = db.collection('animals');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process with failure
    }
}

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

// GET endpoint to retrieve animals based on search phrase and optionally sort by a specified field
app.get('/api/animals/search', async (req, res) => {
    const { searchPhrase, sortBy } = req.query;
    const validSortFields = ['type', 'age', 'name', 'breed', 'color'];
    let query = {};

    if (searchPhrase) {
        query = {
            $or: [
                { type: { $regex: searchPhrase, $options: 'i' } },
                { name: { $regex: searchPhrase, $options: 'i' } },
                { breed: { $regex: searchPhrase, $options: 'i' } },
                { color: { $regex: searchPhrase, $options: 'i' } }
            ]
        };
    }

    let sort = {};
    if (sortBy && validSortFields.includes(sortBy)) {
        sort[sortBy] = -1;
    }

    const animals = await animalsCollection.find(query).sort(sort).toArray();
    res.send(animals);
});

connectToDatabase().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});