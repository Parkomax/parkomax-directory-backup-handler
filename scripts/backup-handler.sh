#!/bin/bash

SOURCE_PATH="$1"
DEST_PATH="$2"

if [ -z "$SOURCE_PATH" ] || [ -z "$DEST_PATH" ]; then
  echo "Usage: $0 <source_path> <destination_path>"
  exit 1
fi

# Validate source
if [ ! -d "$SOURCE_PATH" ]; then
  echo "Source path does not exist: $SOURCE_PATH"
  exit 1
fi

mkdir -p "$DEST_PATH"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FOLDER="$DEST_PATH/backup-$TIMESTAMP"
mkdir -p "$BACKUP_FOLDER"

echo "$TIMESTAMP - Starting backup..."

### Step 1: Directory backup
echo "Backing up files from $SOURCE_PATH"
cp -r "$SOURCE_PATH" "$BACKUP_FOLDER/files"

### Step 2: PostgreSQL backup using pg_dump
if [ -n "$PGDATABASE" ]; then
  echo "Backing up PostgreSQL DB: $PGDATABASE"

  # Set pgpass for non-interactive auth
  PGPASSFILE=$(mktemp)
  chmod 600 "$PGPASSFILE"
  echo "*:*:*:$PGUSER:$PGPASSWORD" > "$PGPASSFILE"
  export PGPASSFILE

  pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -F c -b -v -f "$BACKUP_FOLDER/db_backup.dump" "$PGDATABASE"

  rm -f "$PGPASSFILE"
  unset PGPASSFILE
else
  echo "PGDATABASE not set, skipping DB backup"
fi

### Step 3: Cleanup older backups
cd "$DEST_PATH" || exit
echo "Cleaning up old backups..."
ls -1dt backup-* 2>/dev/null | tail -n +$((BACKUP_COUNT + 1)) | xargs -r rm -rf

echo "$(date +"%Y-%m-%d_%H-%M-%S") - Backup completed: $BACKUP_FOLDER"
