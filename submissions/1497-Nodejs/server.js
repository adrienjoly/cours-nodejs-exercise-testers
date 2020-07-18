const express = require('express');
var fs = require('fs');
const assert = require('assert');
var bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const dbName = process.env.MONGODB_DATABASE;
const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri, { useNewUrlParser: true });

app.use(express.json());

client.connect(err => {

    const db = client.db(dbName);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    app.post('/', function (req, res) {
        const nameFromPost = req.body.name;
        if (nameFromPost) {
            (async function() {
                try {
                    collection.remove({})
                    let user = await collection.insertOne({name:nameFromPost});
                    assert.equal(1, user.insertedCount);
                    res.send(`Bienvenue, " + ${nameFromPost}`);
                } catch (err) {
                    console.log(err.stack);
                    res.send("Il y a un problème...");
                }
            })();
        } else {
            res.send("Il manque votre nom.");
        }
    });

    app.get('/', function (req, res) {
        //Syntaxe proposée par la doc de mongodb: on appelle directement la fonction asynchrone
        (async function() {
            try {
                // Le doc nous arrive sous forme de tableau
                const user = await collection.find({}).toArray();
                if (user && user.length > 0) {
                    res.send(`La dernière personne que j'ai rencontrée est: ${user[0].name}`);
                } else {
                    res.send("Je n'ai rencontré personne pour l'instant");
                }
            } catch (err) {
                console.log(err.stack);
                res.send("J'ai perdu la mémoire...");
            }
        })();
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Example app listening on port 3000!')
});
