const express = require('express')
const app = express()
const name = ''
const PORT = process.env.PORT || 3000;

const MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.urlencoded({
    extended: true
}))

// Fonctions MongoDB asynchrones
async () => {
    await client.connect();
    const database = client.db(MONGODB_DATABASE)
    const client = new MongoClient(MONGODB_URL);
    const collection = db.collection(MONGODB_COLLECTION);

// Route post '/'
app.post("/", function (req, res) {
    try {
        const lastName = await collection.findOne().sort({
            field: 'asc',
            _id: -1
        }).limit(1)

        if (lastName) {
            res.send("Bienvenue, " + lastName);
        } else {
            res.send("Il manque votre nom.");
        }
    } catch (err) {
        console.log(err)
    }
});

// Route get '/'
app.get('/', function (req, res) {
    try {
        const lastPerson = await collection.findOne().sort({
            field: 'asc',
            _id: -1
        }).limit(1)
        if (lastPerson) {
            res.send("La dernière personne que j'ai rencontrée est: " + lastPerson)
        } else {
            res.send("Je n'ai rencontré personne pour l'instant")
        }
    } catch (err) {
        res.send("J'ai perdu la mémoire...")
    }
})

}

// Port utilisé par le serveur
app.listen(PORT, function () {
    console.log("The server is listening on port", PORT);
});