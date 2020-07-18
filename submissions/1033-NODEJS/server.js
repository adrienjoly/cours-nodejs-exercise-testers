const dotenv = require('dotenv');
dotenv.config();
var bodyParser = require('body-parser')
const express = require('express');
var fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const app = express();

const dbName = process.env.MONGODB_COLLECTION;

const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true });

app.use(express.json());

client.connect(err => {
    const db = client.db(dbName);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    //Lorsque l'utilisateur accède à la racine de l'application
    app.get('/', function (req, res) {
         
        (async function() {
            try {
                const user = await collection.find({}).toArray();

                if (user) {
                    res.send("La dernière personne que j'ai rencontrée est: " + user[0].name);
                } else {
                    res.send("Je n'ai rencontré personne pour l'instant");
                }
            } catch (err) {
                res.send("J'ai perdu la mémoire...");
            }
        })();
    });

    // Lorsque nous voulons ajouter une nouvel utilisateur
    app.post('/', function (req, res) {

        const curl = req.body.name;

        if (curl) {
            (async function() {
                try {

                    collection.remove()
                    let addUser = await collection.insertOne({name:curl});
                    assert.equal(1, addUser.insertedCount);
                    res.send("Bienvenue, " + curl);
                } catch (err) {
                    res.send("J'ai perdu la mémoire...");
                }
            })();
        }
        else {
            res.send("Il manque votre nom.");
        }
    });

});

app.listen(process.env.PORT, function () {
    console.log('Example app listening on port 3000!')
});
