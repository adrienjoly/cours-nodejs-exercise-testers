const test = require('ava');
const { runInDocker } = require('./runInDocker');
const childProcess = require('child_process');

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
  t.timeout(2 * 60 * 1000); // 2 minutes

  console.log('install in-memory mongodb server in container...');
  console.log(
    runInDocker(
      `npm install --no-audit https://github.com/vladlosev/mongodb-fs` // or mongomem from npm, but it doesn't work from docker...
    )
  );

  console.log('run mongo server in container...');
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

  const mongodbUri = await new Promise((resolve, reject) => {
    const serverProcess = childProcess.exec(
      `docker exec my-running-app node -e "${serverCode.replace(/\n/g, ' ')}"`
    );
    serverProcess.stdout.on('data', data => {
      console.log(data);
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

  console.log('install mongodb client in container...');
  runInDocker(`npm install --no-audit mongodb`);

  console.log('run client code in container...');
  // await MongoDBServer.start();
  // const url = await MongoDBServer.getConnectionString();
  // console.log('connection string:', url);
  const clientCode = `
  const MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(process.env.MONGODB_URI, function(err, client) {
    if (err) console.error(err);
    console.log('Connected successfully to server');
    const db = client.db('test');
    client.close();
  });
  `;
  const result = runInDocker(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
  console.log(result);

  t.regex(result, /Connected successfully to server/);
});

// TODO: affichage initial: tableau vide
// TODO: deuxieme affichage: une date
// TODO: troisieme affichage: deux dates
// TODO: should not have a callback
// TODO: gestion erreurs ?
