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

SCRIPT_NAME=$(docker exec my-running-app sh -c "[ -f server.js ] && echo \"server.js\" || node -e \"console.log(require('./package.json').main)\"")
echo ""
echo "Start ${SCRIPT_NAME} in container..."
docker exec my-running-app sh -c "node ${SCRIPT_NAME} 2>&1" &

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
npm test 2>&1 # ${TESTER} will be passed

echo ""
echo "Stop and remove Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null
