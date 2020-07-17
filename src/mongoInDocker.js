const childProcess = require('child_process');
const { runInDockerSeparate, CONTAINER_NAME } = require('../runInDocker');

// IMPORTANT: all collections that going to be queried from the application should be defined in the structure below.
// Otherwise, queries will hang / wait undefinitely, and silently !
const DEFAULT_MOCK_DB_STRUCTURE = {
  test: { dates: [] } /* a test database with a dates collection */
};

const debug = () => {}; // can be set to console.debug(), for more verbosity

const installServer = async () => {
  debug('install in-memory mongodb server in container...');
  debug(
    await runInDockerSeparate(
      `npm install --no-audit https://github.com/vladlosev/mongodb-fs`, // or mongomem from npm, but it doesn't work from docker...
      debug
    )
  );
};

const startServer = (mockDbStructure = DEFAULT_MOCK_DB_STRUCTURE) =>
  new Promise(async (resolve, reject) => {
    debug('run mongo server in container...');
    const serverCode = `
  const mongodbFs = require('mongodb-fs');
  mongodbFs.init({ port: 27027, mocks: ${JSON.stringify(mockDbStructure)} });
  mongodbFs.start(function (err) {
    if (err) console.log(err);
    console.log(JSON.stringify({ connectionString: 'mongodb://localhost:27027', pid: process.pid }));
  });`.replace(/\n/g, ' ');
    const serverProcess = childProcess.exec(
      `docker exec ${CONTAINER_NAME} node -e "${serverCode}"`
    );
    serverProcess.stdout.on('data', data => {
      debug(data);
      const { connectionString, pid } = JSON.parse(data.toString());
      resolve({ pid, connectionString });
    });
    serverProcess.stderr.on('data', data =>
      reject(new Error('[mongoInDocker] ' + data.toString()))
    );
    serverProcess.on('exit', code =>
      debug('mongoInDocker server process exited with', code)
    );
  });

const runClient = async mongodbUri => {
  // TODO: (refactor) rewrite to use runClientFct()
  debug('install mongodb client in container...');
  await runInDockerSeparate(`npm install --no-audit mongodb`);

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
  return await runInDockerSeparate(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
};

const runClientFct = async (mongodbUri, clientFct, log) => {
  log('install mongodb client in container...');
  await runInDockerSeparate(`npm install --no-audit mongodb`, log);

  log('run client code in container...');
  const clientCode = `
    require('mongodb').MongoClient.connect(
      process.env.MONGODB_URI,
      { useUnifiedTopology: true },
      ${clientFct.toString()}
    );`;
  return await runInDockerSeparate(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`,
    log
  );
};

const installAndStartFakeServer = (
  mockDbStructure = DEFAULT_MOCK_DB_STRUCTURE
) => installServer().then(() => startServer(mockDbStructure));

module.exports = {
  installServer,
  startServer,
  installAndStartFakeServer,
  runClient,
  runClientFct
};
