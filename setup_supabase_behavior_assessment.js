// Setup script for Richard Behavior Assessment Supabase Database
// This script will create the necessary tables and set up the database schema
// using the provided Supabase credentials from .env file

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase credentials from .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Function to execute SQL queries
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    
    console.log('SQL executed successfully:', data);
    return true;
  } catch (err) {
    console.error('Exception executing SQL:', err);
    return false;
  }
}

// Main function to set up the database schema
async function setupDatabase() {
  console.log('Starting database setup...');
  
  // SQL schema from the supabase_behavior_assessment_schema.sql file
  const schema = `
  -- Enable necessary extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Cases table - stores basic case information
  CREATE TABLE IF NOT EXISTS cases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_number VARCHAR(50) NOT NULL,
      recording_date DATE NOT NULL,
      location VARCHAR(255) NOT NULL,
      subject_name VARCHAR(255) NOT NULL,
      subject_role VARCHAR(255),
      complainant_name VARCHAR(255) NOT NULL,
      complainant_role VARCHAR(255),
      concerning TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Audio segments table - stores individual audio evidence segments
  CREATE TABLE IF NOT EXISTS audio_segments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      segment_type VARCHAR(50) NOT NULL, -- e.g., 'pivotal_moment', 'additional_evidence'
      title VARCHAR(255) NOT NULL,
      start_time DECIMAL(10, 2) NOT NULL, -- in seconds
      end_time DECIMAL(10, 2) NOT NULL, -- in seconds
      display_timestamp VARCHAR(50), -- formatted timestamp for display (e.g., "02:25")
      waveform_data JSONB, -- store SVG path data or waveform visualization data
      click_to_hear BOOLEAN DEFAULT FALSE,
      sequence_order INTEGER NOT NULL, -- for ordering segments in the document
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Transcript entries - stores transcript text for each audio segment
  CREATE TABLE IF NOT EXISTS transcript_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      audio_segment_id UUID REFERENCES audio_segments(id) ON DELETE CASCADE,
      speaker VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering transcript lines
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Clinical analysis - stores clinical analysis data for audio segments
  CREATE TABLE IF NOT EXISTS clinical_analyses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      audio_segment_id UUID REFERENCES audio_segments(id) ON DELETE CASCADE,
      analysis_type VARCHAR(50) NOT NULL, -- e.g., 'laughter', 'clicking', 'speech_pattern'
      metric_name VARCHAR(255) NOT NULL, -- e.g., 'Frequency Range', 'Click Frequency'
      metric_value TEXT NOT NULL, -- e.g., '387-412 Hz', '5 distinct clicks in 3.2 seconds'
      clinical_significance TEXT, -- explanation of the significance
      sequence_order INTEGER NOT NULL, -- for ordering analysis points
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Significance explanations - stores significance explanations for audio segments
  CREATE TABLE IF NOT EXISTS significance_explanations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      audio_segment_id UUID REFERENCES audio_segments(id) ON DELETE CASCADE,
      explanation TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Gaslighting tactics - stores identified gaslighting tactics
  CREATE TABLE IF NOT EXISTS gaslighting_tactics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      tactic_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering tactics
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Legal implications - stores legal implications of the behavior
  CREATE TABLE IF NOT EXISTS legal_implications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      implication_type VARCHAR(255) NOT NULL, -- e.g., 'breach_of_duty', 'violation_of_protocols'
      description TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering implications
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Reporting obligations - stores mandatory reporting obligations
  CREATE TABLE IF NOT EXISTS reporting_obligations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      entity_name VARCHAR(255) NOT NULL, -- e.g., 'UNIVERSITY', 'IMMIGRATION AUTHORITIES'
      applicable_condition VARCHAR(255), -- e.g., 'if applicable'
      legal_basis TEXT,
      sequence_order INTEGER NOT NULL, -- for ordering obligations
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Regulatory frameworks - stores relevant regulatory frameworks
  CREATE TABLE IF NOT EXISTS regulatory_frameworks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      reporting_obligation_id UUID REFERENCES reporting_obligations(id) ON DELETE CASCADE,
      framework_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering frameworks
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Clinical trials - stores clinical trial references
  CREATE TABLE IF NOT EXISTS clinical_trials (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      trial_name VARCHAR(255) NOT NULL,
      researchers VARCHAR(255),
      year INTEGER,
      sample_size VARCHAR(50),
      relevant_findings TEXT NOT NULL,
      application_to_case TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering trials
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Summary points - stores summary points for the assessment
  CREATE TABLE IF NOT EXISTS summary_points (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      timestamp_reference VARCHAR(50), -- e.g., "00:18", "02:25 & 02:29"
      title VARCHAR(255) NOT NULL, -- e.g., "Inappropriate Laughter", "Derogatory Clicking Noises"
      description TEXT NOT NULL,
      sequence_order INTEGER NOT NULL, -- for ordering summary points
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- User access - stores user access permissions for cases
  CREATE TABLE IF NOT EXISTS user_access (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL, -- references auth.users in Supabase
      case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
      access_level VARCHAR(50) NOT NULL, -- e.g., 'viewer', 'editor', 'admin'
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, case_id)
  );

  -- Create RLS policies for security
  -- Enable Row Level Security
  ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audio_segments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transcript_entries ENABLE ROW LEVEL SECURITY;
  ALTER TABLE clinical_analyses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE significance_explanations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE gaslighting_tactics ENABLE ROW LEVEL SECURITY;
  ALTER TABLE legal_implications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reporting_obligations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE regulatory_frameworks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
  ALTER TABLE summary_points ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

  -- Create policies for cases table
  CREATE POLICY IF NOT EXISTS "Users can view cases they have access to" ON cases
      FOR SELECT
      USING (
          EXISTS (
              SELECT 1 FROM user_access
              WHERE user_access.case_id = cases.id
              AND user_access.user_id = auth.uid()
          )
      );

  CREATE POLICY IF NOT EXISTS "Users with editor or admin access can update cases" ON cases
      FOR UPDATE
      USING (
          EXISTS (
              SELECT 1 FROM user_access
              WHERE user_access.case_id = cases.id
              AND user_access.user_id = auth.uid()
              AND user_access.access_level IN ('editor', 'admin')
          )
      );

  -- Create function to update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create triggers to automatically update updated_at
  DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
  CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  `;
  
  // Execute the schema SQL
  const success = await executeSQL(schema);
  
  if (success) {
    console.log('Database schema created successfully!');
    
    // Insert Richard's case data
    const richardCaseData = `
    -- Insert case information for Richard's behavior assessment
    INSERT INTO cases (
        case_number, 
        recording_date, 
        location, 
        subject_name, 
        subject_role, 
        complainant_name, 
        complainant_role, 
        concerning
    ) VALUES (
        'PL-WFH-062025',
        '2025-06-21',
        'PubLove White Ferry House Victoria',
        'Richard',
        'Staff Member',
        'Ben Mak',
        'Safeguarding Officer',
        'Inappropriate laughter, condescending behavior, and gaslighting in relation to a vulnerable 62-year-old guest'
    );
    `;
    
    const dataSuccess = await executeSQL(richardCaseData);
    
    if (dataSuccess) {
      console.log('Richard case data inserted successfully!');
    } else {
      console.error('Failed to insert Richard case data.');
    }
  } else {
    console.error('Failed to create database schema.');
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('Database setup completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error in database setup:', err);
    process.exit(1);
  });
