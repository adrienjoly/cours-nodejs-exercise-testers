'use strict';

const { PORT, MONGODB_URL, MONGODB_DATABASE, MONGODB_COLLECTION } = process.env;

const express = require('express');
const app = express();

const MongoClient = require('mongodb').MongoClient;

async function getLastVistor() {
  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  const db = client.db(MONGODB_DATABASE);
  const col = db.collection(MONGODB_COLLECTION);
  const doc = await col.findOne();
  client.close();
  return doc;
}

async function storeVisitor(nom) {
  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  const db = client.db(MONGODB_DATABASE);
  const col = db.collection(MONGODB_COLLECTION);
  await col.deleteMany({});
  await col.insertOne({ nom });
  client.close();
}

app.use(express.urlencoded()); // pour décoder les données URL-encodées des requêtes

app.post('/', async (req, res) => {
  const { nom } = req.body;
  if (nom) await storeVisitor(nom);
  res.send(nom ? `Bienvenue, ${nom}.` : 'Il manque votre nom.');
});

app.get('/', async (req, res) => {
  try {
    const { nom } = (await getLastVistor()) || {};
    res.send(
      nom
        ? `La dernière personne que j'ai rencontrée est: ${nom}.`
        : `Je n'ai rencontré personne pour l'instant`
    );
  } catch (err) {
    res.send(`J'ai perdu la mémoire...`);
  }
});

app.listen(PORT, function() {
  console.log('The server is listening on port', PORT);
});
