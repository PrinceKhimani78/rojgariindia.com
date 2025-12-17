#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020
export HOSTNAME=0.0.0.0

cd /home/rojgariindia.com/app

exec node .next/standalone/server.js
