// Richard Behavior Assessment - Supabase Client Integration
// This file provides functions to connect to Supabase and interact with the behavior assessment data

// Import the Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Get Supabase credentials from environment variables
// In production, these will be injected by the hosting platform
const SUPABASE_URL = window.SUPABASE_URL || 'https://tvecnfdqakrevzaeifpk.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to fetch case information
async function fetchCaseInfo(caseNumber) {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('case_number', caseNumber)
      .single();
    
    if (error) {
      console.error('Error fetching case info:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching case info:', err);
    return null;
  }
}

// Function to fetch audio segments for a case
async function fetchAudioSegments(caseId) {
  try {
    const { data, error } = await supabase
      .from('audio_segments')
      .select(`
        *,
        transcript_entries(speaker, text, sequence_order),
        clinical_analyses(analysis_type, metric_name, metric_value, clinical_significance, sequence_order),
        significance_explanations(explanation)
      `)
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching audio segments:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching audio segments:', err);
    return [];
  }
}

// Function to fetch gaslighting tactics for a case
async function fetchGaslightingTactics(caseId) {
  try {
    const { data, error } = await supabase
      .from('gaslighting_tactics')
      .select('*')
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching gaslighting tactics:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching gaslighting tactics:', err);
    return [];
  }
}

// Function to fetch legal implications for a case
async function fetchLegalImplications(caseId) {
  try {
    const { data, error } = await supabase
      .from('legal_implications')
      .select('*')
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching legal implications:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching legal implications:', err);
    return [];
  }
}

// Function to fetch reporting obligations for a case
async function fetchReportingObligations(caseId) {
  try {
    const { data, error } = await supabase
      .from('reporting_obligations')
      .select(`
        *,
        regulatory_frameworks(framework_name, description, sequence_order)
      `)
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching reporting obligations:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching reporting obligations:', err);
    return [];
  }
}

// Function to fetch clinical trials for a case
async function fetchClinicalTrials(caseId) {
  try {
    const { data, error } = await supabase
      .from('clinical_trials')
      .select('*')
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching clinical trials:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching clinical trials:', err);
    return [];
  }
}

