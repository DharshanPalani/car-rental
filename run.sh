#!/bin/bash

echo "Starting server and dev..."

npm run server &
SERVER_PID=$!

npm run dev &
DEV_PID=$!

cleanup() {
  echo "Stopping processes..."
  kill $SERVER_PID
  kill $DEV_PID
  exit
}

trap cleanup SIGINT SIGTERM

wait