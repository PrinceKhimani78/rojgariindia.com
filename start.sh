#!/bin/bash

# Load .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

exec /usr/bin/npm start -- -p 3010 -H 0.0.0.0
