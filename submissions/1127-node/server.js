var express = require('express')
var app = express()

const MONGODB_DATABASE = require('mongodb').MongoClient;

const MONGODB_URL ="mongodb://localhost:27017"

async function insertName(name) {

  console.log('connected');
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected');
    const dbName = client.db('db-name');
    const MANGODB_COLLECTION = dbName.collection('messages');

    await collection.insertOne({
	    name: name
    });

    console.log('Messages insérés')
  } catch (err) {
    console.log(err.stack);
  }
  client.close();
}


async function getName() {
  const client = new MANGODB_DATABASE(MANGODB_URL);

  try {
    await client.connect();
    console.log('Connected');
    const dbName = client.db('db-name');
    const MANGODB_COLLECTION = dbName.collection('historique');

    const lastname = await collection.find({}).toArray();
   

  } catch (err) {
    console.log(err.stack);
  }

  client.close();
}


// GET method route
app.get('/nom', function (req, res) {
  if (rep.query.nom === undefined) {
          res.send('Il manque votre nom.');
  } else (
        res.send('Bienvenue, ${req.query.nom}')
	await insertName(name, req.body.msg);

})

// POST method route
app.post('/', function (req, res) {
	if ($lastname) {
  res.send("La dernière personne que j'ai rencontrées est: ${lastname}. ");
	}
	else if {MANGODB_COLLECTION) {
  res.send("Je n'ai rencontré personne pour l'instant");
	else {
	res.send("J'ai perdu la mémoire...");
	}
  } 
})

app.listen(PORT, function () {
    console.log("The server is listening on port", PORT);
  });
