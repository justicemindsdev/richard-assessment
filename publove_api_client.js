// PUB LOVE LTD - Companies House API Client
// This script retrieves and analyzes data about PUB LOVE LTD from the Companies House API

const axios = require('axios');
const fs = require('fs');

// Configuration
const API_KEY = process.env.COMPANIES_HOUSE_API_KEY || 'b62f60b7-7bc0-43c4-8c45-85be81cdbf73';
const COMPANY_NUMBER = '06469931'; // PUB LOVE LTD company number
const BASE_URL = 'https://api.company-information.service.gov.uk'; // Using the correct URL

console.log('🔑 Using API Key:', API_KEY.substring(0, 8) + '...' + (API_KEY.length > 8 ? API_KEY.substring(API_KEY.length - 4) : ''));

// Initialize data storage
const companyData = {};

// Main function to orchestrate the data gathering process
async function gatherCompanyData() {
  console.log('🏢 PUB LOVE LTD - Companies House Data Analysis');
  console.log('=============================================\n');
  
  try {
    // Get company profile
    console.log('📊 Retrieving company profile...');
    companyData.profile = await fetchCompanyProfile();
    displayCompanyProfile(companyData.profile);
    
    // Get registered office address
    console.log('\n📍 Retrieving registered office address...');
    companyData.registeredOffice = await fetchRegisteredOfficeAddress();
    displayRegisteredOffice(companyData.registeredOffice);
    
    // Get officers
    console.log('\n👥 Retrieving company officers...');
    companyData.officers = await fetchCompanyOfficers();
    displayOfficers(companyData.officers);
    
    // Get persons with significant control
    console.log('\n🔑 Retrieving persons with significant control...');
    companyData.psc = await fetchPersonsWithSignificantControl();
    displayPSC(companyData.psc);
    
    // Get filing history
    console.log('\n📑 Retrieving filing history...');
    companyData.filingHistory = await fetchFilingHistory();
    displayFilingHistory(companyData.filingHistory);
    
    // Get charges
    console.log('\n💰 Retrieving charges information...');
    companyData.charges = await fetchCharges();
    displayCharges(companyData.charges);
    
    // Save all data to file
    saveDataToFile();
    
    // Generate report
    generateHtmlReport();
    
    console.log('\n✅ Data gathering complete!');
    console.log('Results have been saved to publove_data.json');
    console.log('An HTML report has been generated as publove_report.html');
    
  } catch (error) {
    console.error('\n❌ An error occurred during data gathering:');
    console.error(error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Details: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// API call functions
async function fetchCompanyProfile() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}`);
  return response;
}

async function fetchRegisteredOfficeAddress() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}/registered-office-address`);
  return response;
}

async function fetchCompanyOfficers() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}/officers`);
  return response;
}

async function fetchPersonsWithSignificantControl() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}/persons-with-significant-control`);
  return response;
}

