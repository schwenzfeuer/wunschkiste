#!/bin/sh
set -e

echo "Running database migrations..."
node migrate.mjs

echo "Starting Next.js..."
node server.js
