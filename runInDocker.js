const util = require('util');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const CONTAINER_NAME = 'my-running-app';

const runInDocker = (command, log) =>
  exec(
    `docker exec ${CONTAINER_NAME} sh -c "${command.replace(/"/g, '\\"')}"`
  ).then(({ stderr, stdout }) => {
    if (log) {
      log(stdout);
      log(stderr);
    } else if (stderr) {
      console.error(stderr);
    }
    return stdout;
  });

const runInDockerBg = (command, log = () => {}) => {
  const serverProcess = childProcess.spawn('docker', [
    `exec`,
    `${CONTAINER_NAME}`,
    `sh`,
    `-c`,
    `${command}`
  ]);
  serverProcess.stdout.on('data', data => log(data.toString('utf8')));
  serverProcess.stderr.on('data', data => log(data.toString('utf8')));
  serverProcess.on('exit', data => log('exited with ' + data));
};

const waitUntilServerRunning = port =>
  exec(`PORT=${port} ./wait-for-student-server.sh`);

async function startServer(envVars = {}) {
  const log = envVars.log || console.warn;
  log(`\nInstall project dependencies in container...`);
  await runInDocker(`npm install --no-audit`, log);
  await runInDocker(`npm install --no-audit express`, log); // TODO: don't install express

  const serverFile = (
    (await runInDocker(
      `node -e "console.log(require('./package.json').main)"`,
      log
    )) || 'server.js'
  ).trim();

  log(`\nStart ${serverFile} in container...`);
  const vars = Object.keys(envVars)
    .map(key => `${key}="${envVars[key]}"`) // TODO: escape quotes
    .join(' ');
  runInDockerBg(`${vars} node ${serverFile} 2>&1`, log);
}

async function startServerAndWaitUntilRunning(port, serverEnvVars = {}) {
  await startServer(serverEnvVars);
  await waitUntilServerRunning(port);
}

exports.CONTAINER_NAME = CONTAINER_NAME;
exports.runInDocker = runInDocker;
exports.startServer = startServer;
exports.waitUntilServerRunning = waitUntilServerRunning;
exports.startServerAndWaitUntilRunning = startServerAndWaitUntilRunning;
exports.killSync = pid =>
  childProcess.execSync(`docker exec ${CONTAINER_NAME} kill ${pid}`);
