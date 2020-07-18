const util = require('util');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const CONTAINER_NAME = 'my-running-app';

const escapeQuotes = (str = '') => ('' + str).replace(/"/g, '\\"');

const displayStackUntilError = str => {
  const lines = str.trim().split(/[\r\n]+/);
  return lines
    .slice(0, lines.findIndex(line => /error/i.test(line)) + 1)
    .join('\n');
};

const bareRunInDocker = command =>
  exec(`docker exec ${CONTAINER_NAME} sh -c "${escapeQuotes(command)}"`);

const runInDocker = (command, log) =>
  bareRunInDocker(command).then(({ stderr, stdout }) => {
    if (log) {
      log(stdout);
      log(stderr);
    } else if (stderr) {
      console.error(stderr);
    }
    return stdout;
  });

// Run a command from a separate directory, to prevent "npm install" commands
// from failing because of an invalid student-provided package.json file.
const runInDockerSeparate = (command, log) =>
  exec(
    `docker exec -w /usr/src ${CONTAINER_NAME} sh -c "${escapeQuotes(command)}"`
  ).then(({ stderr, stdout }) => {
    if (log) {
      log(stdout);
      log(stderr);
    } else if (stderr) {
      console.error(stderr);
    }
    return stdout;
  });

const runInDockerBg = (command, debug = () => {}) =>
  new Promise((resolve, reject) => {
    const logs = [];
    let log = str => logs.push(str);
    const serverProcess = childProcess.spawn('docker', [
      `exec`,
      `${CONTAINER_NAME}`,
      `sh`,
      `-c`,
      `${command}`
    ]);
    serverProcess.stdout.on('data', data => {
      const str = data.toString('utf8');
      log(str);
      if (/error/i.test(str)) {
        console.error(displayStackUntilError(str));
      }
    });
    serverProcess.stderr.on('data', data =>
      console.error(data.toString('utf8'))
    );
    serverProcess.on('exit', data => {
      logs.forEach(str => console.error(str));
      reject(new Error('runInDockerBg process exited with ' + data));
    });
    setTimeout(() => {
      logs.forEach(str => debug(str));
      log = debug;
      resolve();
    }, 2000); // resolve by default, after 2 seconds of runtime
  });

const waitUntilServerRunning = port =>
  exec(`PORT=${port} ./wait-for-student-server.sh`);

const getServerFileName = () =>
  runInDocker(
    `node -e "console.log(require('./package.json').main)"`,
    log
  ).then(filename => filename.trim);

async function startServer(envVars = {}) {
  const log = envVars.log || console.warn;
  log(`\nInstall project dependencies in container...`);
  try {
    await bareRunInDocker(`npm install --no-audit`);
  } catch (err) {
    let code, file;
    err
      .toString()
      .split(/[\r\n]+/)
      .forEach(line => {
        code = code || (line.match(/npm ERR\! code (.*)/) || [])[1];
        file = file || (line.match(/npm ERR\! file (.*)/) || [])[1];
      });
    console.error(`🔶 can't npm install, code: ${code}, file: ${file}`);
  }

  const serverFile = 'server.js'; // or await getServerFileName()

  log(`\nStart ${serverFile} in container...`);
  const vars = Object.keys(envVars)
    .map(key => `${key}="${escapeQuotes(envVars[key])}"`)
    .join(' ');
  return await runInDockerBg(`${vars} node ${serverFile} 2>&1`, log);
}

async function startServerAndWaitUntilRunning(port, serverEnvVars = {}) {
  await startServer(serverEnvVars);
  await waitUntilServerRunning(port);
}

exports.CONTAINER_NAME = CONTAINER_NAME;
exports.runInDocker = runInDocker;
exports.runInDockerSeparate = runInDockerSeparate;
exports.startServer = startServer;
exports.waitUntilServerRunning = waitUntilServerRunning;
exports.startServerAndWaitUntilRunning = startServerAndWaitUntilRunning;
exports.killSync = pid =>
  childProcess.execSync(`docker exec ${CONTAINER_NAME} kill ${pid}`);
