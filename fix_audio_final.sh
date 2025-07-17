#!/bin/bash

# Script to fix multiple audio issues in the PubLove audio file
# This script will:
# 1. Increase volume of the first voice throughout the audio
# 2. Cut from 1:46 to 1:49
# 3. Increase volume of Richard's mouth click from 1:35-1:37 even more
# 4. Fix slower/lower voice from 1:49-2:11 and increase Richard's volume
# 5. Fix the tempo issue at 2:50

# Set up variables
AUDIO_DIR="/workspaces/richard-assessment/audio"
INPUT_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_edited.mp3"
FIXED_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_final.mp3"
TEMP_DIR="/tmp/audio_temp_final"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Starting final audio correction process..."

# Calculate time positions in seconds
# 1:35 = 95s, 1:37 = 97s, 1:46 = 106s, 1:49 = 109s, 2:11 = 131s, 2:50 = 170s, 3:20 = 200s
SEGMENT1_END=95        # 1:35
SEGMENT2_END=97        # 1:37
SEGMENT3_END=106       # 1:46
SEGMENT4_START=109     # 1:49
SEGMENT5_END=131       # 2:11
SEGMENT6_END=170       # 2:50
SEGMENT7_END=200       # 3:20

echo "Splitting audio into segments..."

# Extract segment 1 (0:00 to 1:35) - Increase volume of first voice
ffmpeg -y -i "$INPUT_AUDIO" -ss 0 -to $SEGMENT1_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment1.mp3"

# Extract segment 2 (1:35 to 1:37) - Richard's mouth click to increase volume even more
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT1_END -to $SEGMENT2_END -filter:a "volume=2.5" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment2.mp3"

# Extract segment 3 (1:37 to 1:46) - Increase volume of first voice
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT2_END -to $SEGMENT3_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment3.mp3"

# Skip from 1:46 to 1:49 (segment will be cut)

# Extract segment 4 (1:49 to 2:11) - Fix slower/lower voice and increase Richard's volume
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT4_START -to $SEGMENT5_END -filter:a "atempo=1.1,volume=2.0" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment4.mp3"

# Extract segment 5 (2:11 to 2:50) - Increase volume of first voice
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT5_END -to $SEGMENT6_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment5.mp3"

# Extract segment 6 (2:50 to 3:20) - Fix tempo issue and increase volume
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT6_END -to $SEGMENT7_END -filter:a "atempo=1.1,volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment6.mp3"

# Extract segment 7 (3:20 to end) - Increase volume of first voice
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT7_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment7.mp3"

echo "All segments extracted and processed."

# Create a file list for concatenation
echo "file '$TEMP_DIR/segment1.mp3'" > "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment2.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment3.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment4.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment5.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment6.mp3'" >> "$TEMP_DIR/filelist.txt"
echo "file '$TEMP_DIR/segment7.mp3'" >> "$TEMP_DIR/filelist.txt"

# Concatenate the segments
echo "Concatenating segments..."
ffmpeg -y -f concat -safe 0 -i "$TEMP_DIR/filelist.txt" -c:a libmp3lame -q:a 2 "$FIXED_AUDIO"

echo "Audio final correction complete. Fixed file saved to $FIXED_AUDIO"

# Clean up temporary files
rm -rf "$TEMP_DIR"

echo "Temporary files cleaned up"
echo "Audio final fixing process complete!"
