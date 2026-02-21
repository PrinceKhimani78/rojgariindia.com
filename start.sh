#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=https://api.rojgariindia.com/api

cd /home/rojgariindia.com/app

NODE_EXE=$(which node || echo "node")
exec $NODE_EXE server.js
