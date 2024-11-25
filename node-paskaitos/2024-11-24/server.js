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

let categoriesCollection;
let productsCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('test-database-1');
        categoriesCollection = db.collection('categories');
        productsCollection = db.collection('products');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process with failure
    }
}

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await categoriesCollection.find().toArray();
        res.json(categories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.json(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/categoryvalue', async (req, res) => {
    try {
        const categories = await categoriesCollection.find().toArray();
        const categoryValues = {};

        for (const category of categories) {
            const products = await productsCollection.find({ category: category.title }).toArray();
            const totalValue = products.reduce((sum, product) => sum + product.price, 0);
            categoryValues[category.title] = totalValue;
        }

        res.json(categoryValues);
    } catch (error) {
        console.error('Failed to fetch category values:', error);
        res.status(500).json({ error: 'Failed to fetch category values' });
    }
});

connectToDatabase().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
});