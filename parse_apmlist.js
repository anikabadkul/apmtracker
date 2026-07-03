const fs = require('fs');

const content = fs.readFileSync('/Users/anikabadkul/.gemini/antigravity/brain/2927e32c-95cc-4d29-a0b9-54b76515e7a4/.system_generated/steps/141/content.md', 'utf-8');

// The file contains raw HTML. We can use simple regex to parse the tables.
// A row typically looks like:
// <tr class="body-row"><td><a ...>CompanyName</a></td><td>...</td><td class="type">APM</td>...<td><a href="URL"...>Apply</a></td></tr>

const companies = [];
const regex = /<tr class="body-row"><td>(?:<a[^>]*>([^<]+)<\/a>|([^<]+))<\/td><td>.*?<span class="status[^>]*>([^<]+)<\/span><\/td>.*?<td><a href="([^"]+)"[^>]*>Apply<\/a><\/td><\/tr>/g;

let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
  let name = match[1] || match[2];
  if (name) name = name.trim();
  const rawStatus = match[3] ? match[3].trim() : "Not Yet Open";
  const link = match[4];
  
  if (!name || !link) continue;
  
  // Deduplicate by name
  if (companies.find(c => c.name.toLowerCase() === name.toLowerCase())) continue;

  let domain = "";
  try {
    domain = new URL(link).hostname.replace('www.', '');
  } catch (e) {
    domain = name.toLowerCase().replace(/[^a-z]/g, '') + '.com';
  }

  companies.push({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: name,
    program: "Product Management (APM / Intern)",
    domain: domain,
    expectedOpening: "Follows tech cycle",
    sortMonth: 8,
    signals: "Source: APM List",
    link: link,
    status: rawStatus.toLowerCase().includes("open") && !rawStatus.toLowerCase().includes("not yet") ? "Open" : "Not yet open",
    lastChecked: new Date().toISOString()
  });
  count++;
}

console.log(`Parsed ${count} companies`);

const output = `const companies = ${JSON.stringify(companies, null, 2)};`;
fs.writeFileSync('/Users/anikabadkul/.gemini/antigravity/scratch/apm-tracker/data.js', output);
console.log('Successfully wrote to data.js');