// Function to fetch summary points for a case
async function fetchSummaryPoints(caseId) {
  try {
    const { data, error } = await supabase
      .from('summary_points')
      .select('*')
      .eq('case_id', caseId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching summary points:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Exception fetching summary points:', err);
    return [];
  }
}

// Function to load all case data and render the assessment
async function loadAndRenderAssessment(caseNumber) {
  try {
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    
    // Fetch case information
    const caseInfo = await fetchCaseInfo(caseNumber);
    
    if (!caseInfo) {
      console.error('Case not found:', caseNumber);
      document.getElementById('loading-indicator').style.display = 'none';
      document.getElementById('error-message').textContent = `Case ${caseNumber} not found.`;
      document.getElementById('error-message').style.display = 'block';
      return;
    }
    
    // Fetch all related data
    const [
      audioSegments,
      gaslightingTactics,
      legalImplications,
      reportingObligations,
      clinicalTrials,
      summaryPoints
    ] = await Promise.all([
      fetchAudioSegments(caseInfo.id),
      fetchGaslightingTactics(caseInfo.id),
      fetchLegalImplications(caseInfo.id),
      fetchReportingObligations(caseInfo.id),
      fetchClinicalTrials(caseInfo.id),
      fetchSummaryPoints(caseInfo.id)
    ]);
    
    // Render case information
    renderCaseInfo(caseInfo);
    
    // Render audio segments
    renderAudioSegments(audioSegments);
    
    // Render gaslighting tactics
    renderGaslightingTactics(gaslightingTactics);
    
    // Render legal implications
    renderLegalImplications(legalImplications);
    
    // Render reporting obligations
    renderReportingObligations(reportingObligations);
    
    // Render clinical trials
    renderClinicalTrials(clinicalTrials);
    
    // Render summary points
    renderSummaryPoints(summaryPoints);
    
    // Initialize audio player functionality
    initializeAudioPlayer();
    
    // Hide loading indicator
    document.getElementById('loading-indicator').style.display = 'none';
    
  } catch (err) {
    console.error('Error loading and rendering assessment:', err);
    document.getElementById('loading-indicator').style.display = 'none';
    document.getElementById('error-message').textContent = 'Error loading assessment data.';
    document.getElementById('error-message').style.display = 'block';
  }
}

// Function to render case information
function renderCaseInfo(caseInfo) {
  document.getElementById('case-number').textContent = caseInfo.case_number;
  document.getElementById('recording-date').textContent = new Date(caseInfo.recording_date).toLocaleDateString();
  document.getElementById('location').textContent = caseInfo.location;
  document.getElementById('subject-name').textContent = caseInfo.subject_name;
  document.getElementById('subject-role').textContent = caseInfo.subject_role || '';
  document.getElementById('complainant-name').textContent = caseInfo.complainant_name;
  document.getElementById('complainant-role').textContent = caseInfo.complainant_role || '';
  document.getElementById('concerning').textContent = caseInfo.concerning;
}

// Function to render audio segments
function renderAudioSegments(audioSegments) {
  const container = document.getElementById('audio-segments-container');
  container.innerHTML = '';
  
  audioSegments.forEach(segment => {
    const segmentDiv = document.createElement('div');
    segmentDiv.id = `segment-${Math.floor(segment.start_time)}`;
    segmentDiv.className = 'audio-segment';
    segmentDiv.dataset.startTime = segment.start_time;
    segmentDiv.dataset.endTime = segment.end_time;
    segmentDiv.style.backgroundColor = '#f8f8f8';
    segmentDiv.style.border = '1px solid #ddd';
    segmentDiv.style.padding = '20px';
    segmentDiv.style.marginBottom = '25px';
    segmentDiv.style.borderRadius = '5px';
    segmentDiv.style.cursor = 'pointer';
    segmentDiv.style.transition = 'all 0.3s ease';
    
    // Create title with click to hear button if needed
    const titleH4 = document.createElement('h4');
    titleH4.style.color = '#8b0000';
    titleH4.style.marginTop = '0';
    titleH4.style.fontSize = '16px';
    titleH4.textContent = segment.title;
    
    if (segment.click_to_hear) {
      const clickSpan = document.createElement('span');
      clickSpan.style.color = 'white';
      clickSpan.style.backgroundColor = '#8b0000';
      clickSpan.style.padding = '2px 6px';
      clickSpan.style.fontSize = '10px';
      clickSpan.style.borderRadius = '3px';
      clickSpan.textContent = 'CLICK TO HEAR';
      titleH4.appendChild(document.createTextNode(' '));
      titleH4.appendChild(clickSpan);
    }
    
    segmentDiv.appendChild(titleH4);
    
    // Create waveform visualization if available
    if (segment.waveform_data) {
      const waveformDiv = document.createElement('div');
      waveformDiv.style.display = 'flex';
      waveformDiv.style.flexWrap = 'wrap';
      waveformDiv.style.alignItems = 'center';
      waveformDiv.style.margin = '15px 0';
      
      const svgContainer = document.createElement('div');
      svgContainer.style.flex = '0 0 40%';
      svgContainer.style.paddingRight = '20px';
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '120');
      svg.setAttribute('viewBox', '0 0 300 120');
      svg.style.backgroundColor = '#fff';
      svg.style.border = '1px solid #ddd';
      
      // Add path from waveform_data
      if (segment.waveform_data.path) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', segment.waveform_data.path);
        path.setAttribute('stroke', '#8b0000');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-width', '1');
        svg.appendChild(path);
      }
      
      // Add rectangle highlight if in waveform_data
      if (segment.waveform_data.rect) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', segment.waveform_data.rect.x || '50');
        rect.setAttribute('y', segment.waveform_data.rect.y || '15');
        rect.setAttribute('width', segment.waveform_data.rect.width || '40');
        rect.setAttribute('height', segment.waveform_data.rect.height || '50');
        rect.setAttribute('fill', 'rgba(139,0,0,0.1)');
        rect.setAttribute('stroke', '#8b0000');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(rect);
      }
      
      // Add text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '150');
      text.setAttribute('y', '110');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#666');
      text.style.fontSize = '12px';
      text.textContent = segment.waveform_data.label || '';
      svg.appendChild(text);
      
      svgContainer.appendChild(svg);
      waveformDiv.appendChild(svgContainer);
      
      // Create clinical analysis section
      const clinicalDiv = document.createElement('div');
      clinicalDiv.style.flex = '0 0 60%';
      
      const clinicalBox = document.createElement('div');
      clinicalBox.style.backgroundColor = '#fff';
      clinicalBox.style.border = '1px solid #ddd';
      clinicalBox.style.padding = '15px';
      clinicalBox.style.borderRadius = '5px';
      
      const clinicalTitle = document.createElement('h5');
      clinicalTitle.style.color = '#8b0000';
      clinicalTitle.style.marginTop = '0';
      clinicalTitle.style.marginBottom = '10px';
      clinicalTitle.textContent = 'CLINICAL ANALYSIS';
      clinicalBox.appendChild(clinicalTitle);
      
      const clinicalList = document.createElement('ul');
      clinicalList.style.fontSize = '14px';
      clinicalList.style.paddingLeft = '20px';
      clinicalList.style.marginBottom = '0';
      
      // Add clinical analyses
      if (segment.clinical_analyses && segment.clinical_analyses.length > 0) {
        // Sort by sequence_order
        const sortedAnalyses = [...segment.clinical_analyses].sort((a, b) => a.sequence_order - b.sequence_order);
        
        sortedAnalyses.forEach(analysis => {
          const li = document.createElement('li');
          const strong = document.createElement('strong');
          strong.textContent = `${analysis.metric_name}: `;
          li.appendChild(strong);
          li.appendChild(document.createTextNode(analysis.metric_value));
          clinicalList.appendChild(li);
        });
      }
      
      clinicalBox.appendChild(clinicalList);
      clinicalDiv.appendChild(clinicalBox);
      waveformDiv.appendChild(clinicalDiv);
      
      segmentDiv.appendChild(waveformDiv);
    }
    
    // Create transcript context section
    const transcriptDiv = document.createElement('div');
    transcriptDiv.style.backgroundColor = '#fff';
    transcriptDiv.style.border = '1px solid #ddd';
    transcriptDiv.style.padding = '15px';
    transcriptDiv.style.borderRadius = '5px';
    transcriptDiv.style.marginTop = '15px';
    
    const transcriptTitle = document.createElement('h5');
    transcriptTitle.style.color = '#8b0000';
    transcriptTitle.style.marginTop = '0';
    transcriptTitle.style.marginBottom = '10px';
    transcriptTitle.textContent = 'TRANSCRIPT CONTEXT';
    transcriptDiv.appendChild(transcriptTitle);
    
    // Add transcript entries
    if (segment.transcript_entries && segment.transcript_entries.length > 0) {
      // Sort by sequence_order
      const sortedEntries = [...segment.transcript_entries].sort((a, b) => a.sequence_order - b.sequence_order);
      
      const transcriptP = document.createElement('p');
      transcriptP.style.fontStyle = 'italic';
      transcriptP.style.marginBottom = '10px';
      
      sortedEntries.forEach((entry, index) => {
        const strong = document.createElement('strong');
        strong.textContent = `${entry.speaker}: `;
        transcriptP.appendChild(strong);
        transcriptP.appendChild(document.createTextNode(`"${entry.text}"`));
        
        if (index < sortedEntries.length - 1) {
          transcriptP.appendChild(document.createElement('br'));
        }
      });
      
      transcriptDiv.appendChild(transcriptP);
    }
    
    // Add significance explanation
    if (segment.significance_explanations && segment.significance_explanations.length > 0) {
      const significanceP = document.createElement('p');
      const significanceStrong = document.createElement('strong');
      significanceStrong.textContent = 'SIGNIFICANCE: ';
      significanceP.appendChild(significanceStrong);
      significanceP.appendChild(document.createTextNode(segment.significance_explanations[0].explanation));
      transcriptDiv.appendChild(significanceP);
    }
    
    segmentDiv.appendChild(transcriptDiv);
    container.appendChild(segmentDiv);
  });
}

