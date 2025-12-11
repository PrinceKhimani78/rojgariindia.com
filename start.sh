#!/bin/bash
APP_DIR="/home/rojgariindia.com/app"

cd $APP_DIR

# Load env variables if exist
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo ">>> Starting rojgariindia.com Next.js on port 3010"
exec npm start -- -p 3010 -H 0.0.0.0
