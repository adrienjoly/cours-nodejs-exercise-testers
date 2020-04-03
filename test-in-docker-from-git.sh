#!/usr/bin/env bash

# USAGE: TESTER=test-ex-1-5.js ./test-in-docker-from-git.sh https://gitlab.com/danylo.zhalkovskyy/node_app-web.git

REPO_URL="${1}" # e.g. "https://gitlab.com/danylo.zhalkovskyy/node_app-web.git"

echo "Going to test server from ${REPO_URL}, on port ${PORT}..."
>&2 echo "Going to test server from ${REPO_URL}, on port ${PORT}..."

echo ""
echo "Remove previous student-code directory..."
rm -rf ./student-code 2>/dev/null >/dev/null

set -e # from now on, stop the script if any command returns a non-zero exit code

echo ""
echo "Clone student's repository (${REPO_URL}, branch: ${GIT_BRANCH:=master})..."
git clone ${REPO_URL} ./student-code --depth 1 --no-single-branch 2>&1 \
  && cd ./student-code \
  && git checkout ${GIT_BRANCH:=master} 2>&1 \
  && cd ..

# If you want to make some changes in the student's code, uncomment the following line
# read -p "Press ENTER when you're ready to run the tests" -n 1 -r

./test-in-docker-from-dir.sh ./student-code/

echo ""
echo "Remove previous student-code directory..."
rm -rf ./student-code 2>/dev/null >/dev/null
