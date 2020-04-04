SOLUTIONS_REPO="https://adrienjoly:${GH_TOKEN}@github.com/adrienjoly/cours-nodejs-exercise-solutions.git"

mkdir test_results
TESTER=test-ex-1-3.js GIT_BRANCH=ex-1-3 ./test-in-docker-from-git.sh ${SOLUTIONS_REPO} | sed "s,[0-9][0-9]*\.*[0-9]*m*s,,g" >test_results/1-3.txt # exercices 1 à 3 (support de paramètres `GET`)
TESTER=test-ex-1-5.js GIT_BRANCH=ex-1-5 ./test-in-docker-from-git.sh ${SOLUTIONS_REPO} | sed "s,[0-9][0-9]*\.*[0-9]*m*s,,g" >test_results/1-5.txt # exercices 4 (support de paramètres `POST`) et 5 (persistance dans `réponses.json`)

# Note: sed "s,[0-9][0-9]*\.*[0-9]*m*s,,g" is to remove durations/timings expressed in seconds or milliseconds, from npm and ava

# TODO: compare with expected results and return non-zero error code in case of failure
