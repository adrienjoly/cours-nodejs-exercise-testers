# Note: we use sed to remove durations/timings expressed in seconds or milliseconds, from npm and ava
removeTimings () {
  sed "s, (*[0-9][0-9]*\.*[0-9]*m*s)*,,g"
}

removeNodeProcessId () {
  sed "s,(node:[0-9][0-9]*) ,(node) ,g"
}

test () {
  echo ""
  echo "___ Testing PARTIEL ___"
  ./test-in-docker-from-dir.sh ./partiel-solution \
    | removeTimings \
    | removeNodeProcessId \
    > test_results/PARTIEL.txt

  # Now, let's compare the output with the golden file (i.e. expected output)
  git --no-pager diff test_results/PARTIEL.txt
  echo ""
}

TESTER=test-partiel.js test
