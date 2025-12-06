#!/bin/sh
set -e

PASSWORD=$(cat /run/secrets/redis_password)

sed "s/{{PASSWORD}}/$PASSWORD/" /etc/redis/redis.conf.template > /etc/redis/redis.conf

echo "Starting Redis with secret password..."
exec redis-server /etc/redis/redis.conf
