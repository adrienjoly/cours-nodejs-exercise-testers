const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));




app.post('/', function (req, res) {
    let name = req.query.nom
    if (name) {
        res.send('Bienvenue, ' + req.query.nom + '.')
    } else {
        res.send('Il manque votre nom.')
    }

});

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = process.env.MONGODB_URL || "mongodb+srv://cluster0.p62r1.mongodb.net/<partiel>";
let collection;

(async function () {

    try {
        const client = new MongoClient(url, {
            useNewUrlParser: true
        });
        // Use connect method to connect to the Server
        await client.connect();
        const db = process.env.MONGODB_DATABASE || client.db("partiel");
        collection = process.env.MONGODB_COLLECTION || db.collection("nom");

    } catch (err) {
        console.log(err.stack);
    }

})();

app.get('/', async function (req, res) {

    // Select last name
    const lastName = await collection.find({from: nom}).sort({_id: -1}).limit(1).toArray();
    if (lastName) {
        res.send('La dernière personne que j\'ai rencontrée est: ' + lastName + '.')
    }else if (lastName === "") {
        res.send('Je n\'ai rencontré personne pour l\'instant')
    } else {
        res.send('J\'ai perdu la mémoire...')
    }

    await collection.insertOne({
        from: 'nom',
        msg: req.query.msg
    });
});

