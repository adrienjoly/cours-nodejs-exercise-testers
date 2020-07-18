const PORT = process.env.PORT || 3000;
const fs = require("fs");
const express = require("express");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI || "mongodb+srv://chloe:ecologie@cluster0-ljllu.mongodb.net/test?retryWrites=true&w=majority";


(async function () {
    try {
        const client = new MongoClient(uri, {
            useNewUrlParser: true
        });
        await client.connect();
        const data = client.db("nodejs_mongo");
        collection = data.collection("nom");
    } catch (err) {
        console.log(err.stack);
    }

})();


(async () => {
    app.get('/', async function (req, res) {

        const namebdd = await collection.find({
            from: nom
        }).sort({
            _id: -1
        }).limit(1).toArray();
        if (namebdd) {
            res.send('La dernière personne que j\'ai rencontrée est: ' + namebdd + '.')
        } else if (namebdd === "") {
            res.send('Je n\'ai rencontré personne pour l\'instant')
        } else {
            res.send('J\'ai perdu la mémoire...')
        }

        await collection.insertOne({
            from: 'nom',
            msg: req.query.msg
        });
    });


    app.post('/', function (req, res) {
        if (req.body.nom != undefined) {
            res.send('Bienvenue, ' + req.body.nom + '.')
        } else {
            res.send('Il manque votre nom.')
        }
    })



    app.listen(PORT, function () {
        console.log("The server is listening on port", PORT);
    });

});