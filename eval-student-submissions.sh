#!/bin/bash

# This script evaluates the cloned repositories submitted by students, to log and csv formats.
# (one student grade per line)

# Usage: TESTER=test-ex-1-5.js ./eval-student-submissions.sh ./submissions/*

EVAL_PATH="./evaluated"
rm -rf ${EVAL_PATH} 2>/dev/null >/dev/null
mkdir ${EVAL_PATH} &>/dev/null

for FILEPATH in $*;
do
  FILENAME=$(basename "${FILEPATH}")
  STUDENT_NAME="${FILENAME%.*}"

  echo "* Evaluating ${FILEPATH} to ${EVAL_PATH}/ ..."
  rm -rf ./student-code 2>/dev/null >/dev/null
  cp -r ${FILEPATH} ./student-code
  ./test-in-docker-from-dir.sh ./student-code/ >${EVAL_PATH}/Eval_${STUDENT_NAME}.txt
done;

rm -rf ./student-code 2>/dev/null >/dev/null

echo "Saving padded list of student grades to ${EVAL_PATH}/scores.txt..."
./list-grades.sh ${EVAL_PATH}/Eval_*.txt \
  | column -t -s "," \
  > ${EVAL_PATH}/scores.txt

# TODO: generate scores-detail.csv and distribution chart (scores-chart.txt), like in js-test

echo "✅  Done!"
