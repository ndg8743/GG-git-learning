#!/bin/bash

# Set variables
REPO_DIR="."
LOG_FILE="./update.log"

# Log function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Change to repository directory
cd "$REPO_DIR" || {
  log "Error: Could not change to repository directory"
  exit 1
}

# Log start
log "Starting repository update"

# Pull the latest changes
log "Pulling latest changes from repository"
git pull origin main >> "$LOG_FILE" 2>&1 || {
  log "Error: Git pull failed"
  exit 1
}

# Rebuild the frontend if needed
if [ -d "$REPO_DIR/frontend" ]; then
  log "Rebuilding frontend"
  cd "$REPO_DIR/frontend" && npm install && npm run build >> "$LOG_FILE" 2>&1 || {
    log "Error: Frontend rebuild failed"
    exit 1
  }
fi

# Return to main directory
cd "$REPO_DIR" || {
  log "Error: Could not change back to repository directory"
  exit 1
}

# Restart the application
log "Restarting Node.js application"
pm2 reload all >> "$LOG_FILE" 2>&1 || {
  log "Error: Application restart failed"
  exit 1
}

log "Update process completed"

exit 0