const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
require("dotenv").config();
const URL = process.env.MONGODB_URL;
const COLLECTION = process.env.MONGODB_COLLECTION;
const DBNAME = process.env.MONGODB_DATABASE;

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`))

let ERROR_SERV = false; 

( async() => {

    const client = new MongoClient(URL);
    try {
        await client.connect();
    } catch (err) {
        ERROR_SERV = true;
    }

    app.post('/', async function (req, res) {
        const db = client.db(DBNAME);

        if (req.body.nom != undefined) {
            await db.collection(COLLECTION).insertOne({ nom: req.body.nom });
            res.send('Bienvenue, '+req.body.nom+'.') 
        } else {
            res.send('Il manque votre nom.')
        }
    })
    
    app.get('/', async function (req, res) {
        if (ERROR_SERV) {
            res.send('J\'ai perdu la mémoire...')
        }

        const db = client.db(DBNAME);
        const col = db.collection(COLLECTION);
        let last = await col.find().sort({ _id: -1 }).limit(1).toArray();

        if (last[0].nom) {
            res.send('La dernière personne que j\'ai rencontrée est: '+last[0].nom+'.')
        } else {
            res.send('Je n\'ai rencontré personne pour l\'instant')
        }
    })
})();