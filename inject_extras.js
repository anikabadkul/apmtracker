const fs = require('fs');
const currentData = fs.readFileSync('/Users/anikabadkul/.gemini/antigravity/scratch/apm-tracker/data.js', 'utf-8');
const arrayStr = currentData.substring(currentData.indexOf('['), currentData.lastIndexOf(']') + 1);
const companies = JSON.parse(arrayStr);

const extras = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", "Netflix", "Uber", "Lyft", "Airbnb", "DoorDash",
  "Snap", "Pinterest", "Spotify", "Stripe", "Square", "Coinbase", "Robinhood", "Discord",
  "Roblox", "Epic Games", "Twitch", "Roku", "Peloton", "Zillow", "Redfin", "Opendoor", "Compass",
  "Affirm", "Klarna", "Chime", "Plaid", "Brex", "Ramp", "Gusto", "Rippling", "Deel", "Figma",
  "Canva", "Notion", "Airtable", "Miro", "Coda", "Asana", "Monday.com", "Smartsheet", "Datadog",
  "Snowflake", "Databricks", "MongoDB", "Elastic", "Confluent", "HashiCorp", "Okta", "CrowdStrike",
  "Palo Alto Networks", "Cloudflare", "Fastly", "Twilio", "SendGrid", "MessageBird", "Zoom", "Slack",
  "Atlassian", "ServiceNow", "Workday", "Salesforce", "HubSpot", "Zendesk", "Intercom", "Dropbox",
  "Box", "DocuSign", "Adobe", "Autodesk", "Intuit", "Shopify", "BigCommerce", "Etsy", "Wayfair",
  "Chewy", "Instacart", "Grubhub", "Postmates", "Expedia", "Booking.com", "TripAdvisor", "Kayak",
  "Yelp", "OpenTable", "Eventbrite", "Ticketmaster", "StubHub", "SeatGeek", "Vimeo", "TikTok",
  "ByteDance", "Tencent", "Alibaba", "Baidu", "JD.com", "Meituan", "Didi", "Grab", "Gojek",
  "MercadoLibre", "Nubank", "Stone", "PagSeguro", "Paytm", "Flipkart", "Ola", "Swiggy", "Zomato",
  "Cisco", "IBM", "Oracle", "SAP", "VMware", "Intel", "Nvidia", "AMD", "Qualcomm", "Broadcom",
  "Texas Instruments", "Micron", "Applied Materials", "ASML", "TSMC", "Samsung", "Sony", "LG",
  "Panasonic", "Philips", "Siemens", "GE", "Honeywell", "3M", "DuPont", "Dow", "BASF", "Bayer",
  "Johnson & Johnson", "Pfizer", "Merck", "Novartis", "Roche", "Sanofi", "GlaxoSmithKline",
  "AstraZeneca", "Abbott", "Medtronic", "Boston Scientific", "Stryker", "Becton Dickinson",
  "Baxter", "Danaher", "Thermo Fisher", "Illumina", "Agilent", "PerkinElmer", "Waters", "Mettler Toledo"
];

let added = 0;
for (const name of extras) {
    if (!companies.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        companies.push({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: name,
            program: "Product Management (APM / Intern)",
            domain: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            expectedOpening: "Follows tech cycle",
            sortMonth: 8,
            signals: "Fortune 500 / Big Tech",
            link: `https://careers.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            status: "Not yet open",
            lastChecked: new Date().toISOString()
        });
        added++;
    }
}

console.log(`Added ${added} extra companies`);
console.log(`Total companies: ${companies.length}`);

const output = `const companies = ${JSON.stringify(companies, null, 2)};`;
fs.writeFileSync('/Users/anikabadkul/.gemini/antigravity/scratch/apm-tracker/data.js', output);
