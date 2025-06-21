#!/bin/bash

# Richard Behavior Assessment Project - Create Zip Script
# This script creates a zip file of the project for easy distribution

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

# Check if zip command is available
if ! command -v zip &> /dev/null; then
  print_error "zip command not found. Please install zip before running this script."
  exit 1
fi

# Print welcome message
print_message "==================================================="
print_message "Richard Behavior Assessment - Create Zip"
print_message "==================================================="
print_message "This script will create a zip file of the project for easy distribution."
print_message ""

# Create a timestamp for the zip file name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_FILE="../richard_assessment_${TIMESTAMP}.zip"

# Create the zip file
print_message "Creating zip file..."
zip -r "$ZIP_FILE" . -x "node_modules/*" "*.git*" "*.zip" "audio/*"

if [ $? -ne 0 ]; then
  print_error "Failed to create zip file. Please check the error messages above."
  exit 1
fi

print_success "Zip file created successfully at $ZIP_FILE"
print_message ""

# Check if the audio file exists
AUDIO_FILE_PATH=$(grep AUDIO_FILE_PATH .env | cut -d '=' -f2)
if [ -f "$AUDIO_FILE_PATH" ]; then
  print_message "Would you like to include the audio file in the zip? (y/n)"
  read -r include_audio
  
  if [[ "$include_audio" =~ ^[Yy]$ ]]; then
    print_message "Adding audio file to zip..."
    zip -j "$ZIP_FILE" "$AUDIO_FILE_PATH"
    
    if [ $? -ne 0 ]; then
      print_error "Failed to add audio file to zip. Please check the error messages above."
    else
      print_success "Audio file added to zip successfully!"
    fi
  fi
fi

print_message ""
print_message "==================================================="
print_message "Zip file creation completed successfully!"
print_message "==================================================="
print_message ""
print_message "You can now distribute the zip file at:"
print_message "$ZIP_FILE"
print_message ""
print_message "To extract the zip file, use the following command:"
print_message "unzip $ZIP_FILE -d richard_assessment"
print_message ""
