const PORT = process.env.PORT || 3000;
//require("dotenv").config();

const express = require("express");
const app = express();
/*
const MongoClient = require('mongodb').MongoClient;
const URL = process.env.MONGODB_URL;
const COLLECTION = process.env.MONGODB_COLLECTION;
const DATABASE = process.env.MONGODB_DATABASE;
*/
app.use(express.json());

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.post("/", async function (req, res) {

    var nom = req.query.nom

    if (nom != undefined) {
        res.send('Bienvenue, ' + nom + '.')
    } else {
        res.send('Il manque votre nom.')
    }
});

app.listen(PORT, function () {
    console.log("The server is listening on port", PORT);
});