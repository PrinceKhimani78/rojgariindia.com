#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

cd /home/rojgariindia.com/app

# Standalone Next.js server
exec node .next/standalone/server.js
