#!/bin/bash
set -e

export MONGO_INITDB_ROOT_USERNAME=$(cat /run/secrets/mongo_root_username)
export MONGO_INITDB_ROOT_PASSWORD=$(cat /run/secrets/mongo_root_password)

echo "Using MongoDB secrets for root user..."

exec docker-entrypoint.sh mongod
