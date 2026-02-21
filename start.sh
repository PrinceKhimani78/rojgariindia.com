#!/bin/bash
export NVM_DIR=~/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

export NODE_ENV=production
export PORT=3020
export NEXT_PUBLIC_BACKEND_API_URL=https://api.rojgariindia.com/api

cd /home/rojgariindia.com/app
exec node server.js
