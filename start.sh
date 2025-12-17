#!/bin/bash
set -e

export NODE_ENV=production
export PORT=3020

cd /home/rojgariindia.com/app

exec ./node_modules/.bin/next start -p 3020
