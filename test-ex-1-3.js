const test = require('ava');
const axios = require('axios');
const { runInDocker, runInDockerBg } = require('./runInDocker');
const { execSync } = require('child_process');

// prevent axios from throwing exceptions for non-200 http responses
axios.interceptors.response.use(
  response => response,
  error => Promise.resolve(error.response)
);

let serverStarted = false;

function waitUntilServerRunning() {
  if (serverStarted) return;
  serverStarted = true;
  const PORT = 3000;

  console.warn(`\nInstall project dependencies in container...`);
  console.warn(runInDocker(`npm install`));
  console.warn(runInDocker(`npm install express`));

  const serverFile = (
    runInDocker(`node -e "console.log(require('./package.json').main)"`) ||
    'server.js'
  ).trim();

  console.warn(`\nStart ${serverFile} in container...`);
  runInDockerBg(`PORT=${PORT} node ${serverFile} 2>&1`);

  console.warn(
    execSync(`PORT=${PORT} ./wait-for-student-server.sh`).toString()
  );
}

test.before('Lecture du code source fourni', t => {
  t.context.serverFiles = runInDocker('ls -a');
  t.context.packageSource = runInDocker('cat package.json');
  t.context.readmeSource = runInDocker('cat README.md');
  t.context.serverFile =
    runInDocker(`node -e "console.log(require('./package.json').main)"`) ||
    'server.js';
  t.context.serverSource = runInDocker(`cat ${t.context.serverFile}`);
  t.context.gitLog = runInDocker('git log --pretty=oneline');
  t.log(t.context.serverSource);
});

test.serial('le dépot ne contient pas plus de 5 fichiers', t => {
  const lines = t.context.serverFiles
    .trim()
    .split(/[\r\n]+/)
    .filter(name => name != '.')
    .filter(name => name != '..')
    .filter(name => name != '.git')
    .filter(name => name != 'package-lock.json');
  t.true(lines.length <= 5);
});

test.serial('le dépot ne contient pas node_modules', t => {
  const lines = t.context.serverFiles.split('\n');
  t.false(lines.includes('node_modules'));
});

test.serial('le dépot contient un fichier package.json', t => {
  const { serverFiles } = t.context;
  t.truthy(serverFiles.match(/package\.json/i));
});

test.serial('package.json mentionne un fichier js dans "main"', t => {
  const { packageSource } = t.context;
  t.truthy(packageSource.match(/"main": ".*\.js"/));
});

test.serial('package.json mentionne express comme dépendence', t => {
  const { packageSource } = t.context;
  t.truthy(packageSource.match(/"express"/));
});

test.serial('le dépot contient un fichier README.md', t => {
  const { serverFiles } = t.context;
  t.truthy(serverFiles.match(/readme\.md/i));
});

test.serial('README.md fournit les commandes pour cloner, installer et lancer le serveur', t => {
  const { readmeSource } = t.context;
  t.assert(readmeSource.match(/git clone/));
  t.assert(readmeSource.match(/npm i/));
  t.assert(readmeSource.match(/npm start|node server/));
});

test.serial('README.md explique comment tester le serveur avec curl', t => {
  const { readmeSource } = t.context;
  t.regex(readmeSource, /curl/);
});

test.serial("l'historique git contient au moins un commit par exercice", t => {
  const lines = t.context.gitLog.trim().split('\n');
  t.assert(lines.length >= 3);
});

test.serial('server.js fait moins de 30 lignes', t => {
  const lines = t.context.serverSource.trim().split('\n');
  t.assert(lines.length <= 30);
});

const suite = [
  {
    req: ['GET', '/'],
    exp: '"Hello World"',
    fct: (t, { data }) => t.regex(data, /Hello World/)
  },
  {
    req: ['GET', '/hello'],
    exp: '"Quel est votre nom ?"',
    fct: (t, { data }) => t.regex(data, /Quel est votre nom \?/)
  },
  {
    req: ['GET', '/hello?nom=Sasha'],
    exp: '"Bonjour, Sasha"',
    fct: (t, { data }) => t.regex(data, /Bonjour, Sasha/)
  },
  {
    req: ['GET', '/hello?nom=Patrick'],
    exp: '"Bonjour, Patrick"',
    fct: (t, { data }) => t.regex(data, /Bonjour, Patrick/)
  },
  {
    req: ['GET', '/hello?nom=Michel%20Blanc'],
    exp: '"Bonjour, Michel Blanc"',
    fct: (t, { data }) => t.regex(data, /Bonjour, Michel Blanc/)
  }
];

suite.forEach(testObj =>
  test.serial(`${testObj.req.join(' ')} retourne ${testObj.exp}`, async t => {
    waitUntilServerRunning();
    const method = testObj.req[0].toLowerCase();
    const url = `http://localhost:3000${testObj.req[1]}`;
    const res = await axios[method](url);
    return testObj.fct(t, res);
  })
);

test.serial('server.js instancie express', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /express\(\)/);
});

test.serial('server.js appelle la fonction .listen()', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /\.listen\(/);
});

test.serial('server.js appelle la fonction .get(', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /\.get\(/);
});

test.serial('server.js appelle la fonction .send(', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /\.send\(/);
});

test.serial('server.js récupère process.env.PORT, pour Heroku', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /process\.env\.PORT/);
});
