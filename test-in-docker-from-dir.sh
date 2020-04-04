#!/usr/bin/env bash

# USAGE: TESTER=test-ex-1-5.js ./test-in-docker-from-dir.sh ./student-code/

# TODO: remplace "./student-code" by value of the first parameter, as specified in USAGE

PORT=3000

echo ""
echo "Stop and remove previous Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null

set -e # from now on, stop the script if any command returns a non-zero exit code

echo ""
echo "Generate Dockerfile from ./student-code..."
cat > Dockerfile << CONTENTS
FROM node:10
WORKDIR /usr/src/app
RUN npm install express
COPY ./student-code/ /usr/src/app/
RUN npm install
EXPOSE ${PORT}
ENV PORT ${PORT}
CMD [ "/bin/sh" ]
CONTENTS

echo ""
echo "Build Dockerfile..."
docker build -t my-nodejs-app .

echo ""
echo "Run Dockerfile..."
CONTAINER_ID=$(docker run -it --detach --name my-running-app -p ${PORT}:${PORT} my-nodejs-app)

set +e # from now on, keep running the script, even if a command returns a non-zero exit code
PORT=${PORT} ./start-student-server.sh

echo ""
echo "Run test suite against container..."
npm test 2>&1 # ${TESTER} will be passed

echo ""
echo "Stop and remove Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null
