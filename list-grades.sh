#!/usr/bin/env bash

for file in eval/*.txt
do
  echo "${file},$(grep 'tests passed\|failed' ${file})"
done
