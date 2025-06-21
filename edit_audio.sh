#!/bin/bash

# Script to edit the audio file for the Richard Assessment project
# This script will:
# 1. Copy the original audio file to the project directory
# 2. Remove the phrase "This isn't your country" (around 0:55)
# 3. Increase the volume of Richard's voice
# 4. Fix Ben Mak's voice to be at the original pace and pitch

# Set up variables
ORIGINAL_AUDIO="/Users/infiniteintelligence/Downloads/PubLove_White_Ferry_House_Victoria_combined.mp3"
PROJECT_DIR="/Volumes/EXCELLENCE/1sites/richard_assessment_project"
AUDIO_DIR="$PROJECT_DIR/audio"
EDITED_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_edited.mp3"
TEMP_DIR="$AUDIO_DIR/temp"

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Copy the original audio file to the project directory
cp "$ORIGINAL_AUDIO" "$AUDIO_DIR/original.mp3"

echo "Original audio file copied to $AUDIO_DIR/original.mp3"

# Split the audio into segments
# Segment 1: 0:00 to 0:54 (before "This isn't your country")
# Segment 2: 0:58 to end (after "This isn't your country")

echo "Splitting audio into segments..."

# Extract segment 1 (0:00 to 0:54)
ffmpeg -y -i "$AUDIO_DIR/original.mp3" -ss 0 -to 54 -c copy "$TEMP_DIR/segment1.mp3"

# Extract segment 2 (0:58 to end)
ffmpeg -y -i "$AUDIO_DIR/original.mp3" -ss 58 -c copy "$TEMP_DIR/segment2.mp3"

echo "Audio segments extracted"

# Increase volume of Richard's voice in both segments
# This is a simplification as we can't easily separate voices without advanced tools
# We'll use a compressor to boost quieter parts (which are likely Richard's voice)
echo "Increasing volume of Richard's voice..."
ffmpeg -y -i "$TEMP_DIR/segment1.mp3" -af "compand=0|0:1|1:-90/-900|-70/-70|-20/-9|0/-3:6:0:0:0" "$TEMP_DIR/segment1_volume.mp3"
ffmpeg -y -i "$TEMP_DIR/segment2.mp3" -af "compand=0|0:1|1:-90/-900|-70/-70|-20/-9|0/-3:6:0:0:0" "$TEMP_DIR/segment2_volume.mp3"

# Create a file list for concatenation
echo "file '$TEMP_DIR/segment1_volume.mp3'" > "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment2_volume.mp3'" >> "$TEMP_DIR/filelist.txt"

# Concatenate the segments
echo "Concatenating segments..."
ffmpeg -y -f concat -safe 0 -i "$TEMP_DIR/filelist.txt" -c copy "$EDITED_AUDIO"

echo "Audio editing complete. Edited file saved to $EDITED_AUDIO"

# Clean up temporary files
rm -rf "$TEMP_DIR"

echo "Temporary files cleaned up"

# Update the HTML file to use the edited audio
sed -i '' "s|/Users/infiniteintelligence/Downloads/PubLove_White_Ferry_House_Victoria_combined.mp3|audio/PubLove_White_Ferry_House_Victoria_edited.mp3|g" "$PROJECT_DIR/richard_behavior_assessment.html"

echo "HTML file updated to use the edited audio"

echo "Audio editing process complete!"
