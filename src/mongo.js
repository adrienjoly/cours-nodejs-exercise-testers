const childProcess = require('child_process');
const { runInDocker } = require('./../runInDocker');

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
  new Promise(async resolve => {
    debug('run mongo server in container...');
    const serverCode = `
  const mongodbFs = require('mongodb-fs');
  mongodbFs.init({
    port: 27027,
    mocks: {
      test: { dates: [] } /* a test database with a dates collection */
    }  
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
        resolve(connectionString.replace(/[\r\n]+/, ''));
      }
    });
    serverProcess.stderr.on('data', data => console.log(data));
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
