const test = require('ava');
const axios = require('axios');
const {
  runInDocker,
  startServerAndWaitUntilRunning,
  waitUntilServerRunning
} = require('./runInDocker');
const mongoInContainer = require('./src/mongo');

const envVars = {
  PORT: 3000,
  MONGODB_COLLECTION: 'visitor',
  MONGODB_DATABASE: 'partiel-db'
};

// Préparation des tests

async function prepareStudentCode(code) {
  console.log(await runInDocker(`npm install --no-audit`));
  /*
  const saveDatesForTesting = []
    .concat(
      'cat > dates_for_testing.js << CONTENTS',
      code.replace(/['"]mongodb.*\:\/\/.+['"]/g, 'process.env.MONGODB_URI'),
      'CONTENTS'
    )
    .join('\n');
  console.log(await runInDocker(saveDatesForTesting));
  */
}

test.before('Lecture du code source fourni', async t => {
  const code = await runInDocker(`cat server.js`);
  t.log(code);
  t.context.serverSource = code;
  t.context.promisedMongoServer = prepareStudentCode(code)
    .then(() => mongoInContainer.installServer())
    .then(() => mongoInContainer.startServer());
  t.context.runStudentCode = async () => {
    const { connectionString } = await t.context.promisedMongoServer;
    const res = await runInDocker(
      `PORT="${envVars.PORT}" MONGODB_URL="${connectionString}" MONGODB_DATABASE="${envVars.MONGODB_DATABASE}" MONGODB_COLLECTION="${envVars.MONGODB_COLLECTION}" node server.js`
    );
    await waitUntilServerRunning(port);
    return res;
  };
  // await t.context.runStudentCode();
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
