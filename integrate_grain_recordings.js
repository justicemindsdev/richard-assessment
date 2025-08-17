const GrainAPIClient = require('./grain_api_client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

/**
 * Script to integrate Grain recordings into the Richard Assessment system
 */
class GrainIntegrationService {
    constructor() {
        this.grainClient = new GrainAPIClient();
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );
    }

    /**
     * Convert Grain transcript to assessment format
     * @param {Object} transcript - Grain transcript data
     * @param {Object} recording - Recording metadata
     * @returns {Array} - Assessment segments
     */
    convertTranscriptToAssessmentSegments(transcript, recording) {
        if (!transcript || !transcript.segments) {
            return [];
        }

        const segments = [];
        let segmentIndex = 1;

        // Group related segments and identify concerning behavior patterns
        for (const segment of transcript.segments) {
            if (!segment.text || segment.text.trim().length === 0) continue;

            // Analyze the text for concerning patterns
            const text = segment.text.toLowerCase();
            const concerningPhrases = [
                'not my problem', 'not my responsibility', 'figure it out yourself',
                'you\'re overreacting', 'that\'s not how we do things', 'calm down',
                'you\'re being dramatic', 'this is ridiculous', 'waste of time',
                'completely wrong', 'you don\'t understand', 'inappropriate'
            ];

            const gaslightingIndicators = [
                'you\'re imagining things', 'that never happened', 'you\'re confused',
                'you\'re being too sensitive', 'you misunderstood', 'that\'s not what I said'
            ];

            const dismissiveLanguage = [
                'whatever', 'fine', 'if you say so', 'I don\'t care',
                'not interested', 'move on', 'drop it'
            ];

            let behaviorCategory = 'Standard Communication';
            let concernLevel = 'Low';
            
            const hasConcerningPhrase = concerningPhrases.some(phrase => text.includes(phrase));
            const hasGaslighting = gaslightingIndicators.some(phrase => text.includes(phrase));
            const isDismissive = dismissiveLanguage.some(phrase => text.includes(phrase));

            if (hasGaslighting) {
                behaviorCategory = 'Gaslighting';
                concernLevel = 'Critical';
            } else if (hasConcerningPhrase) {
                behaviorCategory = 'Inappropriate Professional Conduct';
                concernLevel = 'High';
            } else if (isDismissive) {
                behaviorCategory = 'Dismissive Behavior';
                concernLevel = 'Medium';
            }

            // Only include segments with concerning behavior
            if (concernLevel !== 'Low') {
                segments.push({
                    segment_number: segmentIndex++,
                    start_time: Math.floor(segment.start || 0),
                    end_time: Math.ceil(segment.end || segment.start + 10),
                    transcript_text: segment.text,
                    behavior_category: behaviorCategory,
                    concern_level: concernLevel,
                    analysis: this.generateAnalysis(segment.text, behaviorCategory),
                    speaker: segment.speaker || recording.participants?.[0]?.name || 'Unknown Speaker',
                    recording_title: recording.customTitle,
                    recording_id: recording.id
                });
            }
        }

        return segments;
    }

    /**
     * Generate behavior analysis for a segment
     * @param {string} text - Transcript text
     * @param {string} category - Behavior category
     * @returns {string} - Analysis text
     */
    generateAnalysis(text, category) {
        const analyses = {
            'Gaslighting': [
                'This segment demonstrates classic gaslighting behavior where the speaker attempts to make the listener question their own perception of reality.',
                'The language used here is designed to undermine the listener\'s confidence in their own experience and memory.',
                'This represents a serious form of psychological manipulation that constitutes workplace misconduct.'
            ],
            'Inappropriate Professional Conduct': [
                'This segment shows unprofessional conduct that fails to meet basic workplace standards.',
                'The language demonstrates a clear dismissal of legitimate concerns and responsibilities.',
                'This behavior violates professional duties of care and appropriate workplace interaction.'
            ],
            'Dismissive Behavior': [
                'This segment shows dismissive language that minimizes legitimate concerns.',
                'The tone and content demonstrate a lack of professional engagement with important matters.',
                'This behavior pattern suggests an inability to handle workplace responsibilities appropriately.'
            ]
        };

        const categoryAnalyses = analyses[category] || ['Standard communication without specific concerns noted.'];
        return categoryAnalyses[Math.floor(Math.random() * categoryAnalyses.length)];
    }

    /**
     * Update assessment database with Grain recordings
     * @param {Object} assessmentData - Processed Grain data
     */
    async updateAssessmentDatabase(assessmentData) {
        try {
            console.log('🔄 Updating assessment database with Grain recordings...');

            // Process each recording and transcript
            for (let i = 0; i < assessmentData.recordings.length; i++) {
                const recording = assessmentData.recordings[i];
                const transcript = assessmentData.transcripts.find(t => t.recordingId === recording.id);
                
                if (!transcript) {
                    console.warn(`⚠️  No transcript found for ${recording.customTitle}`);
                    continue;
                }

                console.log(`Processing ${recording.customTitle}...`);
                
                // Convert transcript to assessment segments
                const segments = this.convertTranscriptToAssessmentSegments(transcript, recording);
                
                if (segments.length === 0) {
                    console.warn(`⚠️  No concerning behavior found in ${recording.customTitle}`);
                    continue;
                }

                // Insert segments into database
                for (const segment of segments) {
                    const { error } = await this.supabase
                        .from('audio_segments')
                        .upsert({
                            case_number: 'PL-WFH-062025', // Richard's case
                            segment_number: segment.segment_number,
                            start_time: segment.start_time,
                            end_time: segment.end_time,
                            transcript_text: segment.transcript_text,
                            behavior_category: segment.behavior_category,
                            concern_level: segment.concern_level,
                            analysis: segment.analysis,
                            speaker: segment.speaker,
                            recording_source: 'Grain',
                            recording_title: segment.recording_title,
                            grain_recording_id: segment.recording_id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'case_number,segment_number'
                        });

                    if (error) {
                        console.error('Error inserting segment:', error);
                    }
                }

                console.log(`✓ Processed ${segments.length} segments from ${recording.customTitle}`);
            }

            // Update case metadata
            const { error: caseError } = await this.supabase
                .from('case_info')
                .upsert({
                    case_number: 'PL-WFH-062025',
                    recording_date: '2025-06-20',
                    location: 'PubLove White Ferry House Victoria',
                    subject_name: 'Richard',
                    subject_role: 'Senior Staff Member',
                    complainant_name: 'Staff Member',
                    complainant_role: 'Junior Staff Member',
                    concerning: 'Inappropriate workplace behavior, gaslighting, dismissal of safeguarding concerns',
                    grain_recordings_processed: assessmentData.recordings.length,
                    last_updated: new Date().toISOString()
                }, {
                    onConflict: 'case_number'
                });

            if (caseError) {
                console.error('Error updating case info:', caseError);
            }

            console.log('✅ Successfully updated assessment database with Grain recordings');

        } catch (error) {
            console.error('❌ Error updating database:', error);
            throw error;
        }
    }

    /**
     * Generate updated HTML with real recording data
     * @param {Object} assessmentData - Processed Grain data
     */
    async generateUpdatedHTML(assessmentData) {
        try {
            console.log('🔄 Generating updated HTML with real recording data...');

            // Read the current HTML file
            const htmlPath = path.join(__dirname, 'richard_assessment_supabase.html');
            let htmlContent = await fs.readFile(htmlPath, 'utf8');

            // Update audio source to use the first available recording
            if (assessmentData.audioFiles.length > 0) {
                const primaryAudio = assessmentData.audioFiles[0];
                const audioUrl = `https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/object/public/richard-assessment/audio/${primaryAudio.filename}`;
                
                htmlContent = htmlContent.replace(
                    /audioElement\.src = '[^']+'/,
                    `audioElement.src = '${audioUrl}'`
                );
                
                htmlContent = htmlContent.replace(
                    /src="[^"]+richard-assessment\.mp3"/,
                    `src="${audioUrl}"`
                );
            }

            // Add metadata about the Grain recordings
            const metadataComment = `
            <!--
            GRAIN RECORDINGS INTEGRATED:
            ${assessmentData.recordings.map((r, i) => `${i + 1}. ${r.customTitle} (ID: ${r.id})`).join('\n            ')}
            
            Processing completed: ${new Date().toISOString()}
            Total segments processed: ${assessmentData.transcripts.reduce((sum, t) => sum + (t.segments?.length || 0), 0)}
            -->
            `;

            htmlContent = htmlContent.replace('</head>', `${metadataComment}\n</head>`);

            // Save the updated HTML
            const updatedHtmlPath = path.join(__dirname, 'richard_assessment_grain_integrated.html');
            await fs.writeFile(updatedHtmlPath, htmlContent);

            console.log(`✅ Updated HTML saved to: ${updatedHtmlPath}`);
            return updatedHtmlPath;

        } catch (error) {
            console.error('❌ Error generating updated HTML:', error);
            throw error;
        }
    }

    /**
     * Full integration process
     */
    async integrate() {
        try {
            console.log('🚀 Starting Grain recordings integration...');

            // Step 1: Process Grain recordings
            const recordingUrls = [
                'https://grain.com/share/recording/5517a890-fc78-42f9-a931-4cc21c3d4923/vuSOtGm3sCczXM26G6BfKO4GSVFS0bJIZUrPGKID',
                'https://grain.com/share/recording/51cca7a8-7870-4757-850f-93a3801d9b7e/XQsuloOURwhgtOaDExfrQW2OhJq3UfagCl2JbpYn',
                'https://grain.com/share/recording/92d5e287-119d-4339-9a2f-c9099b6f67d3/9DozHVq0yccUt6sWYQhGoWZTJsgxvAEVG50RwWxC'
            ];

            const assessmentData = await this.grainClient.processRecordingsForAssessment(recordingUrls);

            // Step 2: Update database
            await this.updateAssessmentDatabase(assessmentData);

            // Step 3: Generate updated HTML
            await this.generateUpdatedHTML(assessmentData);

            // Step 4: Save comprehensive assessment data
            await this.grainClient.saveAssessmentData(assessmentData, 'grain_assessment_integrated.json');

            console.log('\n🎉 Integration completed successfully!');
            console.log('\n📊 Final Summary:');
            console.log(`✓ Recordings processed: ${assessmentData.recordings.length}`);
            console.log(`✓ Transcripts obtained: ${assessmentData.transcripts.length}`);
            console.log(`✓ Audio files downloaded: ${assessmentData.audioFiles.length}`);
            
            if (assessmentData.errors.length > 0) {
                console.log(`⚠️  Errors encountered: ${assessmentData.errors.length}`);
                assessmentData.errors.forEach(error => console.log(`   - ${error}`));
            }

            return assessmentData;

        } catch (error) {
            console.error('❌ Integration failed:', error);
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    async function main() {
        const integrationService = new GrainIntegrationService();
        
        try {
            await integrationService.integrate();
        } catch (error) {
            console.error('❌ Integration process failed:', error.message);
            process.exit(1);
        }
    }

    main();
}

module.exports = GrainIntegrationService;
