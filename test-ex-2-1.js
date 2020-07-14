const test = require('ava');
const { runInDocker } = require('./runInDocker');
const mongoInContainer = require('./src/mongo');

// Préparation des tests

async function prepareStudentCode(code) {
  console.log(await runInDocker(`npm install --no-audit`));
  const saveDatesForTesting = []
    .concat(
      'cat > dates_for_testing.js << CONTENTS',
      code.replace(/['"]mongodb.*\:\/\/.+['"]/g, 'process.env.MONGODB_URI'),
      'CONTENTS'
    )
    .join('\n');
  console.log(await runInDocker(saveDatesForTesting));
}

test.before('Lecture du code source fourni', async t => {
  const code = await runInDocker(`cat dates.js`);
  t.log(code);
  t.context.serverSource = code;
  t.context.promisedMongoServer = prepareStudentCode(code)
    .then(() => mongoInContainer.installServer())
    .then(() => mongoInContainer.startServer());
  t.context.runStudentCode = async () => {
    const { connectionString } = await t.context.promisedMongoServer;
    return await runInDocker(
      `MONGODB_URI="${connectionString}" node dates_for_testing.js`
    );
  };
});

// Exigences structurelles

test.serial(
  'dates.js utilise seulement await pour récupérer les valeurs promises',
  t => {
    const { serverSource } = t.context;
    t.regex(serverSource, /await/);
    t.notRegex(serverSource, /\.then\(/);
    t.notRegex(serverSource, /\.catch\(/);
  }
);

// Exigences fonctionnelles

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

test.serial('troisième exécution: trois dates', async t => {
  const output = await t.context.runStudentCode();
  const dates = output.match(/{([^}]*)}/g);
  t.is(dates.length, 3);
});

// TODO: test.serial.todo('should not have a callback');
// TODO: test.serial.todo('gestion erreurs ?'); // e.g. server is offline => kill it
