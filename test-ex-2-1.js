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
  const studentCodeReady = t.context.promisedMongoServer.then(
    async ({ connectionString: mongodbUri }) => {
      console.log(await runInDocker(`npm install --no-audit`));
      const saveDatesForTesting = []
        .concat(
          'cat > dates_for_testing.js << CONTENTS',
          t.context.serverSource.replace(
            /['"]mongodb.*\:\/\/.+['"]/g,
            `"${mongodbUri}"` // 'process.env.MONGODB_URI'
          ),
          'CONTENTS'
        )
        .join('\n');
      console.log(await runInDocker(saveDatesForTesting));
    }
  );
  t.context.runStudentCode = async () => {
    await studentCodeReady;
    return await runInDocker('node dates_for_testing.js');
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
  const { mongodbUri } = await t.context.promisedMongoServer;
  const result = await mongoInContainer.runClient(mongodbUri);
  t.regex(result, /Connected successfully to server/);
});

test.serial('exécution initiale: une seule date', async t => {
  const output = await t.context.runStudentCode();
  const dates = output.match(/{([^}]*)}/g);
  t.is(dates.length, 1);
});

test.serial('deuxième exécution: deux dates', async t => {
  const output = await t.context.runStudentCode();
  const dates = output.match(/{([^}]*)}/g);
  t.is(dates.length, 2);
});

test.serial.todo('troisième exécution: trois dates');
test.serial.todo('should not have a callback');
test.serial.todo('gestion erreurs ?');
