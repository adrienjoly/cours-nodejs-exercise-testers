#!/usr/bin/env bash

# USAGE: ./run-from-git.sh https://gitlab.com/danylo.zhalkovskyy/node_app-web.git

REPO_URL="${1}" # e.g. "https://gitlab.com/danylo.zhalkovskyy/node_app-web.git"
PORT=3000

echo "Generate Dockerfile from ${REPO_URL}..."
cat > Dockerfile << CONTENTS
FROM node:10
WORKDIR /usr/src/app
RUN git clone ${REPO_URL} .
RUN ls -a >files.log
RUN npm install
RUN npm install express
EXPOSE ${PORT}
ENV PORT ${PORT}
CMD [ "node", "server.js" ]
HEALTHCHECK --interval=4s --timeout=3s --retries=5 \
  CMD curl -f http://localhost:${PORT} || exit 1
# docker ps will show the container as "healthy" when the server is running
CONTENTS

# stop any previous instance
docker stop my-running-app

set -e # from now on, stop the script if any command returns a non-zero exit code

echo "Build and run Dockerfile..."
docker build -t my-nodejs-app .
# docker build will return a non-zero code if the repository could not be cloned

docker run -it --detach --rm --name my-running-app -p ${PORT}:${PORT} my-nodejs-app

echo ""
echo "Wait for server on port ${PORT}..."
STATE=$(until docker inspect --format "{{json .State.Health.Status }}" my-running-app 2>&1 | \
  grep -m 1 'healthy\|Error'; do sleep 1 ; done)

echo ""
if [ $STATE == '"healthy"' ]; then
  echo "✅  Server is listening on port ${PORT}"
  exit 0
else
  echo "❌  Server is NOT listening on port ${PORT}"
  exit 1
fi

echo "(To stop and delete the container: $ docker stop my-running-app)"
