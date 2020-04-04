const test = require('ava');
const { runInDocker } = require('./runInDocker');
const { MongoDBServer } = require('mongomem');
const MongoClient = require('mongodb').MongoClient;

// Préparation des tests

test.before('Lecture du code source fourni', t => {
  t.context.serverSource = runInDocker(`cat dates.js`);
  t.log(t.context.serverSource);
});

// Exigences structurelles

test.serial(
  'dates.js utilise seulement await pour récupérer les valeurs promises',
  t => {
    const { serverSource } = t.context;
    t.regex(serverSource, /await/);
    t.notRegex(serverSource, /\.then\(/);
    t.notRegex(serverSource, /\.catch\(/);
  }
);

// Exigences fonctionnelles

test.serial('connect to mongodb from container', async t => {
  await MongoDBServer.start();
  const url = await MongoDBServer.getConnectionString();
  console.log('connection string:', url);
  // await mongooseInstance.connect(db, { promiseLibrary: Promise });
  MongoClient.connect(url, function(err, client) {
    console.log('Connected successfully to server');
    const db = client.db('test');
    client.close();
  });
});

// TODO: affichage initial: tableau vide
// TODO: deuxieme affichage: une date
// TODO: troisieme affichage: deux dates
// TODO: should not have a callback
// TODO: gestion erreurs ?
