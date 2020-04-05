const test = require('ava');
const { runInDocker } = require('./runInDocker');
const {
  startMongoServerInContainer,
  connectToMongoInContainer
} = require('./src/mongo');

// Préparation des tests

test.before('Lecture du code source fourni', async t => {
  t.context.serverSource = await runInDocker(`cat dates.js`);
  t.log(t.context.serverSource);
  t.context.promisedMongodbUri = startMongoServerInContainer();
  t.context.runStudentCode = async mongodbUri => {
    console.log(await runInDocker(`npm install --no-audit`));
    const saveDatesForTesting = []
      .concat(
        'cat > dates_for_testing.js << CONTENTS',
        t.context.serverSource.replace(
          /['"]mongodb.*\:\/\/.+['"]/g,
          `"${mongodbUri.replace('\n', '')}"` // 'process.env.MONGODB_URI'
        ),
        'CONTENTS'
      )
      .join('\n');
    console.log('=>', await runInDocker(saveDatesForTesting));
    console.log(await runInDocker(`cat dates_for_testing.js`));
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
  const mongodbUri = await t.context.promisedMongodbUri;
  const result = await connectToMongoInContainer(mongodbUri);
  t.regex(result, /Connected successfully to server/);
});

test.serial('affichage initial: tableau vide', async t => {
  const mongodbUri = await t.context.promisedMongodbUri;
    const result = await t.context.runStudentCode(mongodbUri);
  t.regex(result, /\[\]/);
});

test.serial.todo('deuxieme affichage: une date');
test.serial.todo('troisieme affichage: deux dates');
test.serial.todo('should not have a callback');
test.serial.todo('gestion erreurs ?');
