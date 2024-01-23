const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
// const mongodb = require('mongodb');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5000",
    ],

    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.52hv04l.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        app.get('/', (req, res) => {
            res.send('Hello World! The server is walking... Not running...')
        })

        const database = client.db("HouseHunter");

        const users = database.collection("users");
        const currentUsers = database.collection("currentUsers");
        const houses = database.collection("houses");
        const bookedHouses = database.collection("bookedHouses");

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        // Create a new user

        // app.post('/users', async (req, res) => {
        //     const newUser = req.body;
        //     const result = await users.insertOne(newUser);
        //     if (result) {
        //         res.status(201).send(result);
        //     } else {
        //         res.status(500).send({ error: 'Internal Server Error' });
        //     }
        // });

        app.post('/users', async (req, res) => {
            const newUser = req.body;

            // Check if user with the same email already exists
            const existingUser = await users.findOne({ email: newUser.email });

            if (existingUser) {
                // User with the same email already exists, send a meaningful error message
                return res.status(400).send({ error: 'User with this email already exists.' });
            }

            // If user does not exist, proceed with registration
            const result = await users.insertOne(newUser);

            if (result.insertedCount === 1) {
                // User successfully registered
                res.status(201).send(result);
            } else {
                // Internal Server Error
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Login API endpoint

        app.post('/users/current-user', async (req, res) => {
            const newUser = req.body;
            const existingUser = await users.findOne({
                email: newUser.email,
                password: newUser.password,
            });

            if (!existingUser) {
                return res.status(402).send({ message: "Email and password mismatched! Try again." })
            }

            const currentExistingUser = await currentUsers.findOne({
                email: newUser.email,
                password: newUser.password
            })

            if (currentExistingUser) {
                return res.status(401).send({ message: "You are already logged in." })
            }

            const result = await currentUsers.insertOne(existingUser);

            if (result) {
                res.status(201).send(result);
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // logout

        app.delete('/logout/:email', async (req, res) => {
            const email = req.params.email;
            const result = await currentUsers.deleteMany({})
            res.send(result);
        })

        // Get all users
        app.get('/users', async (req, res) => {
            const allUsers = await users.find().toArray();
            res.send(allUsers);
        });

        app.get('/users/current-user', async (req, res) => {
            const allUsers = await currentUsers.find().toArray();
            res.send(allUsers);
        });

        // Get a specific user by ID
        app.get('/users/:id', async (req, res) => {
            const userId = new mongodb.ObjectId(req.params.id);
            const user = await users.findOne({ _id: userId });

            if (!user) {
                res.status(404).send({ error: 'User not found' });
            } else {
                res.send(user);
            }
        });

        // Update a user by ID
        app.put('/users/:id', async (req, res) => {
            const userId = new mongodb.ObjectId(req.params.id);
            const updatedUser = req.body;

            const result = await users.updateOne({ _id: userId }, { $set: updatedUser });

            if (result.modifiedCount === 0) {
                res.status(404).send({ error: 'User not found' });
            } else {
                res.send({ message: 'User updated successfully' });
            }
        });

        // Delete a user by ID
        app.delete('/users/:id', async (req, res) => {
            const userId = new mongodb.ObjectId(req.params.id);
            const result = await users.deleteOne({ _id: userId });

            if (result.deletedCount === 0) {
                res.status(404).send({ error: 'User not found' });
            } else {
                res.send({ message: 'User deleted successfully' });
            }
        });

        // Create a new house
        app.post('/houses', async (req, res) => {
            const newHouse = req.body;
            const result = await houses.insertOne(newHouse);
            if (result) {
                res.status(201).send(result.ops[0]);
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Get all houses
        app.get('/houses', async (req, res) => {
            const allHouses = await houses.find().toArray();
            res.send(allHouses);
        });

        // Get a specific house by ID
        app.get('/houses/:id', async (req, res) => {
            const houseId = new mongodb.ObjectId(req.params.id);
            const house = await houses.findOne({ _id: houseId });

            if (!house) {
                res.status(404).send({ error: 'House not found' });
            } else {
                res.send(house);
            }
        });

        // Update a house by ID
        app.put('/houses/:id', async (req, res) => {
            const houseId = new mongodb.ObjectId(req.params.id);
            const updatedHouse = req.body;

            const result = await houses.updateOne({ _id: houseId }, { $set: updatedHouse });

            if (result.modifiedCount === 0) {
                res.status(404).send({ error: 'House not found' });
            } else {
                res.send({ message: 'House updated successfully' });
            }
        });

        // Delete a house by ID
        app.delete('/houses/:id', async (req, res) => {
            const houseId = new mongodb.ObjectId(req.params.id);
            const result = await houses.deleteOne({ _id: houseId });

            if (result.deletedCount === 0) {
                res.status(404).send({ error: 'House not found' });
            } else {
                res.send({ message: 'House deleted successfully' });
            }
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})