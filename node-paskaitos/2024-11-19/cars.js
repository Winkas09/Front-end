const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const URI = process.env.MONGODB_URI || 'mongodb+srv://Winkas09:fwP9U4UEP2FwBffJ@cluster0.vtgt6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(URI);

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('test-database-1');
    const carProjectCollection = db.collection('car-project');

    // Get all cars
    app.get('/api/car-project', async (req, res) => {
      try {
        const cars = await carProjectCollection.find().toArray();
        res.json(cars);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
        res.status(500).json({ error: 'Failed to fetch cars' });
      }
    });

    // Get a car by ID
    app.get('/api/car-project/:id', async (req, res) => {
      try {
        const car = await carProjectCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (car) {
          res.json(car);
        } else {
          res.status(404).json({ error: 'Car not found' });
        }
      } catch (error) {
        console.error('Failed to fetch car:', error);
        res.status(500).json({ error: 'Failed to fetch car' });
      }
    });

    // Add a new car
    app.post('/api/car-project', async (req, res) => {
      try {
        const result = await carProjectCollection.insertOne(req.body);
        res.status(201).json(result.ops[0]);
      } catch (error) {
        console.error('Failed to add car:', error);
        res.status(500).json({ error: 'Failed to add car' });
      }
    });

    // Update a car by ID
    app.put('/api/car-project/:id', async (req, res) => {
      try {
        const result = await carProjectCollection.findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { returnOriginal: false }
        );
        if (result.value) {
          res.json(result.value);
        } else {
          res.status(404).json({ error: 'Car not found' });
        }
      } catch (error) {
        console.error('Failed to update car:', error);
        res.status(500).json({ error: 'Failed to update car' });
      }
    });

    // Delete a car by ID
    app.delete('/api/car-project/:id', async (req, res) => {
      try {
        const result = await carProjectCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 1) {
          res.json({ message: 'Car deleted' });
        } else {
          res.status(404).json({ error: 'Car not found' });
        }
      } catch (error) {
        console.error('Failed to delete car:', error);
        res.status(500).json({ error: 'Failed to delete car' });
      }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

startServer();