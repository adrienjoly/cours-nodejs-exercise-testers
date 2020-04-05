const childProcess = require('child_process');
const { runInDocker } = require('./../runInDocker');

const debug = () => {}; // can be set to console.debug(), for more verbosity

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

const connectToMongoInContainer = mongodbUri => {
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
  return runInDocker(
    `MONGODB_URI="${mongodbUri}" node -e "${clientCode.replace(/\n/g, ' ')}"`
  );
};

module.exports = {
  startMongoServerInContainer,
  connectToMongoInContainer
};