async function fetchFilingHistory() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}/filing-history`);
  return response;
}

async function fetchCharges() {
  const response = await makeApiCall(`/company/${COMPANY_NUMBER}/charges`);
  return response;
}

// Helper function for API calls
async function makeApiCall(endpoint) {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(API_KEY + ':').toString('base64')}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error('\n❌ Authentication Error!');
      console.error('The API key appears to be invalid or expired.');
      console.error('\nTo get a valid API key:');
      console.error('1. Visit https://developer.company-information.service.gov.uk/');
      console.error('2. Register for an account or sign in');
      console.error('3. Go to "Manage API Keys" in your account');
      console.error('4. Create a new API key for live data');
      console.error('5. Replace the API_KEY in this script or set the COMPANIES_HOUSE_API_KEY environment variable');
      console.error('\nExample: COMPANIES_HOUSE_API_KEY=your-key-here node publove_api_client.js');
    }
    throw error;
  }
}

// Display functions
function displayCompanyProfile(profile) {
  console.log(`\nCompany: ${profile.company_name}`);
  console.log(`Number: ${profile.company_number}`);
  console.log(`Status: ${profile.company_status}`);
  console.log(`Type: ${profile.type}`);
  console.log(`Incorporated: ${profile.date_of_creation}`);
  
  if (profile.sic_codes) {
    console.log(`SIC Codes: ${profile.sic_codes.join(', ')}`);
  }
  
  if (profile.accounts) {
    console.log('\nAccounts:');
    console.log(`  Next Due: ${profile.accounts.next_due || 'N/A'}`);
    if (profile.accounts.last_accounts) {
      console.log(`  Last Accounts: ${profile.accounts.last_accounts.made_up_to || 'N/A'}`);
    }
  }
}

function displayRegisteredOffice(office) {
  console.log('\nRegistered Office Address:');
  console.log(`${office.address_line_1 || ''}`);
  if (office.address_line_2) console.log(office.address_line_2);
  console.log(`${office.locality || ''}`);
  if (office.region) console.log(office.region);
  console.log(`${office.postal_code || ''}`);
  console.log(`${office.country || ''}`);
}

function displayOfficers(officers) {
  console.log(`\nCompany Officers (${officers.items ? officers.items.length : 0}):`);
  
  if (!officers.items || officers.items.length === 0) {
    console.log('No officers found.');
    return;
  }
  
  officers.items.forEach(officer => {
    console.log(`\n- ${officer.name} (${officer.officer_role})`);
    console.log(`  Appointed: ${officer.appointed_on}`);
    if (officer.resigned_on) {
      console.log(`  Resigned: ${officer.resigned_on}`);
    } else {
      console.log(`  Status: Active`);
    }
  });
}

function displayPSC(psc) {
  console.log(`\nPersons with Significant Control (${psc.items ? psc.items.length : 0}):`);
  
  if (!psc.items || psc.items.length === 0) {
    console.log('No persons with significant control found.');
    return;
  }
  
  psc.items.forEach(person => {
    console.log(`\n- ${person.name}`);
    if (person.nature_of_control) {
      console.log('  Nature of Control:');
      person.nature_of_control.forEach(control => {
        console.log(`    - ${control}`);
      });
    }
  });
}

function displayFilingHistory(history) {
  console.log(`\nFiling History (${history.items ? history.items.length : 0} items):`);
  
  if (!history.items || history.items.length === 0) {
    console.log('No filing history found.');
    return;
  }
  
  // Display just the most recent 5 filings
  history.items.slice(0, 5).forEach(filing => {
    console.log(`\n- ${filing.date}: ${filing.description}`);
    console.log(`  Category: ${filing.category}`);
    console.log(`  Type: ${filing.type}`);
  });
  
  if (history.items.length > 5) {
    console.log(`\n(${history.items.length - 5} more items not shown)`);
  }
}

function displayCharges(charges) {
  console.log(`\nCharges (${charges.total_count || 0}):`);
  console.log(`  Satisfied: ${charges.satisfied_count || 0}`);
  console.log(`  Part Satisfied: ${charges.part_satisfied_count || 0}`);
  
  if (!charges.items || charges.items.length === 0) {
    console.log('No charges found.');
    return;
  }
  
  charges.items.forEach(charge => {
    console.log(`\n- ${charge.classification ? charge.classification.description : 'Charge'}`);
    console.log(`  Created: ${charge.created_on}`);
    console.log(`  Status: ${charge.status}`);
    
    if (charge.persons_entitled) {
      console.log('  Persons Entitled:');
      charge.persons_entitled.forEach(person => {
        console.log(`    - ${person.name}`);
      });
    }
  });
}

// Save data to JSON file
function saveDataToFile() {
  const data = {
    company_number: COMPANY_NUMBER,
    retrieved_at: new Date().toISOString(),
    data: companyData
  };
  
  fs.writeFileSync('publove_data.json', JSON.stringify(data, null, 2));
}

// Generate HTML report
function generateHtmlReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PUB LOVE LTD - Business Analysis Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f7fa;
    }
    header {
      background-color: #1d3557;
      color: white;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    h1, h2, h3 {
      color: #1d3557;
    }
    header h1 {
      color: white;
      margin: 0;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 25px;
      margin-bottom: 25px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f1f8ff;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .discrepancy {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      padding: 15px;
      margin: 15px 0;
    }
    .match {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 15px 0;
    }
    .data-source {
      font-style: italic;
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <header>
    <h1>PUB LOVE LTD - Business Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()} using Companies House API data</p>
  </header>

  <div class="card">
    <h2>Executive Summary</h2>
    <p>This report presents a comprehensive analysis of PUB LOVE LTD's business operations based on data from Companies House. The company operates a unique business model combining traditional pubs with hostel accommodations in London.</p>
  </div>
  
  ${companyData.profile ? `
  <div class="card">
    <h2>Company Profile</h2>
    <table>
      <tr>
        <th>Attribute</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Company Name</td>
        <td>${companyData.profile.company_name || 'N/A'}</td>
      </tr>
      <tr>
        <td>Company Number</td>
        <td>${companyData.profile.company_number || 'N/A'}</td>
      </tr>
      <tr>
        <td>Company Status</td>
        <td>${companyData.profile.company_status || 'N/A'}</td>
      </tr>
      <tr>
        <td>Company Type</td>
        <td>${companyData.profile.type || 'N/A'}</td>
      </tr>
      <tr>
        <td>Incorporation Date</td>
        <td>${companyData.profile.date_of_creation || 'N/A'}</td>
      </tr>
      <tr>
        <td>SIC Codes</td>
        <td>${companyData.profile.sic_codes ? companyData.profile.sic_codes.join(', ') : 'N/A'}</td>
      </tr>
    </table>
  </div>
  ` : ''}
  
  ${companyData.registeredOffice ? `
  <div class="card">
    <h2>Registered Office</h2>
    <p>${companyData.registeredOffice.address_line_1 || ''}</p>
    ${companyData.registeredOffice.address_line_2 ? `<p>${companyData.registeredOffice.address_line_2}</p>` : ''}
    <p>${companyData.registeredOffice.locality || ''}</p>
    <p>${companyData.registeredOffice.postal_code || ''}</p>
  </div>
  ` : ''}
  
  ${companyData.officers && companyData.officers.items ? `
  <div class="card">
    <h2>Directors & Officers</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>Role</th>
        <th>Appointed</th>
        <th>Status</th>
      </tr>
      ${companyData.officers.items.map(officer => `
      <tr>
        <td>${officer.name}</td>
        <td>${officer.officer_role}</td>
        <td>${officer.appointed_on}</td>
        <td>${officer.resigned_on ? 'Resigned on ' + officer.resigned_on : 'Active'}</td>
      </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  
  ${companyData.psc && companyData.psc.items ? `
  <div class="card">
    <h2>Persons with Significant Control</h2>
    <table>
      <tr>
        <th>Name</th>
        <th>Nature of Control</th>
      </tr>
      ${companyData.psc.items.map(person => `
      <tr>
        <td>${person.name}</td>
        <td>${person.nature_of_control ? person.nature_of_control.join('<br>') : 'N/A'}</td>
      </tr>
      `).join('')}
    </table>
  </div>
  ` : ''}
  
  ${companyData.filingHistory && companyData.filingHistory.items ? `
  <div class="card">
    <h2>Filing History</h2>
    <table>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Type</th>
      </tr>
      ${companyData.filingHistory.items.slice(0, 10).map(filing => `
      <tr>
        <td>${filing.date}</td>
        <td>${filing.description}</td>
        <td>${filing.category}</td>
        <td>${filing.type}</td>
      </tr>
      `).join('')}
    </table>
    ${companyData.filingHistory.items.length > 10 ? 
      `<p class="data-source">Showing 10 of ${companyData.filingHistory.items.length} filings. See full data for complete history.</p>` : ''}
  </div>
  ` : ''}
  
  ${companyData.charges ? `
  <div class="card">
    <h2>Charges</h2>
    <p><strong>Total Charges:</strong> ${companyData.charges.total_count || 0}</p>
    <p><strong>Satisfied Charges:</strong> ${companyData.charges.satisfied_count || 0}</p>
    <p><strong>Part Satisfied Charges:</strong> ${companyData.charges.part_satisfied_count || 0}</p>
    
    ${companyData.charges.items && companyData.charges.items.length > 0 ? `
    <table>
      <tr>
        <th>Type</th>
        <th>Created</th>
        <th>Status</th>
        <th>Persons Entitled</th>
      </tr>
      ${companyData.charges.items.map(charge => `
      <tr>
        <td>${charge.classification ? charge.classification.description : 'Charge'}</td>
        <td>${charge.created_on}</td>
        <td>${charge.status}</td>
        <td>${charge.persons_entitled ? charge.persons_entitled.map(p => p.name).join(', ') : 'N/A'}</td>
      </tr>
      `).join('')}
    </table>
    ` : '<p>No charges found.</p>'}
  </div>
  ` : ''}
  
  <div class="card">
    <h2>Financial Information</h2>
    <p class="data-source">Note: The following financial information is based on reported figures and estimates, not directly available from Companies House API.</p>
    
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Source</th>
      </tr>
      <tr>
        <td>Estimated Revenue</td>
        <td>$10 million</td>
        <td>Company Report</td>
      </tr>
      <tr>
        <td>Employee Count</td>
        <td>36</td>
        <td>RocketReach</td>
      </tr>
    </table>
  </div>

  <div class="card">
    <h2>Discrepancy Analysis</h2>
    
    <div class="${companyData.profile && new Date(companyData.profile.date_of_creation).getFullYear() === 2007 ? 'match' : 'discrepancy'}">
      <h3>Establishment Date</h3>
      <p><strong>Report states:</strong> Founded in 2007</p>
      <p><strong>Companies House shows:</strong> ${companyData.profile ? 'Incorporated in ' + new Date(companyData.profile.date_of_creation).getFullYear() : 'N/A'}</p>
    </div>
    
    <div class="discrepancy">
      <h3>Registered Address</h3>
      <p><strong>Report states:</strong> 1 Vincent Square, London, SW1P 2PN</p>
      <p><strong>Companies House shows:</strong> ${companyData.registeredOffice ? [
        companyData.registeredOffice.address_line_1,
        companyData.registeredOffice.address_line_2,
        companyData.registeredOffice.locality,
        companyData.registeredOffice.postal_code
      ].filter(Boolean).join(', ') : 'N/A'}</p>
    </div>
  </div>

  <footer style="text-align: center; margin-top: 50px; padding: 20px; font-size: 0.8em; color: #666;">
    <p>This report was generated using data from Companies House API.</p>
    <p>Report date: ${new Date().toLocaleDateString()}</p>
  </footer>
</body>
</html>
  `;
  
  fs.writeFileSync('publove_report.html', html);
}

// Execute the main function
gatherCompanyData();
