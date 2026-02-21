#!/bin/bash
set -e

# Load NVM/Node if not in path
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
fi

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=https://api.rojgariindia.com/api

cd /home/rojgariindia.com/app

NODE_EXE=$(command -v node || which node || echo "node")
exec $NODE_EXE server.js
