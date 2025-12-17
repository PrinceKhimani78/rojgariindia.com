#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

cd /home/rojgariindia.com/app

# IMPORTANT: standalone server
exec node server.js
