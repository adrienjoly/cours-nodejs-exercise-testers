const test = require('ava');
const axios = require('axios');
const {
  runInDocker,
  startServerAndWaitUntilRunning
} = require('./runInDocker');

// prevent axios from throwing exceptions for non-200 http responses
axios.interceptors.response.use(
  response => response,
  error => Promise.resolve(error.response)
);
axios.defaults.timeout = 1000;

let serverStarted = false;

test.before('Lecture du code source fourni', async t => {
  t.context.serverFiles = await runInDocker('ls -a');
  t.context.packageSource = await runInDocker('cat package.json');
  t.context.readmeSource = await runInDocker('cat README.md');
  t.context.serverFile = await runInDocker(
    `[ -f server.js ] && echo "server.js" || node -e "console.log(require('./package.json').main)"`
  );
  t.context.serverSource = await runInDocker(`cat ${t.context.serverFile}`);
  t.log(t.context.serverSource);
});

// Exigences structurelles

test.serial('le dépot ne contient pas node_modules', t => {
  const lines = t.context.serverFiles.split('\n');
  t.false(lines.includes('node_modules'));
});

test.serial('package.json mentionne express comme dépendence', t => {
  const { packageSource } = t.context;
  t.truthy(packageSource.match(/"express"/));
});

test.serial('README.md mentionne npm install et tests avec curl', t => {
  const { readmeSource } = t.context;
  t.regex(readmeSource, /npm i/);
  t.regex(readmeSource, /curl/);
});

test.serial('server.js fait moins de 50 lignes', t => {
  const lines = t.context.serverSource.trim().split('\n');
  t.assert(lines.length <= 50);
});

test.serial('server.js utilise express .post() .send() et .listen()', t => {
  const { serverSource } = t.context;
  t.regex(serverSource, /express\(\)/);
  t.regex(serverSource, /\.post\(/);
  t.regex(serverSource, /\.send\(/);
  t.regex(serverSource, /\.listen\(/);
});

// Exigences fonctionnelles

const suite = [
  // points d'entrée des exercices précédents
  {
    req: ['GET', '/'],
    exp: /Hello World/
  },
  {
    req: ['GET', '/hello'],
    exp: /Quel est votre nom \?/
  },
  {
    req: ['GET', '/hello?nom=Sasha'],
    exp: /Bonjour, Sasha/
  },
  {
    req: ['GET', '/hello?nom=Patrick'],
    exp: /Bonjour, Patrick/
  },
  {
    req: ['GET', '/hello?nom=Michel%20Blanc'],
    exp: /Bonjour, Michel Blanc/
  },
  // points d'entrée de l'exercice 1-4 (POST)
  {
    req: ['POST', '/chat', { msg: 'ville' }],
    exp: /Nous sommes à Paris/
  },
  {
    req: ['POST', '/chat', { msg: 'météo' }],
    exp: /Il fait beau/
  },
  // points d'entrée de l'exercice 1-5 (avec mémoire)
  {
    req: ['POST', '/chat', { msg: 'demain' }],
    exp: /Je ne connais pas demain/
  },
  {
    req: ['POST', '/chat', { msg: 'demain = Mercredi' }],
    exp: /Merci pour cette information !/
  },
  {
    req: ['POST', '/chat', { msg: 'demain' }],
    exp: /demain: Mercredi/
  },
  // autre valeur pour "demain"
  {
    req: ['POST', '/chat', { msg: 'demain = Jeudi' }],
    exp: /Merci pour cette information !/
  },
  {
    req: ['POST', '/chat', { msg: 'demain' }],
    exp: /demain: Jeudi/
  },
  // autre clé que "demain"
  {
    req: ['POST', '/chat', { msg: 'pays = Bengladesh' }],
    exp: /Merci pour cette information !/
  },
  {
    req: ['POST', '/chat', { msg: 'pays' }],
    exp: /pays: Bengladesh/
  }
];

for (const { req, exp } of suite) {
  const [method, path, body] = req;
  const port = 3000; // TODO: get from PORT env var, if possible
  test.serial(
    `${method} ${path} ${JSON.stringify(body || {})} -> ${exp.toString()}`,
    async t => {
      if (!serverStarted) {
        try {
          await runInDocker(`npm install --no-audit express`, t.log);
        } catch (err) {
          console.error(err);
        }
        await startServerAndWaitUntilRunning(3000, {
          // TODO: import value from PORT env var, if possible
          log: t.log // will display logs printed in standard output only if the test fails
        });
      }
      serverStarted = true;
      const url = `http://localhost:${port}${path}`;
      const { data } = await axios[method.toLowerCase()](url, body);
      t.regex(data, exp);
    }
  );
}

// Vérification de la persistance

test.serial(
  'réponses.json contient les dernières valeurs enregistrées',
  async t => {
    const reponses = await runInDocker('cat réponses.json');
    t.assert(reponses, '😩 fichier réponses.json non trouvé');
    t.regex(reponses, /demain/);
    t.regex(reponses, /Jeudi/);
    t.regex(reponses, /pays/);
    t.regex(reponses, /Bengladesh/);
  }
);
