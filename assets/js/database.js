const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const uri = 'mongodb+srv://sanam2405:bonvoyage@cluster0.rlxbv1l.mongodb.net/?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri);

// MongoDB database and collection names
const databaseName = "BonVoyageProject";
const collectionName = "Aliporezoo";

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        console.info("Connected to MongoDB");

        // Access the database and collection
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);

        // Fetch and print all documents
        collection.find().toArray()
            .then((documents) => {
                // Print all fields in each document
                documents.forEach((document) => {
                    console.info("name:", document.name);
                    console.info("age:", document.age);
                    console.info("sex:", document.sex);
                    console.info("--------------------"); // Add a separator between documents
                });
            })
            .catch((error) => {
                console.info("Error fetching documents:", error);
            })
            .finally(() => {
                // Close the MongoDB connection
                client.close();
            });
    })
    .catch((error) => {
        console.info("Error connecting to MongoDB:", error);
    });