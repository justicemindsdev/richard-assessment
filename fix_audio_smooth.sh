#!/bin/bash

# Script to fix audio with smooth transitions
# This script will:
# 1. Keep Richard's voice edits (increased volume + fixed tempo)
# 2. Use original unedited audio for the user's voice in specific sections
# 3. Apply crossfades between segments for smooth transitions

# Set up variables
AUDIO_DIR="/workspaces/richard-assessment/audio"
INPUT_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_edited.mp3"
FIXED_AUDIO="$AUDIO_DIR/PubLove_White_Ferry_House_Victoria_smooth.mp3"
TEMP_DIR="/tmp/audio_temp_smooth"

# Create temporary directory
mkdir -p "$TEMP_DIR"

echo "Starting smooth audio correction process..."

# Calculate time positions in seconds with slight overlaps for crossfading
# Overlapping segments for crossfade (0.5s overlap)
SEGMENT1_START=0
SEGMENT1_END=95.5      # 0:00 to 1:35.5 (first part with 0.5s overlap)

SEGMENT2_START=95      # 0.5s overlap with previous segment
SEGMENT2_END=98        # 1:35 to 1:38 (Richard's mouth click with 0.5s overlap)

SEGMENT3_START=97.5    # 0.5s overlap with previous segment  
SEGMENT3_END=118.5     # 1:37.5 to 1:58.5 (user's voice - keep original with 0.5s overlap)

SEGMENT4_START=118     # 0.5s overlap with previous segment
SEGMENT4_END=136.5     # 1:58 to 2:16.5 (user's voice - keep original with 0.5s overlap)

SEGMENT5_START=136     # 0.5s overlap with previous segment
SEGMENT5_END=170.5     # 2:16 to 2:50.5 (increase volume with 0.5s overlap)

SEGMENT6_START=170     # 0.5s overlap with previous segment
SEGMENT6_END=200.5     # 2:50 to 3:20.5 (fix tempo issue + increase volume with 0.5s overlap)

SEGMENT7_START=200     # 0.5s overlap with previous segment
# No end time for last segment - process until end

echo "Extracting segments with overlaps for crossfading..."

# Extract segments with small overlaps for crossfading
# First segment - Increase volume
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT1_START -to $SEGMENT1_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment1.mp3"

# Second segment - Richard's mouth click with increased volume
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT2_START -to $SEGMENT2_END -filter:a "volume=2.5" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment2.mp3"

# Third segment - User's voice - KEEP ORIGINAL (1:37.5 to 1:58)
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT3_START -to $SEGMENT3_END -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment3.mp3"

# Fourth segment - User's voice - KEEP ORIGINAL (1:58 to 2:16)
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT4_START -to $SEGMENT4_END -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment4.mp3"

# Fifth segment - Increase volume (2:16 to 2:50)
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT5_START -to $SEGMENT5_END -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment5.mp3"

# Sixth segment - Fix tempo issue + increase volume (2:50 to 3:20)
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT6_START -to $SEGMENT6_END -filter:a "atempo=1.1,volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment6.mp3"

# Seventh segment - Increase volume (3:20 to end)
ffmpeg -y -i "$INPUT_AUDIO" -ss $SEGMENT7_START -filter:a "volume=1.8" -c:a libmp3lame -q:a 2 "$TEMP_DIR/segment7.mp3"

echo "All segments extracted. Now creating crossfaded transitions..."

# Now create crossfaded versions of adjacent segments
# Crossfade segment 1 and 2
ffmpeg -y -i "$TEMP_DIR/segment1.mp3" -i "$TEMP_DIR/segment2.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$TEMP_DIR/fade1-2.mp3"

# Crossfade segment 2 and 3
ffmpeg -y -i "$TEMP_DIR/fade1-2.mp3" -i "$TEMP_DIR/segment3.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$TEMP_DIR/fade1-2-3.mp3"

# Crossfade segment 3 and 4
ffmpeg -y -i "$TEMP_DIR/fade1-2-3.mp3" -i "$TEMP_DIR/segment4.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$TEMP_DIR/fade1-2-3-4.mp3"

# Crossfade segment 4 and 5
ffmpeg -y -i "$TEMP_DIR/fade1-2-3-4.mp3" -i "$TEMP_DIR/segment5.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$TEMP_DIR/fade1-2-3-4-5.mp3"

# Crossfade segment 5 and 6
ffmpeg -y -i "$TEMP_DIR/fade1-2-3-4-5.mp3" -i "$TEMP_DIR/segment6.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$TEMP_DIR/fade1-2-3-4-5-6.mp3"

# Crossfade segment 6 and 7 (final)
ffmpeg -y -i "$TEMP_DIR/fade1-2-3-4-5-6.mp3" -i "$TEMP_DIR/segment7.mp3" -filter_complex \
  "[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[a]" -map "[a]" -c:a libmp3lame -q:a 2 "$FIXED_AUDIO"

echo "Smooth audio correction complete. Fixed file saved to $FIXED_AUDIO"

# Clean up temporary files
rm -rf "$TEMP_DIR"

echo "Temporary files cleaned up"
echo "Smooth audio fixing process complete!"
