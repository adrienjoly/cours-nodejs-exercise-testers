const childProcess = require('child_process');

const runInDocker = command => {
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

exports.runInDocker = runInDocker;
