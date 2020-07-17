SOLUTIONS_REPO="https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git"

mkdir -p test_results >/dev/null

# Note: we use sed to remove durations/timings expressed in seconds or milliseconds, from npm and ava
removeTimings () {
  sed "s, (*[0-9][0-9]*\.*[0-9]*m*s)*,,g"
}

removeNodeProcessId () {
  sed "s,(node:[0-9][0-9]*) ,(node) ,g"
}

testFromGit () {
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

testFromDir () {
  echo ""
  echo "___ Testing ./$1 ___"
  ./test-in-docker-from-dir.sh $1 \
    | removeTimings \
    | removeNodeProcessId \
    > test_results/$1.txt

  # Now, let's compare the output with the golden file (i.e. expected output)
  git --no-pager diff test_results/$1.txt
  echo ""
}

# Test suite: Partiel 2A WebDev 2020
TESTER=test-partiel.js testFromDir partiel-solution

# Test suite: Première partie du cours Node.js: Chat-bot avec Express (https://adrienjoly.com/cours-nodejs/01-chatbot/)
TESTER=test-ex-1-3.js GIT_BRANCH=ex-1-3 testFromGit # exercices 1 à 3 (support de paramètres `GET`)
TESTER=test-ex-1-5.js GIT_BRANCH=ex-1-5 testFromGit # exercices 4 (support de paramètres `POST`) et 5 (persistance dans `réponses.json`)

# Test suite: Deuxième partie du cours Node.js: Connexion base de données MongoDB (https://adrienjoly.com/cours-nodejs/02-db/)
TESTER=test-ex-2-*.js GIT_BRANCH=ex-2-2 testFromGit # exercices 1 et 2

# Return a non-zero error code if any output file has changed
exit $(git diff | wc -l)
