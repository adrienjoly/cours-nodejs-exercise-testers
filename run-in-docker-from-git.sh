#!/usr/bin/env bash

# USAGE: ./run-from-git.sh https://gitlab.com/danylo.zhalkovskyy/node_app-web.git

REPO_URL="${1}" # e.g. "https://gitlab.com/danylo.zhalkovskyy/node_app-web.git"
PORT=3000

echo "Generate Dockerfile from ${REPO_URL}..."
cat > Dockerfile << CONTENTS
FROM node:10
WORKDIR /usr/src/app
RUN git clone ${REPO_URL} .
RUN npm install
EXPOSE ${PORT}
CMD [ "npm", "start" ]
CONTENTS

echo "Build and run Dockerfile..."
docker build -t my-nodejs-app .

echo ""
echo "(Press Ctrl-C to exit)"
docker run -it --rm --name my-running-app -p ${PORT}:${PORT} my-nodejs-app

echo ""
rm Dockerfile && echo "✅ Deleted the generated Dockerfile."
