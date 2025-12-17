#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

cd /home/rojgariindia.com/app

# 🚀 STANDALONE ENTRY (NOT next start)
exec node server.js
