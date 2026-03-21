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
        const headers = ['Timestamp', 'Type', 'Name', 'Email', 'Phone', 'College', 'Referred By', 'Motivation', 'Status', 'Referral Code'];
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

    // Auto-generate Referral Code: First 4 letters of name (uppercase) + '10'
    const nameStr = (data.name || '').replace(/[^a-zA-Z]/g, '');
    const refPrefix = nameStr.length > 0 ? nameStr.substring(0, 4).toUpperCase() : 'OPTV';
    const referralCode = refPrefix + '10';

    sheet.appendRow([
        new Date(),
        'Referral',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.college || '',
        data.referredBy || 'Direct',
        data.wantsAmbassador ? 'Requested' : 'No',
        'New',
        referralCode
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
College:       ${data.college || 'Not provided'}
Referred By:   ${data.referredBy || 'Direct (no referrer)'}
Ambassador:    ${data.wantsAmbassador ? 'YES - Wants to be considered' : 'NO'}
Referral Code: ${referralCode}

⏰ SUBMITTED AT
───────────────────────────────────────────────────────
${timestamp} IST

═══════════════════════════════════════════════════════
ACTION: Track referral count for ₹199 refund milestones
═══════════════════════════════════════════════════════
    `;

    MailApp.sendEmail({
        to: CONFIG.recipientEmail,
        subject: `🔗 New Referral Registration — ${data.name} (${referralCode})`,
        body: emailBody
    });

    // Send confirmation to the student
    sendStudentConfirmation(data.email, data.name, data.wantsAmbassador, referralCode);
}

/**
 * Send an auto-confirmation email back to the student
 */
function sendStudentConfirmation(studentEmail, studentName, wantsAmbassador=false, referralCode='') {
    const ambassadorText = wantsAmbassador 
        ? "👑 NOTE: You have opted to become a Campus Ambassador! As soon as you complete 10 referrals, you will be upgraded to Campus Ambassador. Don't worry, you will receive an email for each referral who successfully joins using your link!"
        : "You opted out of the campus ambassador program. Register for the workshop masterclass here: https://tagmango.com/web/checkout/69b97920f4158f62333fca2c";

    const subject = 'You\'re registered! Your Referral Code is inside — Optivra AI Academy';
    const body = `
Dear ${studentName},

Thank you for registering with Optivra AI Academy! 🎉

We've received your referral registration. Your unique Referral Code is instantly generated and active!

🔑 YOUR REFERRAL CODE: ${referralCode}

✅ WHAT'S NEXT
───────────────────────────────────────────────────────
1. Share your Referral Code with friends
2. They use this code while registering on TagMango to get 10% off
3. Every friend who joins using your code earns you ₹20 cashback
4. Hit 10 referrals → Full ₹199 refund + Campus Ambassador invitation!

📱 READY-TO-SEND WHATSAPP / INSTAGRAM MESSAGE
───────────────────────────────────────────────────────
Copy and paste this message to your friends or college groups:

"Hey! I'm attending the Optivra AI Academy Masterclass by IBM & Morgan Stanley Engineers on 29 March. They're teaching how to build AI agents and make money through MLOps. 
You can join too! Use my referral code: ${referralCode} to get 10% off the ticket at checkout.
Register here: https://tagmango.com/web/checkout/69b97920f4158f62333fca2c"
───────────────────────────────────────────────────────

📋 REFERRAL REWARD TIERS
───────────────────────────────────────────────────────
🏅 3 Referrals = ₹100 Total (₹60 cashback + ₹40 bonus + AI Templates)
🚀 5 Referrals = ₹150 Total (₹100 cashback + ₹50 bonus + Priority Access)
👑 10 Referrals = ₹199 Refund + Ambassador Status + 10–30% Commission

${ambassadorText}

📞 Need help? Reach us at:
📧 hello@optivra.in
📞 +91 6280179738
📞 +91 7439071619

See you at the masterclass on 29 March at 10:00 AM IST!

Best Regards,
Optivra AI Academy

---
Optivra AI Academy · Agentic AI · MLOps · Student Wealth Creation
    `;

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
