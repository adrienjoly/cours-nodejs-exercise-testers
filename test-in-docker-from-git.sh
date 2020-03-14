#!/usr/bin/env bash

# USAGE: ./test-in-docker-from-git.sh https://gitlab.com/danylo.zhalkovskyy/node_app-web.git

REPO_URL="${1}" # e.g. "https://gitlab.com/danylo.zhalkovskyy/node_app-web.git"
PORT=3000

echo "Going to test server from ${REPO_URL}, on port ${PORT}..."
>&2 echo "Going to test server from ${REPO_URL}, on port ${PORT}..."

echo ""
echo "Stop and remove previous Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null

echo ""
echo "Generate Dockerfile from ${REPO_URL} (branch: ${GIT_BRANCH:=master})..."
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
echo "Remove previous student-code directory..."
rm -rf ./student-code 2>/dev/null >/dev/null

set -e # from now on, stop the script if any command returns a non-zero exit code

echo ""
echo "Clone student's repository..."
git clone ${REPO_URL} ./student-code --depth 1 --no-single-branch 2>&1 \
  && cd ./student-code \
  && git checkout ${GIT_BRANCH:=master} 2>&1 \
  && ls -a >files.log \
  && cd ..

# If you want to make some changes in the student's code, uncomment the following line
# read -p "Press ENTER when you're ready to run the tests" -n 1 -r

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
npm test 2>&1

echo ""
echo "Stop and remove Docker containers..."
docker stop my-running-app 2>/dev/null >/dev/null
docker rm -v my-running-app 2>/dev/null >/dev/null

echo ""
echo "Remove previous student-code directory..."
rm -rf ./student-code 2>/dev/null >/dev/null
