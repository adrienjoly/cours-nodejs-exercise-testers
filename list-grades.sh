#!/usr/bin/env bash

# Generates a list of grades based on a list of evaluated files.

# USAGE: ./list-grades.sh evaluated/Eval_*.txt

for file in $*
do
  echo "${file},$(grep -E ' tests? passed| tests? failed' ${file})"
done
