#!/bin/bash

# Richard Behavior Assessment Project - Installation and Upload Script
# This script installs dependencies and uploads the project to Supabase storage

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js before running this script."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install npm before running this script."
  exit 1
fi

# Print welcome message
print_message "==================================================="
print_message "Richard Behavior Assessment - Installation and Upload"
print_message "==================================================="
print_message "This script will install dependencies and upload the project to Supabase storage."
print_message ""

# Install dependencies
print_message "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  print_error "Failed to install dependencies. Please check the error messages above."
  exit 1
fi

print_success "Dependencies installed successfully!"
print_message ""

# Check if .env file exists
if [ ! -f .env ]; then
  print_error ".env file not found. Creating a template .env file..."
  
  cat > .env << EOL
SUPABASE_URL=https://tvecnfdqakrevzaeifpk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM4MjA2NCwiZXhwIjoyMDYzOTU4MDY0fQ.KqzZr0iiPNYHFzEzT8utRAu3EorO3LFDbh3dd-U_42c
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y
SUPABASE_STORAGE_BUCKET=richard-assessment
SUPABASE_REGION=eu-west-2
SUPABASE_PROJECT_ID=tvecnfdqakrevzaeifpk
AUDIO_FILE_PATH=/Volumes/EXCELLENCE/PubLove_White_Ferry_House_Victoria_combined e1ea6908-2426-4630-a31b-f2d1bd292459.pdf
EOL

  print_success ".env file created successfully!"
  print_message ""
fi

# Set up the database
print_message "Setting up the database..."
npm run setup-db

if [ $? -ne 0 ]; then
  print_error "Failed to set up the database. Please check the error messages above."
  exit 1
fi

print_success "Database set up successfully!"
print_message ""

# Upload the project to Supabase storage
print_message "Uploading the project to Supabase storage..."
npm run upload

if [ $? -ne 0 ]; then
  print_error "Failed to upload the project. Please check the error messages above."
  exit 1
fi

print_success "Project uploaded successfully!"
print_message ""

print_message "==================================================="
print_message "Installation and upload completed successfully!"
print_message "==================================================="
print_message ""
print_message "You can now access the assessment using the URLs displayed above."
print_message ""
print_message "To run the project locally, use the following command:"
print_message "npm start"
print_message ""
