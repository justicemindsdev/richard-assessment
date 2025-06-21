#!/bin/bash

# Richard Behavior Assessment Project - Copy Audio Script
# This script copies the audio file to the project directory

# Print colored messages
print_message() {
  echo -e "\033[1;34m$1\033[0m"
}

print_success() {
  echo -e "\033[1;32m$1\033[0m"
}

print_error() {
  echo -e "\033[1;31m$1\033[0m"
}

# Check if .env file exists
if [ ! -f .env ]; then
  print_error ".env file not found. Please run install_and_upload.sh first."
  exit 1
fi

# Get the audio file path from .env
AUDIO_FILE_PATH=$(grep AUDIO_FILE_PATH .env | cut -d '=' -f2)

# Check if the audio file exists
if [ ! -f "$AUDIO_FILE_PATH" ]; then
  print_error "Audio file not found at $AUDIO_FILE_PATH"
  print_message "Please update the AUDIO_FILE_PATH in .env to point to the correct location."
  exit 1
fi

# Create audio directory if it doesn't exist
mkdir -p audio

# Copy the audio file to the audio directory
print_message "Copying audio file to project directory..."
cp "$AUDIO_FILE_PATH" audio/richard-assessment.mp3

if [ $? -ne 0 ]; then
  print_error "Failed to copy audio file. Please check the error messages above."
  exit 1
fi

print_success "Audio file copied successfully to audio/richard-assessment.mp3"
print_message ""

# Update the audio source in the HTML file
print_message "Updating audio source in HTML file..."
sed -i '' 's|src=""|src="audio/richard-assessment.mp3"|g' richard_assessment_supabase.html

if [ $? -ne 0 ]; then
  print_error "Failed to update audio source in HTML file. Please check the error messages above."
  exit 1
fi

print_success "Audio source updated successfully in HTML file!"
print_message ""

print_message "You can now run the project locally with:"
print_message "npm start"
print_message ""
