const fs = require('fs');

const currentData = fs.readFileSync('/Users/anikabadkul/.gemini/antigravity/scratch/apm-tracker/data.js', 'utf-8');
const arrayStr = currentData.substring(currentData.indexOf('['), currentData.lastIndexOf(']') + 1);
const companies = JSON.parse(arrayStr);
console.log(`Initial companies: ${companies.length}`);

const content = fs.readFileSync('/Users/anikabadkul/.gemini/antigravity/brain/2927e32c-95cc-4d29-a0b9-54b76515e7a4/.system_generated/steps/161/content.md', 'utf-8');

const rows = content.split('<tr class="border-b transition-colors hover:bg-muted/50');
let added = 0;

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const nameMatch = row.match(/<h4[^>]*>([^<]+)<\/h4>/);
  if (!nameMatch) continue;
  const name = nameMatch[1].trim();

  let linkMatch = row.match(/href="([^"]+)"/);
  let link = linkMatch ? linkMatch[1] : `https://careers.${name.toLowerCase().replace(/[^a-z]/g, '')}.com`;
  
  if (link.startsWith('/')) link = 'https://www.apmseason.com' + link;

  let status = "Not yet open";
  if (row.includes('Open<!--')) {
      status = "Open";
  }

  // Deduplicate
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
    signals: "Source: APM Season",
    link: link,
    status: status,
    lastChecked: new Date().toISOString()
  });
  added++;
}

console.log(`Added ${added} companies from APM Season`);
console.log(`Total companies: ${companies.length}`);

const output = `const companies = ${JSON.stringify(companies, null, 2)};`;
fs.writeFileSync('/Users/anikabadkul/.gemini/antigravity/scratch/apm-tracker/data.js', output);
