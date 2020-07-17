#!/usr/bin/env bash

# USAGE: TESTER=test-ex-1-5.js ./test-in-docker-from-dir.sh ./student-code/

PORT=3000
CODE_PATH="$1" # e.g. "./student-code"

echo ""
echo "Stop and remove previous Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null

set -e # from now on, stop the script if any command returns a non-zero exit code

echo ""
echo "🐳 Generate and run Dockerfile from ${CODE_PATH}..."
cat > Dockerfile << CONTENTS
FROM node:10
WORKDIR /usr/src/app
COPY ${CODE_PATH}/ /usr/src/app/
EXPOSE ${PORT}
ENV PORT ${PORT}
CMD [ "/bin/sh" ]
CONTENTS
DOCKER_BUILD_SHA=$(docker build --quiet -t my-nodejs-app .)
CONTAINER_ID=$(docker run -it --detach --name my-running-app -p ${PORT}:${PORT} my-nodejs-app)

set +e # from now on, keep running the script, even if a command returns a non-zero exit code

echo ""
echo "👾 Run test suite against container..."
# npx ava ${TESTER:=test-ex-1-3.js} --serial --tap | npx faucet 2>&1
npx ava ${TESTER:=test-ex-1-3.js} --serial -v 2>&1

echo ""
echo "🧹 Stop and remove Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null
