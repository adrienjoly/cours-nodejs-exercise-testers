const express = require("express");
const fs = require("fs");
const responsePath = "réponses.json";
const mongoUri = 'mongodb+srv://1398:1398@cluster0.nkszc.mongodb.net/<dbname>?retryWrites=true&w=majority';
const MONGO_URL = 'mongodb+srv://1398:1398@cluster0.nkszc.mongodb.net/<dbname>?retryWrites=true&w=majority';
const bodyParser = require('body-parser')

const MongoClient = require("mongodb").MongoClient;

const app = express();

express.json()

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.post('/', function (req, res) {
  if (req.body.nom != undefined) {
      res.send('Bienvenue, '+req.body.nom+'.') 
  } else {
      res.send('Il manque votre nom.')
  }
});

async function getNom() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log("Connected to server");
    const db = client.db("1398");
    const collection = db.collection("1398-nom");

    // Récuperer la collection nom in an array
    const response = await collection.find({}).toArray();
    return response;
  } catch (err) {
    console.log(err);
  }

  client.close();
}

app.get("/", async (req, res) => {
  const result = await getNom();
  res.send(result); 
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
