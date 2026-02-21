#!/bin/bash
set -e

# Load NVM/Node environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=https://api.rojgariindia.com/api

cd /home/rojgariindia.com/app

NODE_EXE=$(command -v node || which node || echo "node")
exec $NODE_EXE server.js
