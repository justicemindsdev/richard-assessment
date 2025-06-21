// Script to upload the Richard Behavior Assessment project to Supabase storage
// This script will upload all project files to the Supabase storage bucket

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase credentials from .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'richard-assessment';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to create the storage bucket if it doesn't exist
async function createBucketIfNotExists() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${STORAGE_BUCKET}`);
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
      
      console.log('Bucket created successfully:', data);
    } else {
      console.log(`Bucket ${STORAGE_BUCKET} already exists.`);
    }
    
    return true;
  } catch (err) {
    console.error('Exception creating bucket:', err);
    return false;
  }
}

// Function to upload a file to Supabase storage
async function uploadFile(filePath, storagePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileExt = path.extname(filePath).substring(1);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    switch (fileExt.toLowerCase()) {
      case 'html':
        contentType = 'text/html';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      case 'json':
        contentType = 'application/json';
        break;
      case 'md':
        contentType = 'text/markdown';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'mp3':
        contentType = 'audio/mpeg';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    console.log(`Uploading ${filePath} to ${storagePath} (${contentType})...`);
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileContent, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading ${filePath}:`, error);
      return false;
    }
    
    console.log(`Successfully uploaded ${filePath} to ${storagePath}`);
    return true;
  } catch (err) {
    console.error(`Exception uploading ${filePath}:`, err);
    return false;
  }
}

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

// Function to upload the audio file
async function uploadAudioFile(audioFilePath) {
  try {
    if (!fs.existsSync(audioFilePath)) {
      console.error(`Audio file not found: ${audioFilePath}`);
      return false;
    }
    
    // Always use richard-assessment.mp3 as the target filename regardless of source file extension
    const storagePath = `audio/richard-assessment.mp3`;
    
    console.log(`Uploading audio file from ${audioFilePath} to ${storagePath}...`);
    
    // Read the file content
    const fileContent = fs.readFileSync(audioFilePath);
    
    // Upload with audio/mpeg content type regardless of source file extension
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileContent, {
        contentType: 'audio/mpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading audio file:`, error);
      return false;
    }
    
    console.log(`Successfully uploaded audio file to ${storagePath}`);
    return true;
  } catch (err) {
    console.error('Exception uploading audio file:', err);
    return false;
  }
}

// Main function to upload the project
async function uploadProject() {
  try {
    console.log('Starting project upload to Supabase storage...');
    
    // Create the bucket if it doesn't exist
    const bucketCreated = await createBucketIfNotExists();
    if (!bucketCreated) {
      console.error('Failed to create or verify bucket. Aborting upload.');
      return;
    }
    
    // Get all project files
    const projectDir = path.resolve(__dirname);
    const allFiles = getAllFiles(projectDir);
    
    // Filter out .env file and node_modules
    const filesToUpload = allFiles.filter(file => {
      const relativePath = path.relative(projectDir, file);
      return !relativePath.includes('node_modules') && 
             !relativePath.endsWith('.env') &&
             !relativePath.endsWith('upload_to_supabase.js');
    });
    
    console.log(`Found ${filesToUpload.length} files to upload.`);
    
    // Upload each file
    for (const file of filesToUpload) {
      const relativePath = path.relative(projectDir, file);
      const storagePath = `project/${relativePath}`;
      
      await uploadFile(file, storagePath);
    }
    
    // Upload the audio file if specified
    const audioFilePath = process.env.AUDIO_FILE_PATH || '/Volumes/EXCELLENCE/PubLove_White_Ferry_House_Victoria_combined e1ea6908-2426-4630-a31b-f2d1bd292459.pdf';
    if (fs.existsSync(audioFilePath)) {
      await uploadAudioFile(audioFilePath);
    } else {
      console.warn(`Audio file not found: ${audioFilePath}`);
    }
    
    console.log('Project upload completed successfully!');
    
    // Generate and display the public URLs
    const { data: publicUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl('project/richard_assessment_supabase.html');
    console.log('\nPublic URLs:');
    console.log(`Main HTML file: ${publicUrl.publicUrl}`);
    
    const { data: audioUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl('audio/richard-assessment.mp3');
    console.log(`Audio file: ${audioUrl.publicUrl}`);
    
  } catch (err) {
    console.error('Error uploading project:', err);
  }
}

// Run the upload
uploadProject()
  .then(() => {
    console.log('Upload script completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error in upload script:', err);
    process.exit(1);
  });
