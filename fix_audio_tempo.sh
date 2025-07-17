#!/bin/bash

# Script to fix the tempo issue at 2:50 in the audio file
# This script will:
# 1. Split the audio into three parts: before 2:50, the problematic section, and after
# 2. Apply tempo correction to the problematic section
# 3. Re-concatenate all parts

# Set up variables
AUDIO_DIR="/workspaces/richard-assessment/audio"
INPUT_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_edited.mp3"
FIXED_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_fixed.mp3"
TEMP_DIR="/tmp/audio_temp"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Starting audio tempo correction process..."

# Calculate time positions in seconds
# 2:50 = 170 seconds
# We'll take a section from 2:50 (170s) to around 3:20 (200s) to fix
# This can be adjusted based on how long the tempo issue persists
BEFORE_ISSUE_END=170      # 2:50
AFTER_ISSUE_START=200     # 3:20

echo "Splitting audio into segments..."

# Extract segment 1 (0:00 to 2:50)
ffmpeg -y -i "$INPUT_AUDIO" -ss 0 -to $BEFORE_ISSUE_END -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment1.mp3"

# Extract segment 2 (2:50 to 3:20) - the problematic section
ffmpeg -y -i "$INPUT_AUDIO" -ss $BEFORE_ISSUE_END -to $AFTER_ISSUE_START -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment2_original.mp3"

# Extract segment 3 (3:20 to end)
ffmpeg -y -i "$INPUT_AUDIO" -ss $AFTER_ISSUE_START -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment3.mp3"

echo "Fixing tempo of the problematic segment..."

# Apply tempo correction to segment 2
# The atempo filter can adjust tempo without affecting pitch
# A value of 1.1 means 10% speed increase - adjust as needed
ffmpeg -y -i "$TEMP_DIR/segment2_original.mp3" -filter:a "atempo=1.1" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment2_fixed.mp3"

# Create a file list for concatenation
echo "file '$TEMP_DIR/segment1.mp3'" > "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment2_fixed.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment3.mp3'" >> "$TEMP_DIR/filelist.txt"

# Concatenate the segments
echo "Concatenating segments..."
ffmpeg -y -f concat -safe 0 -i "$TEMP_DIR/filelist.txt" -c:a libmp3lame -q:a 2 "$FIXED_AUDIO"

echo "Audio tempo correction complete. Fixed file saved to $FIXED_AUDIO"

# Clean up temporary files
rm -rf "$TEMP_DIR"

echo "Temporary files cleaned up"
echo "Audio fixing process complete!"
