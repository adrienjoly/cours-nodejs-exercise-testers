const test = require('ava');
const { runInDocker } = require('./runInDocker');
const mongoInContainer = require('./src/mongo');

// Préparation des tests

test.before('Lecture du code source fourni', async t => {
  t.context.serverSource = await runInDocker(`cat dates.js`);
  t.log(t.context.serverSource);
  t.context.promisedMongoServer = mongoInContainer
    .installServer()
    .then(() => mongoInContainer.startServer());
  const studentCodeReady = (async () => {
    console.log(await runInDocker(`npm install --no-audit`));
    const saveDatesForTesting = []
      .concat(
        'cat > dates_for_testing.js << CONTENTS',
        t.context.serverSource.replace(
          /['"]mongodb.*\:\/\/.+['"]/g,
          'process.env.MONGODB_URI'
        ),
        'CONTENTS'
      )
      .join('\n');
    console.log(await runInDocker(saveDatesForTesting));
  })();
  t.context.runStudentCode = async () => {
    const [{ connectionString }] = await Promise.all([
      t.context.promisedMongoServer,
      studentCodeReady
    ]);
    console.log('install mongodb client in container...');
    console.log(await runInDocker(`npm install --no-audit mongodb`)); // if not doing this here, we get "TypeError: BSON is not a constructor"
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

test.serial.todo('troisième exécution: trois dates');
test.serial.todo('should not have a callback');
test.serial.todo('gestion erreurs ?');
