#!/bin/bash

# docker build --no-cace -t dn-dashboard:latest .
docker compose build #--no-cache # force rebuild
# Stop and remove all containers
docker compose down
docker compose up -d
