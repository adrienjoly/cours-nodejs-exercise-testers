const test = require('ava');
const { runInDocker } = require('./runInDocker');
const childProcess = require('child_process');

const debug = () => {}; // can be set to console.debug(), for more verbosity

// Base de données

const startMongoServerInContainer = () =>
  new Promise((resolve, reject) => {
    debug('install in-memory mongodb server in container...');
    debug(
      runInDocker(
        `npm install --no-audit https://github.com/vladlosev/mongodb-fs` // or mongomem from npm, but it doesn't work from docker...
      )
    );

    debug('run mongo server in container...');
    const serverCode = `
  const mongodbFs = require('mongodb-fs');
  mongodbFs.init({
    port: 27027
  });
  mongodbFs.start(function (err) {
    if (err) console.log(err);
    console.log('connection string: mongodb://localhost:27027');
  });
  `;
    const serverProcess = childProcess.exec(
      `docker exec my-running-app node -e "${serverCode.replace(/\n/g, ' ')}"`
    );
    serverProcess.stdout.on('data', data => {
      debug(data);
      if (data.toString().includes('connection string')) {
        const connectionString = data
          .toString()
          .split(': ')
          .pop();
        resolve(connectionString);
      }
    });
    serverProcess.stderr.on('data', reject);
  });

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
  debug('install mongodb client in container...');
  runInDocker(`npm install --no-audit mongodb`);

  debug('run client code in container...');
  const clientCode = `
  const MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true }, function(err, client) {
    if (err) console.error(err);
    console.log('Connected successfully to server');
    const db = client.db('test');
    client.close();
  });
  `;
  const result = runInDocker(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
  debug(result);

  t.regex(result, /Connected successfully to server/);
});

test.serial.todo('affichage initial: tableau vide');
test.serial.todo('deuxieme affichage: une date');
test.serial.todo('troisieme affichage: deux dates');
test.serial.todo('should not have a callback');
test.serial.todo('gestion erreurs ?');
