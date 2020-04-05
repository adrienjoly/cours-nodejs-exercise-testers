const test = require('ava');
const { runInDocker } = require('./runInDocker');
const {
  startMongoServerInContainer,
  connectToMongoInContainer
} = require('./src/mongo');

// Préparation des tests

test.before('Lecture du code source fourni', t => {
  t.context.serverSource = runInDocker(`cat dates.js`);
  t.log(t.context.serverSource);
  t.context.promisedMongodbUri = startMongoServerInContainer();
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
  const mongodbUri = await t.context.promisedMongodbUri;
  const result = connectToMongoInContainer(mongodbUri);
  t.regex(result, /Connected successfully to server/);
});

test.serial.todo('affichage initial: tableau vide');
test.serial.todo('deuxieme affichage: une date');
test.serial.todo('troisieme affichage: deux dates');
test.serial.todo('should not have a callback');
test.serial.todo('gestion erreurs ?');
