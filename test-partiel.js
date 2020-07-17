const test = require('ava');
const axios = require('axios').create();
const {
  runInDocker,
  startServer,
  waitUntilServerRunning,
  killSync
} = require('./runInDocker');
const mongoInDocker = require('./src/mongoInDocker');

const MONGODB_DATABASE = 'partielDB';
const MONGODB_COLLECTION = 'visitor';

axios.defaults.timeout = 1500;

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

test.serial(
  `server.js contient l'intégralité du code source de votre programme`,
  async t => {
    const jsFiles = (await runInDocker('ls -a -1 *.js')).trim().split(/[\r\n]/);
    t.deepEqual(jsFiles, ['server.js']);
  }
);

test.serial(
  `package.json permet d'installer les dépendances nécessaires à l'aide de npm install`,
  async t => {
    const { dependencies } = JSON.parse(await runInDocker('cat package.json'));
    t.deepEqual(Object.keys(dependencies).sort(), ['express', 'mongodb']);
  }
);

test.serial(
  `package.json permet de démarrer le serveur à l'aide de npm start`,
  async t => {
    const { scripts } = JSON.parse(await runInDocker('cat package.json'));
    t.regex(scripts.start, /node server.js/);
  }
);

test.serial(
  `README.md inclue les instructions à suivre pour installer, exécuter et tester le serveur`,
  async t => {
    const readme = await runInDocker('cat README.md');
    t.regex(readme, /npm i/);
    t.regex(readme, /node server|npm start/);
    t.regex(readme, /npm test|curl/);
  }
);

// Exigences fonctionnelles

test.serial(`le serveur répond sur le port ${envVars.PORT}`, async t => {
  await t.context.runStudentCode();
  await waitUntilServerRunning(envVars.PORT);
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
  `MONGODB_COLLECTION ne doit contenir qu'un document avec le nom du dernier visiteur`,
  async t => {
    const { connectionString } = await t.context.promisedMongoServer;
    const clientFct = async (err, client) => {
      if (err) console.error(err);
      const db = client.db('partielDB'); /* TODO: pass MONGODB_DATABASE */
      const col = db.collection('visitor'); /* TODO: pass MONGODB_COLLECTION */
      console.log(JSON.stringify(await col.find().toArray()));
      client.close();
    };
    const log = () => {}; // set to console.error, for troubleshooting/debugging
    const docs = JSON.parse(
      await mongoInDocker.runClientFct(connectionString, clientFct, log)
    );
    t.is(docs.length, 1);
    t.deepEqual(Object.keys(docs[0]).sort(), ['_id', 'nom']);
    t.deepEqual(docs[0].nom, 'michelle');
  }
);

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
