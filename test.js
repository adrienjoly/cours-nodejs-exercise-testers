const test = require('ava');
const axios = require('axios');
const childProcess = require('child_process');

test.before('Lecture du code source fourni', t => {
  t.context.serverFiles = childProcess
    .execSync('docker exec -i my-running-app sh -c "ls"')
    .toString();
  t.log(t.context.serverFiles);
  t.context.serverSource = childProcess
    .execSync('docker exec -i my-running-app sh -c "cat server.js"')
    .toString();
  t.log(t.context.serverSource);
});

test('le code source ne contient pas plus de 5 fichiers', t => {
  const nbLines = t.context.serverFiles.split('\n').length - 1;
  t.assert(nbLines <= 5);
});

test('server.js fait moins de 30 lignes', t => {
  const nbLines = t.context.serverSource.split('\n').length - 1;
  t.assert(nbLines <= 30);
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
