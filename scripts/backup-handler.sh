#!/bin/bash

# Check if source and destination paths are provided as arguments
if [ -z "$1" ]; then
    echo "Error: Source path is missing."
    echo "Usage: $0 <source_path> <destination_path>"
    exit 1
fi

if [ -z "$2" ]; then
    echo "Error: Destination path is missing."
    echo "Usage: $0 <source_path> <destination_path>"
    exit 1
fi

# Assign arguments to variables
SOURCE_PATH="$1"
DEST_PATH="$2"

# Ensure source path exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo "Error: Source path '$SOURCE_PATH' does not exist."
    exit 1
fi

# Ensure destination directory exists
mkdir -p "$DEST_PATH"

# Generate timestamp for backup folder
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FOLDER="$DEST_PATH/backup-$TIMESTAMP" 

# Create a new backup by copying data
echo "$TIMESTAMP - Creating backup: $BACKUP_FOLDER"
cp -r "$SOURCE_PATH" "$BACKUP_FOLDER"

# Keep only the last 2 backups (delete older ones if they exist)
echo "Cleaning up old backups..."
cd "$DEST_PATH" || exit

BACKUP_COUNT=$(ls -1d backup-* 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt 2 ]; then
    # ls -tpd backup-* | grep /$ | tail -n +3 | xargs -r rm -rf
    ls -1dt backup-* | tail -n +3 | xargs -r rm -rf
fi
 
echo "$END_TIME - Backup process completed successfully!"
