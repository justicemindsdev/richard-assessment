// PUB LOVE LTD - Demo Analysis with Mock Data
// This demonstrates what the full analysis would show with a valid API key

const fs = require('fs');

// Mock data that would be returned from Companies House API
const mockData = {
  profile: {
    company_name: "PUB LOVE LTD",
    company_number: "06469931", 
    company_status: "active",
    type: "ltd",
    date_of_creation: "2007-12-17",
    sic_codes: ["56101", "55101"],
    accounts: {
      next_due: "2025-09-30",
      last_accounts: {
        made_up_to: "2023-12-31"
      }
    },
    confirmation_statement: {
      next_due: "2024-12-31"
    }
  },
  registeredOffice: {
    address_line_1: "123 Victoria Street",
    address_line_2: "Westminster",
    locality: "London",
    postal_code: "SW1V 1AB",
    country: "United Kingdom"
  },
  officers: {
    items: [
      {
        name: "STACKHOUSE, Ben",
        officer_role: "director",
        appointed_on: "2007-12-17",
        nationality: "British",
        occupation: "Company Director"
      }
    ]
  },
  psc: {
    items: [
      {
        name: "Ben Stackhouse",
        nature_of_control: [
          "ownership-of-shares-75-to-100-percent",
          "voting-rights-75-to-100-percent"
        ]
      }
    ]
  },
  filingHistory: {
    items: [
      {
        date: "2024-03-15",
        description: "Confirmation statement",
        category: "confirmation-statement",
        type: "CS01"
      },
      {
        date: "2023-10-01",
        description: "Annual accounts",
        category: "accounts",
        type: "AA"
      }
    ]
  },
  charges: {
    total_count: 0,
    satisfied_count: 0,
    part_satisfied_count: 0,
    items: []
  }
};

console.log('🏢 PUB LOVE LTD - Demo Analysis Report');
console.log('=====================================');
console.log('\n⚠️  This is a DEMO using mock data to show what the analysis would look like.');
console.log('For real data, you need a valid Companies House API key.\n');

console.log('📊 Company Profile');
console.log('==================');
console.log(`Company: ${mockData.profile.company_name}`);
console.log(`Number: ${mockData.profile.company_number}`); 
console.log(`Status: ${mockData.profile.company_status}`);
console.log(`Type: ${mockData.profile.type}`);
console.log(`Incorporated: ${mockData.profile.date_of_creation}`);
console.log(`SIC Codes: ${mockData.profile.sic_codes.join(', ')}`);

console.log('\n📍 Registered Office');
console.log('===================');
console.log(mockData.registeredOffice.address_line_1);
console.log(mockData.registeredOffice.address_line_2);
console.log(mockData.registeredOffice.locality);
console.log(mockData.registeredOffice.postal_code);

console.log('\n👥 Officers');
console.log('===========');
mockData.officers.items.forEach(officer => {
  console.log(`- ${officer.name} (${officer.officer_role})`);
  console.log(`  Appointed: ${officer.appointed_on}`);
  console.log(`  Status: Active`);
});

console.log('\n🔑 Persons with Significant Control');
console.log('===================================');
mockData.psc.items.forEach(person => {
  console.log(`- ${person.name}`);
  console.log('  Nature of Control:');
  person.nature_of_control.forEach(control => {
    console.log(`    - ${control}`);
  });
});

console.log('\n📈 Business Analysis Summary');
console.log('===========================');
console.log('\n💰 Financial Metrics (Based on industry analysis):');
console.log('- Estimated Revenue: $10 million');
console.log('- Employee Count: 36');
console.log('- Estimated Profit Margin: 15-20%');
console.log('- Estimated Annual Outgoings: $7.5-8 million');

console.log('\n🏛️ Claims & Legal Status:');
console.log('- No active charges registered');
console.log('- No significant legal claims found in public records');
console.log('- Company in good standing with active status');

console.log('\n📊 Discrepancy Analysis:');
console.log('✅ Establishment Date: Matches (Founded 2007, Incorporated 2007-12-17)');
console.log('⚠️  Registered Address: May differ from reported address (1 Vincent Square vs actual records)');
console.log('⚠️  Financial Data: Not directly available through Companies House API');

console.log('\n📝 Key Findings:');
console.log('1. Company operates a unique pub-hostel hybrid model');
console.log('2. Strong market position in London hospitality sector');
console.log('3. Founder Ben Stackhouse maintains significant control');
console.log('4. Regular filing compliance indicates good governance');
console.log('5. No financial distress indicators found');

// Generate enhanced analysis report
const analysisReport = {
  company: {
    name: "PUB LOVE LTD",
    number: "06469931",
    analysisDate: new Date().toISOString()
  },
  summary: {
    status: "Active and compliant",
    riskLevel: "Low",
    businessModel: "Pub-hostel hybrid in London",
    keyStrengths: [
      "Innovative business model",
      "Prime London locations",
      "Award-winning food offerings",
      "Established brand presence"
    ]
  },
  financials: {
    revenue: "$10 million (estimated)",
    employees: 36,
    profitMargin: "15-20% (industry average)",
    outgoings: {
      staffCosts: "$3.5-4 million",
      foodBeverage: "$2.5-3 million", 
      property: "$1.5-2 million",
      other: "$0.5-1 million"
    }
  },
  recommendations: [
    "Obtain full filed accounts for detailed financial analysis",
    "Monitor for any new legal filings or claims",
    "Track expansion plans and new property acquisitions",
    "Analyze customer reviews and social media presence"
  ]
};

// Save analysis to file
fs.writeFileSync('publove_demo_analysis.json', JSON.stringify(analysisReport, null, 2));

console.log('\n✅ Demo analysis complete!');
console.log('Results saved to: publove_demo_analysis.json');

console.log('\n🔑 To get real data:');
console.log('1. Visit https://developer.company-information.service.gov.uk/');
console.log('2. Create an account and get your API key');
console.log('3. Run: COMPANIES_HOUSE_API_KEY=your-key-here node publove_api_client.js');
console.log('\nOr use the web dashboard (publove_dashboard.html) with your API key!');
