#!/usr/bin/env bash

# USAGE: ./test-in-docker-from-git.sh https://gitlab.com/danylo.zhalkovskyy/node_app-web.git

REPO_URL="${1}" # e.g. "https://gitlab.com/danylo.zhalkovskyy/node_app-web.git"
PORT=3000

echo "Goint to test server from ${REPO_URL}, on port ${PORT}..."

echo ""
echo "Stop and remove previous Docker containers..."
docker stop my-running-app 2>&1 >/dev/null
docker rm -v my-running-app 2>&1 >/dev/null

echo ""
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
# CMD [ "node", "server.js" ]
CMD [ "/bin/sh" ]
CONTENTS

set -e # from now on, stop the script if any command returns a non-zero exit code

echo ""
echo "Build Dockerfile..."
docker build -t my-nodejs-app .
# docker build will return a non-zero code if the repository could not be cloned

echo ""
echo "Run Dockerfile..."
docker run -it --detach --name my-running-app -p ${PORT}:${PORT} my-nodejs-app

set +e # from now on, keep running the script, even if a command returns a non-zero exit code

echo ""
echo "Start server in container..."
docker exec -i my-running-app sh -c "node server.js &" 2>&1

echo ""
echo "Wait for server on port ${PORT}..."

MAX_RETRIES=10
retries=0
while :
do
  sleep 1
  res=$(curl -sL -w "%{http_code}" "localhost:$PORT" -o /dev/null)
  if [ $res -eq 200 ]; then
    echo "✅  Server is listening on port ${PORT}"
    break
  fi
  retries=$((retries+1))
  echo "($retries)"
  if [[ $retries -ge $MAX_RETRIES ]]; then
    echo "❌  Server is NOT listening on port ${PORT}."
    break
  fi
done

echo ""
echo "Run test suite against container..."
npm test

echo ""
echo "Stop and remove Docker containers..."
docker stop my-running-app 2>&1 >/dev/null
docker rm -v my-running-app 2>&1 >/dev/null