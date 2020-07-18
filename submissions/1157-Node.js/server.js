const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

process.env['port'] = "3000";
process.env['MANGODB_URL'] = "mongodb+srv://chatbot:chatbot@firstclassapi-fummx.azure.mongodb.net/partielnode?retryWrites=true&w=majority"
process.env['MANGODB_DATABASE'] = "partiel-node"
process.env['MANGODB_COLLECTION'] = "names"


const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });


(async () => {
    try {

        await client.connect();
        const db = client.db(process.env.MONGODB_DATABASE);
        const callName = db.collection(process.env.MONGODB_COLLECTION)

        app.use(bodyParser.urlencoded({
            extended: true
        }));

        app.get('/', async function (req, res) {
            const name = await callName.find({}).toArray();
            res.send('Hello World!')
        })

        app.post('/', async function (req, res) {
            if (req.body.nom === undefined) {
                res.send('Il manque votre nom.')
            } else {
                const addName = await callName.insertOne({ nom: req.body.nom })
                res.send('Bienvenue, ' + req.body.nom + '.')
            }
        })

        app.listen(process.even.PORT, function () {
            console.log('Le serveur fonctionne sur le port ' + process.env.PORT)
        })

    } catch (err) {

    }
})()