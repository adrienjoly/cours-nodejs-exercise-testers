const PORT = process.env.PORT || 3000;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URL 

app.use(bodyParser.urlencoded({
    extended: true
}));

app.post("/", function (req, res) {
    if (req.query.nom != undefined) {
        res.send("Bienvenue, " + req.query.nom + ".");
    } else {
        res.send("Il manque votre nom.");
    }
})

app.get("/", function (req, res) {
    res.send("La dernière personne que j'ai rencontrée est: " +)
})

(async function () {
    try {
        const client = new MongoClient(url, {
            useNewUrlParser: true
        });
        await client.connect();
        const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
        const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;
    } catch (err) {
        console.log(err);
    }
})();

app.listen(PORT, function () {
    console.log("The server is listening on port", PORT);
});