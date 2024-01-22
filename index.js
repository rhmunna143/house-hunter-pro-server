const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongodb = require('mongodb');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.URI;

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

        const database = client.db("HouseHunter");

        const users = database.collection("users");
        const houses = database.collection("houses");

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        app.get('/', (req, res) => {
            res.send('Hello World! The server is walking... Not running...')
        })

        // Create a new user
        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;
                const result = await users.insertOne(newUser);
                res.status(201).send(result.ops[0]);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Get all users
        app.get('/users', async (req, res) => {
            try {
                const allUsers = await users.find().toArray();
                res.send(allUsers);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Get a specific user by ID
        app.get('/users/:id', async (req, res) => {
            try {
                const userId = new mongodb.ObjectId(req.params.id);
                const user = await users.findOne({ _id: userId });

                if (!user) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }

                res.send(user);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Update a user by ID
        app.put('/users/:id', async (req, res) => {
            try {
                const userId = new mongodb.ObjectId(req.params.id);
                const updatedUser = req.body;

                const result = await users.updateOne({ _id: userId }, { $set: updatedUser });

                if (result.modifiedCount === 0) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }

                res.send({ message: 'User updated successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // Delete a user by ID
        app.delete('/users/:id', async (req, res) => {
            try {
                const userId = new mongodb.ObjectId(req.params.id);
                const result = await users.deleteOne({ _id: userId });

                if (result.deletedCount === 0) {
                    res.status(404).send({ error: 'User not found' });
                    return;
                }

                res.send({ message: 'User deleted successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})