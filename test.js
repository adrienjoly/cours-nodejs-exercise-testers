const test = require('ava');
const axios = require('axios');
const childProcess = require('child_process');

const runInDocker = command => {
  try {
    return childProcess
      .execSync(`docker exec -i my-running-app sh -c "${command}"`)
      .toString();
  } catch (err) {
    console.error(err);
    return null;
  }
};

test.before('Lecture du code source fourni', t => {
  t.context.serverFiles = runInDocker('cat files.log'); // files.log is generated by run-in-docker-from-git.sh
  t.context.packageSource = runInDocker('cat package.json');
  t.context.readmeSource = runInDocker('cat README.md');
  t.context.serverSource = runInDocker('cat server.js');
  t.context.gitLog = runInDocker('git log --pretty=oneline');
  t.log(t.context.serverSource);
});

test('le dépot ne contient pas plus de 5 fichiers', t => {
  const lines = t.context.serverFiles
    .trim()
    .split(/[\r\n]+/)
    .filter(name => name != '.')
    .filter(name => name != '..')
    .filter(name => name != '.git')
    .filter(name => name != 'files.log')
    .filter(name => name != 'package-lock.json');
  t.true(lines.length <= 5);
});

test('le dépot ne contient pas node_modules', t => {
  const lines = t.context.serverFiles.split('\n');
  t.false(lines.includes('node_modules'));
});

test('le dépot contient un fichier package.json', t => {
  const { serverFiles } = t.context;
  t.truthy(serverFiles.match(/package\.json/i));
});

test('package.json mentionne server.js', t => {
  const { packageSource } = t.context;
  t.truthy(packageSource.match(/server\.js/));
});

test('package.json mentionne express comme dépendence', t => {
  const { packageSource } = t.context;
  t.truthy(packageSource.match(/"express"/));
});

test('le dépot contient un fichier README.md', t => {
  const { serverFiles } = t.context;
  t.truthy(serverFiles.match(/readme\.md/i));
});

test('README.md explique comment faire fonctionner le server', t => {
  const { readmeSource } = t.context;
  t.assert(readmeSource.match(/git clone/));
  t.assert(readmeSource.match(/npm i/));
  t.assert(readmeSource.match(/npm start|node server/));
});

test('README.md explique comment tester le server', t => {
  const { readmeSource } = t.context;
  t.assert(readmeSource.includes('curl'));
});

test("l'historique git contient au moins un commit par exercice", t => {
  const lines = t.context.gitLog.trim().split('\n');
  t.assert(lines.length > 3);
});

test('server.js fait moins de 30 lignes', t => {
  const lines = t.context.serverSource.trim().split('\n');
  t.assert(lines.length <= 30);
});

const suite = [
  {
    req: ['GET', '/'],
    exp: '"Hello World"',
    fct: (t, { data }) => t.true(data.includes('Hello World'))
  },
  {
    req: ['GET', '/hello'],
    exp: '"Quel est votre nom ?"',
    fct: (t, { data }) => t.true(data.includes('Quel est votre nom ?'))
  },
  {
    req: ['GET', '/hello?nom=Sasha'],
    exp: '"Bonjour, Sasha"',
    fct: (t, { data }) => t.true(data.includes('Bonjour, Sasha'))
  },
  {
    req: ['GET', '/hello?nom=Patrick'],
    exp: '"Bonjour, Patrick"',
    fct: (t, { data }) => t.true(data.includes('Bonjour, Patrick'))
  },
  {
    req: ['GET', '/hello?nom=Michel%20Blanc'],
    exp: '"Bonjour, Michel Blanc"',
    fct: (t, { data }) => t.true(data.includes('Bonjour, Michel Blanc'))
  }
];

suite.forEach(testObj =>
  test(`${testObj.req.join(' ')} retourne ${testObj.exp}`, async t => {
    const method = testObj.req[0].toLowerCase();
    const url = `http://localhost:3000${testObj.req[1]}`;
    const res = await axios[method](url);
    return testObj.fct(t, res);
  })
);

test('server.js instancie express', t => {
  const { serverSource } = t.context;
  t.assert(serverSource.includes('express()'));
});

test('server.js appelle la fonction .listen()', t => {
  const { serverSource } = t.context;
  t.assert(serverSource.includes('.listen('));
});

test('server.js appelle la fonction .get(', t => {
  const { serverSource } = t.context;
  t.assert(serverSource.includes('.get('));
});

test('server.js appelle la fonction .send(', t => {
  const { serverSource } = t.context;
  t.assert(serverSource.includes('.send('));
});

test('server.js récupère process.env.PORT, pour Heroku', t => {
  const { serverSource } = t.context;
  t.assert(serverSource.includes('process.env.PORT'));
});
