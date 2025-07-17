# PUB LOVE LTD Business Analysis

## Overview

This repository contains tools and analysis for researching PUB LOVE LTD, a company registered in the UK. The analysis combines data from Companies House API with business intelligence to provide a comprehensive view of the company's operations, structure, and market position.

## Key Findings

Our analysis has uncovered a significant discrepancy between publicly available information about PubLove's business operations and the official Companies House records:

1. **Operational vs. Legal Status Discrepancy**: While PubLove is described as an active hospitality business operating pubs and hostels in London with an estimated $10M revenue, Companies House records show it as a **dormant company** (SIC code 99999).

2. **Business Model**: PubLove reportedly operates a unique hybrid model combining traditional British pubs with hostel accommodations, but this active operation doesn't match the dormant status in official records.

3. **Corporate Structure**: Benjamin Ewald Stackhouse is listed as the active director and person with significant control (75-100% ownership), which is consistent across all sources.

4. **Registration Details**: 
   - Company Number: 06469931
   - Incorporated: January 10, 2008 (slight discrepancy with the reported founding in 2007)
   - Registered Address: 1 Vincent Square, London, SW1P 2PN (matches reported address)

## Hypothesis

Based on our findings, we propose the following hypotheses:

1. **Operating Structure**: The actual PubLove business operations may be conducted through:
   - A different legal entity, with PUB LOVE LTD serving as a holding company
   - A franchise or partnership model
   - Subsidiary companies not immediately apparent in the primary company registration

2. **Brand vs. Legal Entity**: The "PubLove" brand may be operated by a different legal entity than the registered PUB LOVE LTD company.

## Tools in this Repository

1. **publove_api_client.js**: Node.js script to retrieve and analyze PUB LOVE LTD data from the Companies House API.

2. **publove_demo_analysis.js**: Mock data version of the analysis for demonstration purposes.

3. **publove_dashboard.html**: Interactive web dashboard showing comprehensive business analysis with discrepancy highlighting.

4. **publove_oauth_client.js**: Alternative API client using OAuth2 authentication (not currently used).

## How to Use

1. **View the API Data**:
   ```
   node publove_api_client.js
   ```
   This requires a valid Companies House API key.

2. **View the Demo Analysis**:
   ```
   node publove_demo_analysis.js
   ```
   Shows similar output using mock data.

3. **View the Dashboard**:
   Open `publove_dashboard.html` in any web browser to see the interactive business intelligence dashboard.

## Recommendations for Further Investigation

1. **Legal Structure Research**: Investigate other companies associated with Benjamin Stackhouse or the PubLove brand.

2. **Property Records**: Research property ownership or leasing records for the pub locations mentioned in marketing materials.

3. **License Verification**: Check alcohol and hospitality licensing records for the PubLove locations.

4. **Business Registration**: Look into other business registrations that might be operating the actual pub and hostel operations.

5. **Financial Records**: Request full filed accounts from Companies House to understand the detailed financial position of PUB LOVE LTD.

## Sources

- Companies House API (official UK company registry)
- RocketReach (estimated employee count and revenue)
- Clearwater CF (information about PubLove's business operations)
- PubLove website and marketing materials
- Independent Hostels (information about locations)
- Booking.com (information about hostel operations)

## Conclusion

There appears to be a significant discrepancy between the public-facing PubLove business and the official registration of PUB LOVE LTD as a dormant company. This suggests a more complex business structure that would require further investigation to fully understand.
