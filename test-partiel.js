const test = require('ava');
const axios = require('axios');
const {
  runInDocker,
  startServer,
  waitUntilServerRunning,
  killSync
} = require('./runInDocker');
const mongoInDocker = require('./src/mongoInDocker');

const MONGODB_DATABASE = 'partielDB';
const MONGODB_COLLECTION = 'visitor';

const envVars = {
  PORT: 3000,
  MONGODB_DATABASE,
  MONGODB_COLLECTION
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
    return startServer({
      ...envVars,
      MONGODB_URL: connectionString,
      log: t.log // will display logs printed in standard output only if the test fails
    });
  };
});

/*
// to test / troubleshoot connection to fake MongoDB server
test.serial('connect to mongodb from container', async t => {
  const { connectionString } = await t.context.promisedMongoServer;
  const result = await mongoInDocker.runClient(connectionString);
  t.regex(result, /Connected successfully to server/);
});
*/

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

// TODO:
// - `server.js` doit contenir l'intégralité du code source de votre programme.
// - `package.json` permettra à quiconque d'installer les dépendances nécessaires à l'aide de `npm install`, et de démarrer votre serveur à l'aide de `npm start`.
// - `README.md` expliquera de manière concise et précise: la nature de votre programme, ses fonctionnalités et les instructions à suivre pour l'installer, l'exécuter et le tester. (c.a.d. vérifier que les fonctionnalités décrites fonctionnent comme prévu)
// - lisibilité du code source (`server.js`) => indentation, nommage des variables et fonctions, commentaires...

// Exigences fonctionnelles

test.serial(`le serveur répond sur le port ${envVars.PORT}`, async t => {
  console.info(`Exécution du serveur de l'étudiant...`);
  await t.context.runStudentCode();
  console.info(`Attente de réponse sur le port ${envVars.PORT}...`);
  waitUntilServerRunning(envVars.PORT);
  t.pass();
});

const suite = [
  {
    req: ['GET', '/'],
    exp: /Je n'ai rencontré personne pour l'instant/
  },
  {
    req: ['POST', '/'],
    exp: /Il manque votre nom/
  },
  {
    req: ['GET', '/'],
    exp: /Je n'ai rencontré personne pour l'instant/
  },
  {
    req: ['POST', '/', 'nom=adrien'],
    exp: /Bienvenue, adrien/
  },
  {
    req: ['GET', '/'],
    exp: /La dernière personne que j'ai rencontrée est: adrien/
  },
  {
    req: ['POST', '/', 'nom=michelle'],
    exp: /Bienvenue, michelle/
  },
  {
    req: ['GET', '/'],
    exp: /La dernière personne que j'ai rencontrée est: michelle/
  }
];

let step = 1;
for (const { req, exp } of suite) {
  const [method, path, body] = req;
  test.serial(
    `(${step}) ${method} ${path} ${JSON.stringify(
      body || {}
    )} -> ${exp.toString()}`,
    async t => {
      const url = `http://localhost:${envVars.PORT}${path}`;
      const { data } = await axios[method.toLowerCase()](url, body);
      t.regex(data, exp);
    }
  );
  step++;
}

test.serial(
  `(${step}) GET / -> "J'ai perdu la mémoire...", si la db ne fonctionne plus`,
  async t => {
    killSync((await t.context.promisedMongoServer).pid); // kill mongodb server
    const { data } = await axios.get(`http://localhost:${envVars.PORT}/`);
    t.regex(data, /J'ai perdu la mémoire/);
  }
);

// TODO:
// - Le serveur doit *se souvenir* du dernier `nom` transmis à `POST /` même s'il a été redémarré entre deux requêtes
// - Le dernier `nom` transmis à `POST /` doit être récupéré et tenu à jour dans un document MongoDB devant seulement contenir les propriétés `_id` (fourni automatiquement par MongoDB) et `nom`.
// - À tout instant, il ne doit pas y avoir plus d'un seul document dans la collection spécifiée ci-dessus.
