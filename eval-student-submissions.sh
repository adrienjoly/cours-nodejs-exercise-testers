#!/bin/bash

# This script evaluates the cloned repositories submitted by students, to log and csv formats.
# (one student grade per line)

# Usage: TESTER=test-ex-1-5.js ./eval-student-submissions.sh ./submissions/*

# Note: we use sed to remove durations/timings expressed in seconds or milliseconds, from npm and ava
removeTimings () {
  perl -pi'' -e "s, \(*[0-9][0-9]*\.*[0-9]*m*s\)*,,g" $1
}

removeNodeProcessId () {
  perl -pi'' -e "s,\(node:[0-9][0-9]*\) ,(node) ,g" $1
}

removeMongodbLogTimestamps () {
  perl -pi'' -e "s,\[31m\[[^\]]+\] ,,g" $1
}
# TODO: extract these cleaning scripts to a separate file + and re-use them in ./test.sh

EVAL_PATH="./evaluated"
rm -rf ${EVAL_PATH} 2>/dev/null >/dev/null
mkdir ${EVAL_PATH} &>/dev/null

for FILEPATH in $*;
do
  FILENAME=$(basename "${FILEPATH}")
  STUDENT_NAME="${FILENAME%.*}"

  echo "* Evaluating ${FILEPATH} to ${EVAL_PATH}/ ..."
  OUT_FILE="${EVAL_PATH}/Eval_${STUDENT_NAME}.txt"
  ./test-in-docker-from-dir.sh ${FILEPATH} > ${OUT_FILE}
  # print tests that failed because of uncaught exceptions (to be handled by evaluator)
  grep -E ' Rejected promise returned by test$' ${OUT_FILE}
  # print and save student score
  SCORE=$(grep -E ' tests? passed| tests? failed' ${OUT_FILE})
  echo "  👉 ${SCORE}"
  echo "${STUDENT_NAME},${SCORE}" >> ${EVAL_PATH}/scores.txt
  # print uncaught exceptions/rejections that may have interrupted ava's execution (to be handled by evaluator)
  echo "     $(grep -E ' uncaught ' ${OUT_FILE})"
  # clean up out file
  removeTimings ${OUT_FILE}
  removeNodeProcessId ${OUT_FILE}
  removeMongodbLogTimestamps ${OUT_FILE}
done;

echo "Saving padded list of student grades to ${EVAL_PATH}/scores.txt..."
./list-grades.sh ${EVAL_PATH}/Eval_*.txt \
  | column -t -s "," \
  > ${EVAL_PATH}/scores.txt

# TODO: generate scores-detail.csv and distribution chart (scores-chart.txt), like in js-test

echo "✅  Done!"
