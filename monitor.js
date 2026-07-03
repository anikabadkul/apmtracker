const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

const DATA_FILE = path.join(__dirname, 'data.js');

// 1. Read and parse the data.js file
let dataJsContent = fs.readFileSync(DATA_FILE, 'utf8');
const jsonMatch = dataJsContent.match(/const companies = (\[[\s\S]*\]);/);
if (!jsonMatch) {
    console.error("Could not parse data.js");
    process.exit(1);
}
// Safely evaluate the array using Function instead of direct eval
const companies = new Function(`return ${jsonMatch[1]}`)();

// 2. Setup Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

async function sendAlert(company) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log("Email credentials not provided, skipping email alert.");
        return;
    }

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send to yourself
        subject: `🚨 APM INTERNSHIP OPEN: ${company.name}`,
        text: `The APM/PM Internship for ${company.name} might be open!\n\nProgram: ${company.program}\nCheck it here: ${company.link}`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent for ${company.name}`);
    } catch (e) {
        console.error(`Failed to send email for ${company.name}:`, e);
    }
}

// 3. Scrape and Check
async function run() {
    console.log("Starting monitoring run...");
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new' 
    });
    
    let hasChanges = false;
    
    for (let i = 0; i < companies.length; i++) {
        let company = companies[i];
        
        // Only check if not already open/closed
        if (company.status !== 'Not yet open') continue;
        
        console.log(`Checking ${company.name}...`);
        
        const page = await browser.newPage();
        try {
            await page.goto(company.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
            
            // Wait for potential client-side rendering (React/Angular)
            await new Promise(r => setTimeout(r, 5000));
            
            const pageText = await page.evaluate(() => document.body.innerText);
            
            // Keywords to search for on the careers page
            const keywords = ['Product Manager Intern', 'Associate Product Manager Intern', 'RPM Intern', 'PMT Intern'];
            
            // Check if any keyword exists on the rendered page
            const found = keywords.some(k => pageText.toLowerCase().includes(k.toLowerCase()));
            
            if (found) {
                console.log(`Potential match found for ${company.name}!`);
                company.status = 'Open';
                company.lastChecked = new Date().toISOString();
                hasChanges = true;
                await sendAlert(company);
            } else {
                console.log(`No openings found for ${company.name} yet.`);
                company.lastChecked = new Date().toISOString();
                hasChanges = true; 
            }
        } catch (e) {
            console.error(`Error checking ${company.name}:`, e.message);
        } finally {
            await page.close();
        }
    }
    
    await browser.close();
    
    // 4. Save changes back to data.js
    if (hasChanges) {
        const newFileContent = `const companies = ${JSON.stringify(companies, null, 2)};`;
        fs.writeFileSync(DATA_FILE, newFileContent, 'utf8');
        console.log('data.js updated successfully.');
    }
}

run().catch(console.error);
