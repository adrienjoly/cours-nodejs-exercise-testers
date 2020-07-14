const util = require('util');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const runInDockerSync = command => {
  try {
    return childProcess
      .execSync(
        `docker exec my-running-app sh -c "${command.replace(/"/g, '\\"')}"`
      )
      .toString();
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

const runInDocker = command =>
  exec(
    `docker exec my-running-app sh -c "${command.replace(/"/g, '\\"')}"`
  ).then(({ stderr, stdout }) => {
    if (stderr) console.error(stderr);
    return stdout;
  });

const runInDockerBg = command => {
  const serverProcess = childProcess.exec(
    `docker exec my-running-app sh -c "${command.replace(/"/g, '\\"')}"`
  );
  serverProcess.stdout.on('data', data => {
    console.log(data);
  });
  serverProcess.stderr.on('data', data => {
    console.error(data);
  });
};

function waitUntilServerRunning(port) {
  console.warn(
    childProcess
      .execSync(`PORT=${port} ./wait-for-student-server.sh`)
      .toString()
  );
}

function startServer(envVars = {}) {
  console.warn(`\nInstall project dependencies in container...`);
  console.warn(runInDockerSync(`npm install --no-audit`));
  console.warn(runInDockerSync(`npm install --no-audit express`));

  const serverFile = (
    runInDockerSync(`node -e "console.log(require('./package.json').main)"`) ||
    'server.js'
  ).trim();

  console.warn(`\nStart ${serverFile} in container...`);
  const vars = Object.keys(envVars)
    .map(key => `${key}="${envVars[key]}"`) // TODO: escape quotes
    .join(' ');
  runInDockerBg(`${vars} node ${serverFile} 2>&1`);
}

function startServerAndWaitUntilRunning(port, serverEnvVars = {}) {
  startServer(serverEnvVars);
  waitUntilServerRunning(port);
}

exports.runInDocker = runInDocker;
exports.runInDockerBg = runInDockerBg;
exports.startServerAndWaitUntilRunning = startServerAndWaitUntilRunning;
