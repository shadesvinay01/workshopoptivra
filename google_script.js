/**
 * OPTIVRA AI ACADEMY — Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Open https://script.google.com and click "New Project"
 * 2. Delete all existing code and paste this entire file
 * 3. Update CONFIG.recipientEmail below to: hello@optivra.in
 * 4. Click "Deploy" > "New Deployment"
 * 5. Select Type: "Web App"
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy, authorize permissions, then copy the Web App URL
 * 9. In assets/js/script.js, replace [INSERT_GOOGLE_APPS_SCRIPT_URL_HERE] with the URL
 */

// --- CONFIGURATION ---
const CONFIG = {
    recipientEmail: 'hello@optivra.in',
    sheetName: 'Workshop Registrations'
};

/**
 * Handles POST requests from the website forms
 */
function doPost(e) {
    try {
        const sheet = getOrCreateSheet();
        const data = JSON.parse(e.postData.contents);

        if (data.type === 'referral') {
            handleReferral(sheet, data);
        } else if (data.type === 'campus_ambassador') {
            handleAmbassador(sheet, data);
        }

        return ContentService
            .createTextOutput(JSON.stringify({ status: 'success', message: 'Your request has been received!' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('Error: ' + error.toString());
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: 'An error occurred. Please try again.' }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Get or create the submissions sheet with proper headers
 */
function getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.sheetName);

    if (!sheet) {
        sheet = ss.insertSheet(CONFIG.sheetName);
        const headers = ['Timestamp', 'Type', 'Name', 'Email', 'Phone', 'College', 'Referred By', 'Motivation', 'Status'];
        sheet.appendRow(headers);

        // Style the header
        const hRange = sheet.getRange(1, 1, 1, headers.length);
        hRange.setFontWeight('bold');
        hRange.setBackground('#2563eb');
        hRange.setFontColor('#ffffff');
        sheet.setFrozenRows(1);
    }

    return sheet;
}

/**
 * Handle Referral Registration
 */
function handleReferral(sheet, data) {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    sheet.appendRow([
        new Date(),
        'Referral',
        data.name || '',
        data.email || '',
        data.phone || '',
        '',
        data.referredBy || 'Direct',
        '',
        'New'
    ]);

    const emailBody = `
═══════════════════════════════════════════════════════
NEW REFERRAL REGISTRATION — OPTIVRA AI ACADEMY
═══════════════════════════════════════════════════════

📋 STUDENT INFORMATION
───────────────────────────────────────────────────────
Name:          ${data.name}
Email:         ${data.email}
Phone:         ${data.phone || 'Not provided'}
Referred By:   ${data.referredBy || 'Direct (no referrer)'}

⏰ SUBMITTED AT
───────────────────────────────────────────────────────
${timestamp} IST

═══════════════════════════════════════════════════════
ACTION: Track referral count for ₹199 refund milestones
═══════════════════════════════════════════════════════
    `;

    MailApp.sendEmail({
        to: CONFIG.recipientEmail,
        subject: `🔗 New Referral Registration — ${data.name}`,
        body: emailBody
    });
}

/**
 * Handle Campus Ambassador Application
 */
function handleAmbassador(sheet, data) {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    sheet.appendRow([
        new Date(),
        'Campus Ambassador',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.college || '',
        data.referredBy || 'Direct',
        data.motivation || '',
        'New'
    ]);

    const emailBody = `
═══════════════════════════════════════════════════════
NEW CAMPUS AMBASSADOR APPLICATION — OPTIVRA AI ACADEMY
═══════════════════════════════════════════════════════

👑 APPLICANT INFORMATION
───────────────────────────────────────────────────────
Name:          ${data.name}
Email:         ${data.email}
Phone:         ${data.phone || 'Not provided'}
College:       ${data.college || 'Not provided'}
Referred By:   ${data.referredBy || 'Direct'}

💬 WHY THEY WANT TO BE AMBASSADOR
───────────────────────────────────────────────────────
${data.motivation || 'No message provided'}

⏰ SUBMITTED AT
───────────────────────────────────────────────────────
${timestamp} IST

═══════════════════════════════════════════════════════
ACTION: Review and respond within 24 hours
Target: 100 Elite Campus Ambassadors — ₹1 Lakh Earning Goal
═══════════════════════════════════════════════════════
    `;

    MailApp.sendEmail({
        to: CONFIG.recipientEmail,
        subject: `👑 New Campus Ambassador Application — ${data.name} (${data.college || 'Unknown College'})`,
        body: emailBody
    });
}

/**
 * Test function — run manually in Apps Script to verify email works
 */
function testReferral() {
    const testData = {
        postData: {
            contents: JSON.stringify({
                type: 'referral',
                name: 'Test Student',
                email: 'test@example.com',
                phone: '+91 9876543210',
                referredBy: 'Rohitash Goyal'
            })
        }
    };
    Logger.log(doPost(testData).getContent());
}

function testAmbassador() {
    const testData = {
        postData: {
            contents: JSON.stringify({
                type: 'campus_ambassador',
                name: 'Test Student',
                email: 'test@example.com',
                phone: '+91 9876543210',
                college: 'Lovely Professional University',
                motivation: 'I want to promote AI education on campus.',
                referredBy: ''
            })
        }
    };
    Logger.log(doPost(testData).getContent());
}
