#!/usr/bin/env bash

set -eox pipefail

echo "Running custom npm install instead of npm ci..."
npm install --legacy-peer-deps
