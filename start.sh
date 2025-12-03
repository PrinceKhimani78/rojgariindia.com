#!/bin/bash

cd /home/rojgariindia.com/app

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo ">>> Starting Next.js on port 3010"
exec /usr/bin/npm start -- -p 3010 -H 0.0.0.0
