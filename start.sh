#!/bin/bash

APP_DIR="/home/rojgariindia.com/app/release"

cd $APP_DIR

# Load environment variables if exist
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo ">>> Starting Next.js on port 3010"
exec npm start -- -p 3010 -H 0.0.0.0
