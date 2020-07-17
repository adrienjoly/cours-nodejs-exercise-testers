SOLUTIONS_REPO="https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git"

mkdir -p test_results >/dev/null

# Note: we use sed to remove durations/timings expressed in seconds or milliseconds, from npm and ava
removeTimings () {
  sed "s, (*[0-9][0-9]*\.*[0-9]*m*s)*,,g"
}

removeNodeProcessId () {
  sed "s,(node:[0-9][0-9]*) ,(node) ,g"
}

test () {
  echo ""
  echo "___ Testing ${GIT_BRANCH} ___"
  ./test-in-docker-from-git.sh ${SOLUTIONS_REPO} \
    | removeTimings \
    | removeNodeProcessId \
    > test_results/${GIT_BRANCH}.txt

  # Now, let's compare the output with the golden file (i.e. expected output)
  git --no-pager diff test_results/${GIT_BRANCH}.txt
  echo ""
}

# Test suite: Première partie du cours Node.js: Chat-bot avec Express (https://adrienjoly.com/cours-nodejs/01-chatbot/)
TESTER=test-ex-1-3.js GIT_BRANCH=ex-1-3 test # exercices 1 à 3 (support de paramètres `GET`)
TESTER=test-ex-1-5.js GIT_BRANCH=ex-1-5 test # exercices 4 (support de paramètres `POST`) et 5 (persistance dans `réponses.json`)

# Test suite: Deuxième partie du cours Node.js: Connexion base de données MongoDB (https://adrienjoly.com/cours-nodejs/02-db/)
TESTER=test-ex-2-*.js GIT_BRANCH=ex-2-2 test # exercices 1 et 2

TESTER=test-partiel.js ./test-in-docker-from-dir.sh ./partiel-solution > test_results/test-partiel.txt

# Return a non-zero error code if any output file has changed
exit $(git diff | wc -l)
