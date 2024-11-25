const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const URI = process.env.MONGODB_URI || 'mongodb+srv://Winkas09:fwP9U4UEP2FwBffJ@cluster0.vtgt6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(URI);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let albumsCollection;
let usersCollection;
let postsCollection;
let commentsCollection;

async function connectToDatabase() {
    try {
        await client.connect();
        const db = client.db('test-database-1');
        albumsCollection = db.collection('albums');
        usersCollection = db.collection('users');
        postsCollection = db.collection('posts');
        commentsCollection = db.collection('comments');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit the process with failure
    }
}

// Get all albums
app.get('/api/albums', async (req, res) => {
    try {
        const albums = await albumsCollection.find().toArray();
        res.json(albums);
    } catch (error) {
        console.error('Failed to fetch albums:', error);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// Get an album by ID with user details
app.get('/api/albums/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const album = await albumsCollection.aggregate([
            { $match: { _id: ObjectId.createFromHexString(id) } },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' }
        ]).next();

        if (album) {
            res.json(album);
        } else {
            res.status(404).json({ error: 'Album not found' });
        }
    } catch (error) {
        console.error('Failed to fetch album:', error);
        res.status(500).json({ error: 'Failed to fetch album' });
    }
});

// Add a new album
app.post('/api/albums', async (req, res) => {
    try {
        const result = await albumsCollection.insertOne(req.body);
        res.status(201).json({ _id: result.insertedId, ...req.body });
    } catch (error) {
        console.error('Failed to add album:', error);
        res.status(500).json({ error: 'Failed to add album' });
    }
});

// Update an album by ID
app.put('/api/albums/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await albumsCollection.findOneAndUpdate(
            { _id: ObjectId.createFromHexString(id) },
            { $set: req.body },
            { returnOriginal: false }
        );

        if (result.value) {
            res.json(result.value);
        } else {
            res.status(404).json({ error: 'Album not found' });
        }
    } catch (error) {
        console.error('Failed to update album:', error);
        res.status(500).json({ error: 'Failed to update album' });
    }
});

// Delete an album by ID
app.delete('/api/albums/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await albumsCollection.deleteOne({ _id: ObjectId.createFromHexString(id) });

        if (result.deletedCount === 1) {
            res.json({ message: 'Album deleted' });
        } else {
            res.status(404).json({ error: 'Album not found' });
        }
    } catch (error) {
        console.error('Failed to delete album:', error);
        res.status(500).json({ error: 'Failed to delete album' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const connection = await client.connect();
        const users = await connection.db('test-database-1').collection('users').find().toArray();
        await connection.close();
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get a user by ID with posts and albums
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const user = await connection.db('test-database-1').collection('users').aggregate([
            { $match: { _id: ObjectId.createFromHexString(id) } },
            { $lookup: { from: 'posts', localField: '_id', foreignField: 'userId', as: 'posts' } },
            { $lookup: { from: 'albums', localField: '_id', foreignField: 'userId', as: 'albums' } }
        ]).next();
        await connection.close();

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to fetch user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Add a new user
app.post('/api/users', async (req, res) => {
    const newUserData = req.body;

    try {
        const connection = await client.connect();
        const result = await connection.db('test-database-1').collection('users').insertOne(newUserData);
        await connection.close();
        res.status(201).json({ _id: result.insertedId, ...newUserData });
    } catch (error) {
        console.error('Failed to add user:', error);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Update a user by ID
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const objectId = ObjectId.createFromHexString(id);
        console.log(`Updating user with ID: ${objectId}`);
        
        const result = await connection.db('test-database-1').collection('users').updateOne(
            { _id: objectId },
            { $set: req.body }
        );
        await connection.close();

        if (result.matchedCount === 1) {
            console.log('User updated');
            res.json({ message: 'User updated' });
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const result = await connection.db('test-database-1').collection('users').deleteOne({ _id: ObjectId.createFromHexString(id) });
        await connection.close();

        if (result.deletedCount === 1) {
            res.json({ message: 'User deleted' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const connection = await client.connect();
        const posts = await connection.db('test-database-1').collection('posts').find().toArray();
        await connection.close();
        res.json(posts);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a post by ID with user and comments
app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const post = await connection.db('test-database-1').collection('posts').aggregate([
            { $match: { _id: ObjectId.createFromHexString(id) } },
            { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $lookup: { from: 'comments', localField: '_id', foreignField: 'postId', as: 'comments' } }
        ]).next();
        await connection.close();

        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Failed to fetch post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Add a new post
app.post('/api/posts', async (req, res) => {
    const newPostData = req.body;

    try {
        const connection = await client.connect();
        const result = await connection.db('test-database-1').collection('posts').insertOne(newPostData);
        await connection.close();
        res.status(201).json({ _id: result.insertedId, ...newPostData });
    } catch (error) {
        console.error('Failed to add post:', error);
        res.status(500).json({ error: 'Failed to add post' });
    }
});

// Update a post by ID
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const objectId = ObjectId.createFromHexString(id);
        console.log(`Updating post with ID: ${objectId}`);
        
        const result = await connection.db('test-database-1').collection('posts').updateOne(
            { _id: objectId },
            { $set: req.body }
        );
        await connection.close();

        if (result.matchedCount === 1) {
            console.log('Post updated');
            res.json({ message: 'Post updated' });
        } else {
            console.log('Post not found');
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Failed to update post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete a post by ID
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await client.connect();
        const result = await connection.db('test-database-1').collection('posts').deleteOne({ _id: ObjectId.createFromHexString(id) });
        await connection.close();

        if (result.deletedCount === 1) {
            res.json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

connectToDatabase().then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
});