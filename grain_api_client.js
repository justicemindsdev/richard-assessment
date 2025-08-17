const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class GrainAPIClient {
    constructor() {
        this.personalToken = process.env.GRAIN_PERSONAL_TOKEN || 'grain_pat_cXNKHgNo_1LXH3wzmg1pAtHmIl6BBzh5oF3j0eN7LhajWGmc1';
        this.workspaceToken = process.env.GRAIN_WORKSPACE_TOKEN || 'grain_wat_GDTI1y87_2sVXSyYWxqaIgMMueXezv2muoztmssA8GaqPdxMM';
        this.baseURL = 'https://api.grain.com/_/public-api';
    }

    /**
     * Extract recording ID from Grain.com share URL
     * @param {string} shareUrl - The Grain.com share URL
     * @returns {string} - The recording ID
     */
    extractRecordingId(shareUrl) {
        const match = shareUrl.match(/recording\/([a-f0-9-]+)\//);
        return match ? match[1] : null;
    }

    /**
     * Get recording details from Grain API
     * @param {string} recordingId - The recording ID
     * @param {string} token - API token to use
     * @returns {Object} - Recording details
     */
    async getRecording(recordingId, token = this.personalToken) {
        try {
            const response = await axios.get(`${this.baseURL}/recordings/${recordingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching recording ${recordingId}:`, error.response?.data || error.message);
            
            // Try with workspace token if personal token fails
            if (token === this.personalToken) {
                console.log('Retrying with workspace token...');
                return this.getRecording(recordingId, this.workspaceToken);
            }
            
            throw error;
        }
    }

    /**
     * Get recording transcript
     * @param {string} recordingId - The recording ID
     * @param {string} token - API token to use
     * @returns {Object} - Transcript data
     */
    async getTranscript(recordingId, token = this.personalToken) {
        try {
            const response = await axios.get(`${this.baseURL}/recordings/${recordingId}/transcript`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching transcript ${recordingId}:`, error.response?.data || error.message);
            
            // Try with workspace token if personal token fails
            if (token === this.personalToken) {
                console.log('Retrying transcript with workspace token...');
                return this.getTranscript(recordingId, this.workspaceToken);
            }
            
            return null; // Return null if transcript isn't available
        }
    }

    /**
     * Download audio file from recording
     * @param {string} recordingId - The recording ID
     * @param {string} outputPath - Path to save the audio file
     * @param {string} token - API token to use
     * @returns {string} - Path to downloaded file
     */
    async downloadAudio(recordingId, outputPath, token = this.personalToken) {
        try {
            // First get recording details to find audio URL
            const recording = await this.getRecording(recordingId, token);
            
            if (!recording.audioUrl && !recording.audio_url) {
                throw new Error('No audio URL found in recording data');
            }
            
            const audioUrl = recording.audioUrl || recording.audio_url;
            
            const response = await axios.get(audioUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'stream'
            });

            // Ensure directory exists
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            
            // Write the stream to file
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            
            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(outputPath));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error(`Error downloading audio ${recordingId}:`, error.response?.data || error.message);
            
            // Try with workspace token if personal token fails
            if (token === this.personalToken) {
                console.log('Retrying download with workspace token...');
                return this.downloadAudio(recordingId, outputPath, this.workspaceToken);
            }
            
            throw error;
        }
    }

    /**
     * Process multiple Grain recordings for the Richard assessment
     * @param {Array} recordingUrls - Array of Grain share URLs
     * @returns {Object} - Processed assessment data
     */
    async processRecordingsForAssessment(recordingUrls) {
        const assessmentData = {
            recordings: [],
            transcripts: [],
            audioFiles: [],
            errors: []
        };

        const recordingTitles = [
            "Zac and Ben Interaction - Staff Discussion"
        ];

        for (let i = 0; i < recordingUrls.length; i++) {
            const url = recordingUrls[i];
            const title = recordingTitles[i] || `Recording ${i + 1}`;
            
            try {
                const recordingId = this.extractRecordingId(url);
                if (!recordingId) {
                    assessmentData.errors.push(`Invalid URL format: ${url}`);
                    continue;
                }

                console.log(`Processing ${title} (ID: ${recordingId})...`);

                // Get recording details
                const recording = await this.getRecording(recordingId);
                recording.customTitle = title;
                recording.shareUrl = url;
                assessmentData.recordings.push(recording);

                // Get transcript
                const transcript = await this.getTranscript(recordingId);
                if (transcript) {
                    transcript.recordingId = recordingId;
                    transcript.customTitle = title;
                    assessmentData.transcripts.push(transcript);
                }

                // Download audio file
                const audioFileName = `recording_${i + 1}_${recordingId}.mp3`;
                const audioPath = path.join(__dirname, 'audio', audioFileName);
                
                try {
                    await this.downloadAudio(recordingId, audioPath);
                    assessmentData.audioFiles.push({
                        recordingId,
                        title,
                        path: audioPath,
                        filename: audioFileName
                    });
                    console.log(`✓ Downloaded audio: ${audioFileName}`);
                } catch (audioError) {
                    console.warn(`Failed to download audio for ${title}:`, audioError.message);
                }

                console.log(`✓ Processed ${title}`);
            } catch (error) {
                assessmentData.errors.push(`Error processing ${title}: ${error.message}`);
                console.error(`Error processing ${title}:`, error.message);
            }
        }

        return assessmentData;
    }

    /**
     * Save assessment data to JSON file
     * @param {Object} assessmentData - Processed assessment data
     * @param {string} outputPath - Path to save the JSON file
     */
    async saveAssessmentData(assessmentData, outputPath = path.join(__dirname, 'grain_assessment_data.json')) {
        try {
            await fs.writeFile(outputPath, JSON.stringify(assessmentData, null, 2));
            console.log(`✓ Assessment data saved to: ${outputPath}`);
            return outputPath;
        } catch (error) {
            console.error('Error saving assessment data:', error.message);
            throw error;
        }
    }
}

module.exports = GrainAPIClient;

// CLI usage
if (require.main === module) {
    async function main() {
        const client = new GrainAPIClient();
        
        const recordingUrls = [
            'https://grain.com/share/recording/a6da2b5b-4a85-46f2-9e74-d5f9b0741504/LAzbC75GWT8AAYmUUl35s3dyYRv7wm9yJRpq4TA8'
        ];

        console.log('🎯 Processing Grain recordings for Richard assessment...');
        
        try {
            const assessmentData = await client.processRecordingsForAssessment(recordingUrls);
            await client.saveAssessmentData(assessmentData);
            
            console.log('\n📊 Processing Summary:');
            console.log(`✓ Recordings processed: ${assessmentData.recordings.length}`);
            console.log(`✓ Transcripts obtained: ${assessmentData.transcripts.length}`);
            console.log(`✓ Audio files downloaded: ${assessmentData.audioFiles.length}`);
            
            if (assessmentData.errors.length > 0) {
                console.log(`⚠️  Errors encountered: ${assessmentData.errors.length}`);
                assessmentData.errors.forEach(error => console.log(`   - ${error}`));
            }
            
        } catch (error) {
            console.error('❌ Failed to process recordings:', error.message);
            process.exit(1);
        }
    }

    main();
}
