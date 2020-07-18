const MongoClient = require("mongodb").MongoClient;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { response } = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const dbName = process.env.MONGODB_DATABASE;
const client = new MongoClient(process.env.MONGODB_URL);

(async () => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(process.env.MONGODB_COLLECTION);

  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.post("/", function (req, res) {
    if (req.body.nom === "") res.send("Il manque votre nom.");
    else {
      const user = { nom: req.body.nom };
      try {
        collection.insertOne(user, function (err) {
          if (err) throw err;
        });
      } catch (e) {
        console.error(e);
      }
      res.send(`Bienvenue, ${req.body.nom}.`);
    }
  });

  app.get("/", async function (req, res) {
    try {
      const messages = await collection.findOne({}, { field: "asc", _id: -1 });
      console.log(messages.nom);
      if (messages)
        res.send(
          `La dernière personne que j'ai rencontrée est: ${messages.nom}`
        );
      else res.send("Je n'ai rencontré personne pour l'instant");
    } catch (e) {
      console.error(e);
      res.send("J'ai perdu la mémoire...");
    }
  });

  app.listen(PORT, function () {
    console.log(`App Listen on ${PORT}`);
  });
})();
