const express = require('express');
const bodyParser = require("body-parser");

const app = express();

require('dotenv').config();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`${PORT}`);
});

const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;
async function insertName(nom) {
    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(process.env.MONGODB_DATABASE);
        const collection = db.collection(process.env.MONGODB_COLLECTION);

        await collection.insertOne({
            name: nom,
        });

        console.log("Messages inserted");
    } catch (error) {
        console.log(error);
    }

    client.close();
}

async function getLastName() {
    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(process.env.MONGODB_DATABASE);
        const collection = db.collection(process.env.MONGODB_COLLECTION);

        const response = await collection.find().sort({ _id: -1 }).limit(1).toArray();

        return response;
    } catch (error) {
        console.log(error);
        return "error";
    }

    client.close();
}


app.post("/", (req, res) => {
    const nom = req.body.nom;
    if (nom != undefined) {
        insertName(nom);
        res.send("Bienvenue, " + nom + ".");
    } else {
        res.send("Il manque votre nom.");
    }
});

app.get("/", async (req, res) => {
    const nom = await getLastName();
    if (nom[0]["name"] != undefined) {
        res.send("La dernière personne que j'ai rencontrée est: " + nom[0]["name"] + ".");
    }
    else if (nom === "error") {
        res.send("J'ai perdu la mémoire...");
    }
    else {
        res.send("Je n'ai rencontré personne pour l'instant");
    }
});

