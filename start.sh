#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

cd /home/rojgariindia.com/app

# IMPORTANT: run standalone server, NOT npx
exec node .next/standalone/server.js
