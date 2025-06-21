# Richard Behavior Assessment Project

This project provides a complete solution for analyzing and displaying Richard's behavior assessment data using Supabase as the backend database.

## Project Structure

- `.env` - Environment variables for Supabase credentials (not included in version control)
- `setup_supabase_behavior_assessment.js` - Script to set up the Supabase database schema
- `richard_assessment_supabase.html` - Main HTML file for displaying the assessment
- `richard_assessment_supabase_client.js` - Client-side JavaScript for interacting with Supabase
- `upload_to_supabase.js` - Script to upload the project to Supabase storage
- `package.json` - Project dependencies and scripts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up the Database

```bash
npm run setup-db
```

This will create all the necessary tables in your Supabase database and set up the initial data for Richard's case.

### 3. Upload the Project to Supabase Storage

```bash
npm run upload
```

This will upload all project files to the Supabase storage bucket, including the audio file if available.

### 4. Access the Assessment

After uploading, the script will display the public URLs for accessing the assessment:

- Main HTML file: `https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/richard-assessment/project/richard_assessment_supabase.html`
- Audio file: `https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/richard-assessment/audio/richard-assessment.mp3`

## Local Development

To run the project locally:

```bash
npm start
```

This will start a local server and open the assessment in your default browser.

## Environment Variables

The project uses the following environment variables:

- `SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - The service role key for your Supabase project
- `SUPABASE_ANON_KEY` - The anonymous key for your Supabase project
- `SUPABASE_STORAGE_BUCKET` - The name of the storage bucket (default: 'richard-assessment')
- `AUDIO_FILE_PATH` - The path to the audio file to upload

## Security Considerations

- The `.env` file contains sensitive credentials and should not be committed to version control
- The service role key has full access to your Supabase project, so keep it secure
- The anonymous key is used for client-side access and has limited permissions

## Troubleshooting

If you encounter issues:

1. Check that your Supabase credentials are correct in the `.env` file
2. Ensure that the Supabase project has the necessary permissions
3. Check the browser console for error messages
4. Verify that the audio file path is correct

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
