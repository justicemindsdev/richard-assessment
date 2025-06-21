# Richard Behavior Assessment - Quick Start Guide

This guide provides quick instructions for setting up and using the Richard Behavior Assessment project.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Bash shell (for running the scripts)

## Option 1: Quick Setup (Recommended)

Run the installation and upload script:

```bash
./install_and_upload.sh
```

This script will:
1. Install all dependencies
2. Create the .env file if it doesn't exist
3. Set up the Supabase database
4. Upload the project to Supabase storage

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up the Database

```bash
npm run setup-db
```

### 3. Upload to Supabase Storage

```bash
npm run upload
```

## Local Development

### 1. Copy the Audio File

```bash
./copy_audio.sh
```

This script will:
1. Copy the audio file to the project directory
2. Update the HTML file to use the local audio file

### 2. Start the Local Server

```bash
npm start
```

## Accessing the Assessment

After uploading to Supabase, you can access the assessment at:

```
https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/richard-assessment/project/richard_assessment_supabase.html
```

## Project Structure

- `.env` - Environment variables for Supabase credentials
- `setup_supabase_behavior_assessment.js` - Database setup script
- `richard_assessment_supabase.html` - Main HTML file
- `richard_assessment_supabase_client.js` - Client-side JavaScript
- `upload_to_supabase.js` - Upload script
- `install_and_upload.sh` - Installation and upload script
- `copy_audio.sh` - Script to copy the audio file locally
- `package.json` - Project dependencies and scripts
- `README.md` - Detailed project documentation
- `QUICK_START.md` - This quick start guide

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase credentials are correct in the .env file
2. Ensure that the audio file path is correct
3. Check the browser console for error messages
4. Try running the scripts individually to identify the issue

For more detailed information, see the [README.md](./README.md) file.
