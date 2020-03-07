#!/usr/bin/env bash

for file in eval/*.txt
do
  echo "${file},$(grep -E ' tests? passed| tests? failed' ${file})"
done
