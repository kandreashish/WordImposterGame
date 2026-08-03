#!/bin/bash
set -e

# Deployment script for Raspberry Pi (Docker Container Update)

echo "=========================================="
echo "🚀 Updating Word Imposter Game Container"
echo "=========================================="

# 1. Navigate to script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 2. Pull latest changes from git main branch
echo "📥 Pulling latest changes from git..."
git fetch origin main
git reset --hard origin/main

# 3. Rebuild and restart docker container
echo "🐳 Rebuilding and restarting Docker container..."
if command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
elif docker compose version &> /dev/null; then
    docker compose down
    docker compose build --no-cache
    docker compose up -d
else
    echo "❌ Neither 'docker-compose' nor 'docker compose' found!"
    exit 1
fi

# 4. Clean up unused images to free up space on Raspberry Pi SD card / SSD
echo "🧹 Pruning old unused Docker build caches/images..."
docker image prune -f

echo "=========================================="
echo "✅ Update complete! Running containers:"
echo "=========================================="
docker ps --filter "name=word-imposter-game"
