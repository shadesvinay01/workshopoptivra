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
 *
 * WHAT THIS SCRIPT DOES:
 * - Logs all Referral Registrations and Campus Ambassador Applications to a Google Sheet
 * - Sends an email alert to hello@optivra.in for every submission
 * - Sends an auto-confirmation email to the student who submitted
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
        // When sent from browser as URLSearchParams, the JSON arrives in e.parameter.data.
        // When called from test functions (raw JSON body), it arrives in e.postData.contents.
        const rawJson = (e.parameter && e.parameter.data) ? e.parameter.data : e.postData.contents;
        const data = JSON.parse(rawJson);

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

    // Send confirmation to the student
    sendStudentConfirmation(data.email, data.name, 'referral');
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

    // Send confirmation to the student
    sendStudentConfirmation(data.email, data.name, 'ambassador');
}

/**
 * Send an auto-confirmation email back to the student
 */
function sendStudentConfirmation(studentEmail, studentName, formType) {
    let subject = '';
    let body = '';

    if (formType === 'referral') {
        subject = 'You\'re registered! Your referral code is on its way — Optivra AI Academy';
        body = `
Dear ${studentName},

Thank you for registering with Optivra AI Academy! 🎉

We've received your referral registration. Here's what happens next:

✅ WHAT'S NEXT
───────────────────────────────────────────────────────
1. We will generate YOUR unique referral code within 24 hours
2. You'll receive it in a separate email — just share it with friends
3. Every friend who joins using your code earns you ₹20 cashback
4. Hit 10 referrals → Full ₹199 refund + Campus Ambassador invitation!

📋 REFERRAL REWARD TIERS
───────────────────────────────────────────────────────
🏅 3 Referrals = ₹100 Total (₹60 cashback + ₹40 bonus + AI Templates)
🚀 5 Referrals = ₹150 Total (₹100 cashback + ₹50 bonus + Priority Access)
👑 10 Referrals = ₹199 Refund + Ambassador Status + 20–50% Commission

📞 Need help? Reach us at:
📧 hello@optivra.in
📞 +91 74390-71619

See you at the masterclass on 29 March at 10:00 AM IST!

Best regards,
Rohitash & Sarveshwar
Optivra AI Academy

---
Optivra AI Academy · Agentic AI · MLOps · Student Wealth Creation
        `;
    } else if (formType === 'ambassador') {
        subject = 'Ambassador Application Received! We\'ll be in touch — Optivra AI Academy';
        body = `
Dear ${studentName},

Thank you for applying to become an Optivra Campus Ambassador! 👑

We are thrilled by your interest. Your application has been received and our team will review it carefully.

✅ WHAT HAPPENS NEXT
───────────────────────────────────────────────────────
1. Our team will review your application within 24 hours
2. If selected, you will receive a welcome email with your Ambassador Kit
3. You'll get your unique referral link and commission dashboard access
4. Start earning: 20–50% commission on every registration via your link

💰 AMBASSADOR BENEFITS
───────────────────────────────────────────────────────
✔ 20–50% commission per registration you drive
✔ Official Optivra Certificate of Ambassadorship
✔ Internship opportunity & resume credibility
✔ Direct mentorship from Rohitash Goyal & Sarveshwar Mandal
✔ Access to the Elite Ambassador Community

📞 Questions? Contact us:
📧 hello@optivra.in
📞 +91 74390-71619

We look forward to building the AI generation together!

Best regards,
Rohitash & Sarveshwar
Optivra AI Academy

---
Optivra AI Academy · Agentic AI · MLOps · Student Wealth Creation
        `;
    }

    try {
        MailApp.sendEmail({
            to: studentEmail,
            subject: subject,
            body: body
        });
    } catch (error) {
        Logger.log('Error sending confirmation email: ' + error.toString());
    }
}

/**
 * GET handler — returns a simple status page (useful for verifying the script is live)
 */
function doGet() {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', app: 'Optivra AI Academy', version: '2.0' }))
        .setMimeType(ContentService.MimeType.JSON);
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
