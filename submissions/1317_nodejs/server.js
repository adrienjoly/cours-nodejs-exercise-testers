const express = require('express');
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const MongoClient = require('mongodb').MongoClient;
const URL = process.env.MONGODB_URL;
const MongoCollection = process.env.MONGODB_MongoCollection;
const MongoDB = process.env.MONGODB_DATABASE;


let ERROR_SERV = false; 

( async() => {
    const client = new MongoClient(URL);
    try {
        await client.connect();
    } catch (err) {
        console.error(err);
        ERROR_SERV = true;
    }

    app.post('/', async function (req, res) {
        const db = client.db(MongoDB);

        if (req.body.nom != undefined) {
            await db.MongoCollection(MongoCollection).insertOne({ nom: req.body.nom });
            res.send('Bienvenue, ' + req.body.nom + '.') 
        } else {
            res.send('Il manque votre nom.')
        }
    })

    app.get('/', async function (req, res) {
        if (ERROR_SERV) {
            res.send("J'ai perdu la mémoire...")
        }
        const db = client.db(MongoDB);
        const col = db.MongoCollection(MongoCollection);
        let last = await col.find().sort({ _id: -1 }).limit(1).toArray();

        if (last[0].nom) {
            res.send("La dernière personne que j'ai rencontrée est: " + last[0].nom + ".")
        } else {
            res.send("Je n'ai rencontré personne pour l'instant")
        }
    })
})();


app.use(express.json());
app.listen(PORT, () => console.log('Server is listening on port',PORT))