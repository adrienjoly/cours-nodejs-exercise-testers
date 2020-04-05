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

  console.log('install mongomem...');
  console.log(runInDocker(`npm install --no-audit mongomem babel-runtime`));

  console.log('run mongo server in container...');
  const serverCode = `
  const { MongoDBServer } = require('mongomem');
  (async () => {
    console.log('--starting');
    await MongoDBServer.start();
    console.log('--getConnectionString');
    const url = await MongoDBServer.getConnectionString();
    console.log('connection string:', url);
  })();
  `;

  const mongodbUri = await new Promise((resolve, reject) => {
    const serverProcess = childProcess.exec(
      `docker exec my-running-app node -e "${serverCode.replace(/\n/g, ' ')}"`
    );
    serverProcess.stdout.on('data', data => {
      //if (!/\d\.\d \%/.test(data)) {
      console.log(data);
      //}
      const done = data.toString().includes('connection string');
      if (done) {
        const connectionString = data
          .toString()
          .split(': ')
          .pop();
        console.log('done!', { connectionString });
        resolve(connectionString);
      }
    });
    serverProcess.stderr.on('data', data => {
      reject(data);
    });
    serverProcess.stderr.on('error', data => {
      reject(data);
    });
  });

  console.log('run client code...');
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
  runInDocker(`npm install --no-audit mongodb`);
  const result = runInDocker(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
  console.log(result);
});

// TODO: affichage initial: tableau vide
// TODO: deuxieme affichage: une date
// TODO: troisieme affichage: deux dates
// TODO: should not have a callback
// TODO: gestion erreurs ?
