const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb+srv://Partiel1404:bobrasovki@chatbot-ifzz3.azure.mongodb.net/test';

// Database Name
const dbName = 'partiel';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
//mon code
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', function (request, response) {
    response.send('Hello World');

});

app.get('/nom', function (request, response) {
    if (request.query.nom === undefined) {
        response.send('Quel est votre nom ?')
    } else {
        response.send('Bienvenue, ' + request.query.nom + '.')
    }
});

app.listen(3000, function () {
    console.log("Server running at http://localhost:3000");
});

//Il me reste peu de temps pour finir, il faut que je fasse en sorte avec une variable env d'envoyer le nom dans une bdd mongodb pour ensuite
//la recuperer quand la variable "nom" est identique à celle sur mongodb