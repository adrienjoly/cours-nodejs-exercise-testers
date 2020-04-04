#!/usr/bin/env bash

set +e # from now on, keep running the script, even if a command returns a non-zero exit code

SCRIPT_NAME=$(docker exec my-running-app sh -c "[ -f server.js ] && echo \"server.js\" || node -e \"console.log(require('./package.json').main)\"")
echo ""
echo "Start ${SCRIPT_NAME} in container..."
docker exec my-running-app sh -c "node ${SCRIPT_NAME} 2>&1" &

echo ""
echo "Wait for server on port ${PORT}..."

MAX_RETRIES=10
retries=0
while :
do
  sleep 1
  res=$(curl -sL -w "%{http_code}" "localhost:$PORT" -o /dev/null)
  if [ $res -eq 200 ]; then
    echo "✅  Server is listening on port ${PORT}"
    break
  fi
  retries=$((retries+1))
  echo "($retries)"
  if [[ $retries -ge $MAX_RETRIES ]]; then
    echo "❌  Server is NOT listening on port ${PORT}."
    break
  fi
done
