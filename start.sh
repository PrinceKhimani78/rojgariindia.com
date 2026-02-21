#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=https://api.rojgariindia.com/api

cd /home/rojgariindia.com/app
exec $(command -v node || which node || echo "node") server.js
