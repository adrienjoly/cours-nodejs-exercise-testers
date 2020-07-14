const childProcess = require('child_process');
const { runInDocker } = require('./../runInDocker');

// IMPORTANT: all collections that going to be queried from the application should be defined in the structure below.
// Otherwise, queries will hang / wait undefinitely, and silently !
const MOCK_DATABASES = {
  test: { dates: [] } /* a test database with a dates collection */
};

const debug = () => {}; // can be set to console.debug(), for more verbosity

const installServer = async () => {
  debug('install in-memory mongodb server in container...');
  debug(
    await runInDocker(
      `npm install --no-audit https://github.com/vladlosev/mongodb-fs` // or mongomem from npm, but it doesn't work from docker...
    )
  );
};

const startServer = () =>
  new Promise(async (resolve, reject) => {
    debug('run mongo server in container...');
    const serverCode = `
  const mongodbFs = require('mongodb-fs');
  mongodbFs.init({
    port: 27027,
    mocks: ${JSON.stringify(MOCK_DATABASES)}
  });
  mongodbFs.start(function (err) {
    if (err) console.log(err);
    console.log('connection string: mongodb://localhost:27027');
  });
  `;
    const serverProcess = childProcess.spawn('docker', [
      `exec`,
      `my-running-app`,
      `node`,
      `-e`,
      serverCode.replace(/\n/g, ' ')
    ]);
    serverProcess.stdout.on('data', data => {
      debug(data.toString('utf8'));
      if (data.toString('utf8').includes('connection string')) {
        const connectionString = data
          .toString()
          .split(': ')
          .pop()
          .replace(/[\r\n]+/, '');
        resolve({
          connectionString,
          kill: () => serverProcess.kill()
        });
      }
    });
    serverProcess.stderr.on('data', data => console.log(data.toString('utf8')));
    serverProcess.on('exit', data => reject(data));
  });

const runClient = async mongodbUri => {
  debug('install mongodb client in container...');
  await runInDocker(`npm install --no-audit mongodb`);

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
  return await runInDocker(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
};

module.exports = {
  installServer,
  startServer,
  runClient
};
