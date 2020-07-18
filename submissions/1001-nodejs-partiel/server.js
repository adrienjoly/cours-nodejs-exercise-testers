const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

const mongoUri = process.env.MONGODB_URL;

const app = express();

// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );

app.use(bodyParser.json());

const port = process.env.PORT || 3000;

async function insertName(nom) {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DATABASE);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    await collection.insertOne({
      name: nom,
    });

    console.log('Inserted name with success');
  } catch (error) {
    console.log(error);
  }

  client.close();
}

async function getLastName() {
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();

    const db = client.db('partiel');
    const collection = db.collection('name');

    const response = await collection
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    return response[0]['name'];
  } catch (error) {
    console.log(error);
    res.send("J'ai perdu la mémoire...");
  }

  client.close();
}

app.get('/', async (req, res) => {
  let lastNameInserted = await getLastName();
  if (lastNameInserted === undefined) {
    res.send("Je n'ai rencontré personne pour l'instant");
  } else {
    res.send(
      `La dernière personne que j'ai rencontrée est: ${lastNameInserted}`
    );
  }
});

app.post('/', (req, res) => {
  console.log('got here');

  const nom = req.body.nom;
  if (nom != undefined) {
    insertName(nom);
    res.send(`Bienvenue, ${nom}.`);
  } else {
    res.send('Il manque votre nom.');
  }
});

app.listen(port, () => {
  console.log(`Listening on PORT ${port}`);
});
