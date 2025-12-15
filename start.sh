#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

APP_DIR="/home/rojgariindia.com/app"

cd $APP_DIR

echo ">>> Starting rojgariindia.com Next.js custom server on port $PORT"

exec node server.js
