SOLUTIONS_REPO="https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git"

mkdir -p test_results >/dev/null

test () {
  echo ""
  echo "___ Testing ${GIT_BRANCH} ___"
  ./test-in-docker-from-git.sh ${SOLUTIONS_REPO} \
    | sed "s, (*[0-9][0-9]*\.*[0-9]*m*s)*,,g" \
    > test_results/${GIT_BRANCH}.txt
  # Note: we use sed to remove durations/timings expressed in seconds or milliseconds, from npm and ava

  # Now, let's compare the output with the golden file (i.e. expected output)
  git --no-pager diff test_results/${GIT_BRANCH}.txt
  echo ""
}

# Test suite: Première partie du cours Node.js: Chat-bot avec Express (https://adrienjoly.com/cours-nodejs/01-chatbot/)
TESTER=test-ex-1-3.js GIT_BRANCH=ex-1-3 test # exercices 1 à 3 (support de paramètres `GET`)
TESTER=test-ex-1-5.js GIT_BRANCH=ex-1-5 test # exercices 4 (support de paramètres `POST`) et 5 (persistance dans `réponses.json`)

# Return a non-zero error code if any output file has changed
exit $(git diff | wc -l)
