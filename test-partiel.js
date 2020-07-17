const test = require('ava');
const axios = require('axios');
const {
  runInDocker,
  startServer,
  waitUntilServerRunning
} = require('./runInDocker');
const childProcess = require('child_process');
const mongoInDocker = require('./src/mongoInDocker');

const envVars = {
  PORT: 3000,
  MONGODB_DATABASE: 'partiel-db',
  MONGODB_COLLECTION: 'visitor'
};

// IMPORTANT: all collections that going to be queried from the application should be defined in the structure below.
// Otherwise, queries will hang / wait undefinitely, and silently !
const MOCK_DB_STRUCTURE = {
  [MONGODB_DATABASE]: {
    [MONGODB_COLLECTION]: []
  }
};

// Préparation des tests

test.before('Lecture du code source fourni', async t => {
  const code = await runInDocker(`cat server.js`);
  t.log(code);
  t.context.serverSource = code;
  t.context.promisedMongoServer = mongoInDocker.installAndStartFakeServer(
    MOCK_DB_STRUCTURE
  );
  t.context.runStudentCode = async () => {
    const { connectionString } = await t.context.promisedMongoServer;
    startServer({
      ...envVars,
      MONGODB_URL: connectionString
    });
  };
});

// Exigences structurelles

test.serial(
  'server.js utilise seulement await pour récupérer les valeurs promises',
  t => {
    const { serverSource } = t.context;
    t.regex(serverSource, /await/);
    t.notRegex(serverSource, /\.then\(/);
    t.notRegex(serverSource, /\.catch\(/);
  }
);

// Exigences fonctionnelles

test.serial('lancer serveur', async t => {
  console.log('runStudentCode()');
  await t.context.runStudentCode();
  console.log('done runStudentCode() => waiting...');
  waitUntilServerRunning(envVars.PORT);
  console.log('done waitUntilServerRunning()');
  t.pass();
});

/*
test.serial.skip('connect to mongodb from container', async t => {
  const { connectionString } = await t.context.promisedMongoServer;
  const result = await mongoInContainer.runClient(connectionString);
  t.regex(result, /Connected successfully to server/);
});

test.serial('exécution initiale: une seule date', async t => {
  const output = await t.context.runStudentCode();
  const dates = output.match(/{([^}]*)}/g);
  t.is(dates.length, 1);
});

test.serial('deuxième exécution: deux dates', async t => {
  // TODO: for the sake of test independance, we should restart the mongo server here
  const output = await t.context.runStudentCode();
  const dates = output.match(/{([^}]*)}/g);
  t.is(dates.length, 2);
});
*/

// Exigences fonctionnelles

const suite = [
  // points d'entrée des exercices précédents
  {
    req: ['GET', '/'],
    exp: /Je n'ai rencontré personne pour l'instant/
  },
  {
    req: ['POST', '/'],
    exp: /Il manque votre nom/
  },
  {
    req: ['POST', '/', 'nom=adrien'],
    exp: /Bienvenue, adrien/
  }
];

for (const { req, exp } of suite) {
  const [method, path, body] = req;
  const port = envVars.PORT;
  test.serial(
    `${method} ${path} ${JSON.stringify(body || {})} -> ${exp.toString()}`,
    async t => {
      const url = `http://localhost:${port}${path}`;
      const { data } = await axios[method.toLowerCase()](url, body);
      t.regex(data, exp);
    }
  );
}