// Function to render gaslighting tactics
function renderGaslightingTactics(tactics) {
  const container = document.getElementById('gaslighting-tactics-container');
  container.innerHTML = '';
  
  const ul = document.createElement('ul');
  
  tactics.forEach(tactic => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${tactic.tactic_name}: `;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(tactic.description));
    ul.appendChild(li);
  });
  
  container.appendChild(ul);
}

// Function to render legal implications
function renderLegalImplications(implications) {
  const container = document.getElementById('legal-implications-container');
  container.innerHTML = '';
  
  const p = document.createElement('p');
  p.textContent = 'The subject\'s conduct as documented in this audio recording constitutes:';
  container.appendChild(p);
  
  const ol = document.createElement('ol');
  
  implications.forEach(implication => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${implication.implication_type} `;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(implication.description));
    ol.appendChild(li);
  });
  
  container.appendChild(ol);
}

// Function to render reporting obligations
function renderReportingObligations(obligations) {
  const container = document.getElementById('reporting-obligations-container');
  container.innerHTML = '';
  
  obligations.forEach(obligation => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'evidence-item';
    
    const analysisDiv = document.createElement('div');
    analysisDiv.className = 'analysis';
    
    if (obligation.entity_name === 'RICHARD\'S UNIVERSITY/EDUCATIONAL INSTITUTION') {
      analysisDiv.textContent = 'The following legal and regulatory frameworks MANDATE reporting to Richard\'s educational institution:';
    } else {
      analysisDiv.textContent = `If Richard is an international student, the following immigration considerations apply:`;
    }
    
    itemDiv.appendChild(analysisDiv);
    
    const ul = document.createElement('ul');
    
    // Add regulatory frameworks
    if (obligation.regulatory_frameworks && obligation.regulatory_frameworks.length > 0) {
      // Sort by sequence_order
      const sortedFrameworks = [...obligation.regulatory_frameworks].sort((a, b) => a.sequence_order - b.sequence_order);
      
      sortedFrameworks.forEach(framework => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${framework.framework_name} `;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(`- ${framework.description}`));
        ul.appendChild(li);
      });
    }
    
    itemDiv.appendChild(ul);
    
    // Add legal basis
    if (obligation.legal_basis) {
      const basisDiv = document.createElement('div');
      basisDiv.className = 'analysis';
      basisDiv.textContent = `LEGAL BASIS: ${obligation.legal_basis}`;
      itemDiv.appendChild(basisDiv);
    }
    
    container.appendChild(itemDiv);
  });
}

// Function to render clinical trials
function renderClinicalTrials(trials) {
  const container = document.getElementById('clinical-trials-container');
  container.innerHTML = '';
  
  const tableDiv = document.createElement('div');
  tableDiv.style.backgroundColor = '#f8f8f8';
  tableDiv.style.border = '1px solid #ddd';
  tableDiv.style.padding = '15px';
  tableDiv.style.margin = '20px 0';
  tableDiv.style.borderRadius = '5px';
  
  const title = document.createElement('h4');
  title.style.color = '#8b0000';
  title.style.marginTop = '0';
  title.textContent = 'CLINICAL TRIAL SUBSTANTIATION';
  tableDiv.appendChild(title);
  
  const p = document.createElement('p');
  p.textContent = 'The audio analysis findings are substantiated by the following clinical research:';
  tableDiv.appendChild(p);
  
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.margin = '10px 0';
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.backgroundColor = '#8b0000';
  headerRow.style.color = 'white';
  
  const headers = ['Clinical Trial', 'Relevant Findings', 'Application to Richard\'s Audio'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.border = '1px solid #ddd';
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  trials.forEach((trial, index) => {
    const row = document.createElement('tr');
    
    if (index % 2 === 1) {
      row.style.backgroundColor = '#f2f2f2';
    }
    
    // Trial name cell
    const nameCell = document.createElement('td');
    nameCell.style.padding = '8px';
    nameCell.style.border = '1px solid #ddd';
    
    const trialName = document.createElement('div');
    trialName.textContent = trial.trial_name;
    nameCell.appendChild(trialName);
    
    if (trial.researchers) {
      const researchers = document.createElement('span');
      researchers.style.fontSize = '10px';
      researchers.textContent = trial.researchers;
      nameCell.appendChild(document.createElement('br'));
      nameCell.appendChild(researchers);
    }
    
    if (trial.sample_size) {
      const sampleSize = document.createElement('span');
      sampleSize.style.fontSize = '10px';
      sampleSize.textContent = trial.sample_size;
      nameCell.appendChild(document.createElement('br'));
      nameCell.appendChild(sampleSize);
    }
    
    row.appendChild(nameCell);
    
    // Findings cell
    const findingsCell = document.createElement('td');
    findingsCell.style.padding = '8px';
    findingsCell.style.border = '1px solid #ddd';
    findingsCell.textContent = trial.relevant_findings;
    row.appendChild(findingsCell);
    
    // Application cell
    const applicationCell = document.createElement('td');
    applicationCell.style.padding = '8px';
    applicationCell.style.border = '1px solid #ddd';
    applicationCell.textContent = trial.application_to_case;
    row.appendChild(applicationCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  tableDiv.appendChild(table);
  container.appendChild(tableDiv);
}

// Function to render summary points
function renderSummaryPoints(points) {
  const container = document.getElementById('summary-points-container');
  container.innerHTML = '';
  
  const ol = document.createElement('ol');
  
  points.forEach(point => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = `${point.timestamp_reference} - ${point.title}: `;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(point.description));
    ol.appendChild(li);
  });
  
  container.appendChild(ol);
}

// Function to initialize audio player functionality
function initializeAudioPlayer() {
  // Get the main audio element
  const audioElement = document.getElementById('mainAudio');
  
  // Add click event listeners to all audio segments
  document.querySelectorAll('.audio-segment').forEach(segment => {
    segment.addEventListener('click', function() {
      const startTime = parseFloat(this.getAttribute('data-start-time'));
      const endTime = parseFloat(this.getAttribute('data-end-time'));
      
      // If this segment is already playing, stop it
      if (this.classList.contains('playing')) {
        stopAllAudio();
      } else {
        // Otherwise play this segment
        playAudioSegment(startTime, endTime);
      }
    });
  });
  
  // Add click event listener to stop button
  document.getElementById('stopAllAudioButton').addEventListener('click', stopAllAudio);
  
  // Variables to track current audio playback
  let currentAudio = null;
  
  // Function to play an audio segment
  function playAudioSegment(startTime, endTime) {
    // Stop any currently playing audio
    stopAllAudio();
    
    // Set the current time to the start time
    audioElement.currentTime = startTime;
    
    // Create a function to check if we've reached the end time
    const checkTimeAndLoop = function() {
      if (audioElement.currentTime >= endTime) {
        audioElement.currentTime = startTime; // Loop back to start time
      }
    };
    
    // Add the timeupdate event listener
    audioElement.addEventListener('timeupdate', checkTimeAndLoop);
    
    // Store the current audio info for later cleanup
    currentAudio = {
      element: audioElement,
      listener: checkTimeAndLoop,
      startTime: startTime,
      endTime: endTime
    };
    
    // Play the audio
    audioElement.play();
    
    // Update UI to show which segment is playing
    updatePlayingIndicators(startTime);
  }
  
  // Function to stop all audio
  function stopAllAudio() {
    if (currentAudio) {
      // Remove the timeupdate event listener
      currentAudio.element.removeEventListener('timeupdate', currentAudio.listener);
      
      // Pause the audio
      currentAudio.element.pause();
      
      // Reset current audio
      currentAudio = null;
      
      // Reset all playing indicators
      updatePlayingIndicators(null);
    }
  }
  
  // Function to update playing indicators
  function updatePlayingIndicators(startTime) {
    // Remove 'playing' class from all segments
    document.querySelectorAll('.audio-segment').forEach(segment => {
      segment.classList.remove('playing');
    });
    
    // Add 'playing' class to the current segment if any
    if (startTime !== null) {
      const segmentId = `segment-${Math.floor(startTime)}`;
      const segment = document.getElementById(segmentId);
      if (segment) {
        segment.classList.add('playing');
      }
    }
  }
}

// Export functions for use in the application
export {
  supabase,
  loadAndRenderAssessment,
  fetchCaseInfo,
  fetchAudioSegments,
  fetchGaslightingTactics,
  fetchLegalImplications,
  fetchReportingObligations,
  fetchClinicalTrials,
  fetchSummaryPoints
};
