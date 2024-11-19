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

app.get('/api/people', async (req, res) => {
    try {

        const connection = await client.connect()
        const peopleData = await connection.db('test-database-1').collection('people').find().toArray();
        console.log(peopleData);
        
        await connection.close();
        
        res.send(peopleData);
    } catch (error) {
        res.status(500).send({ error });
    }
} );

app.post ('/api/people', async (req, res) => {
    try {

        const newPeopleData = {
            name: 'John',
            surname: 'Doe',
            age: 25,
        }
        const connection = await client.connect()
        const responseData = await connection.db('test-database-1').collection('people').insertOne(newPeopleData);

        await connection.close();

        res.send(responseData);
    } catch (error) {
        res.status(500).send({ error });
    }
} );


app.get('/api/cars', async (req, res) => {
    try {

        const connection = await client.connect()
        const carsData = await connection.db('test-database-1').collection('cars').find().toArray();
        console.log(carsData);
        
        await connection.close();
        
        res.send(carsData);
    } catch (error) {
        res.send(error);
    }
} );

app.post ('/api/cars', async (req, res) => {
    try {

        const newCarData = {
            brand: 'Toyota',
            model: 'Corolla',
            year: 2021,
        }
        const connection = await client.connect()
        const responseData = await connection.db('test-database-1').collection('cars').insertOne(newCarData);
        
        await connection.close();
        
        res.send(responseData);
    } catch (error) {
        res.status(500).send({ error });
    }
} );

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});