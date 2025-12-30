#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=http://api.rojgariindia.com/api

cd /home/rojgariindia.com/app

exec node server.js
