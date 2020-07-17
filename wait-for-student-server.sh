#!/usr/bin/env bash

set +e # from now on, keep running the script, even if a command returns a non-zero exit code

echo ""
echo "Wait for server on port ${PORT}..."

MAX_RETRIES=3
retries=0
while :
do
  sleep 1
  res=$(curl --max-time 1 -sL -w "%{http_code}" "localhost:$PORT" -o /dev/null)
  if [ $res -eq 200 ]; then
    echo "✅  Server is listening on port ${PORT}"
    break
  fi
  retries=$((retries+1))
  echo "($retries)"
  if [[ $retries -ge $MAX_RETRIES ]]; then
    echo "❌  Server is NOT listening on port ${PORT}."
    exit 1
  fi
done
